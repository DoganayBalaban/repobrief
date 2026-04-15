import { analyzeRepoStream } from "@/lib/analyze-stream";
import { getOctokit, getPublicOctokit } from "@/lib/octokit";
import { db } from "@/lib/db";
import { parseAnalysisXml } from "@/lib/parse-xml";
import type { AnalysisResult } from "@/lib/parse-xml";
import { hashIp } from "@/lib/ip-hash";
import { auth } from "@/auth";
import type { Octokit } from "octokit";

const CACHE_MAX_AGE_DAYS = 7;
const FREE_MONTHLY_LIMIT = 5;
const ANON_DAILY_LIMIT = 2;

function isCacheStale(createdAt: Date): boolean {
  const age = Date.now() - createdAt.getTime();
  return age > CACHE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
}

function resultToXml(r: AnalysisResult): string {
  const sections = [
    ["description", r.description],
    ["tech_stack", r.tech_stack],
    ["architecture", r.architecture],
    ["file_map", r.file_map],
    ["onboarding", r.onboarding],
  ] as const;
  return sections
    .filter(([, v]) => v)
    .map(([tag, v]) => `<${tag}>${v}</${tag}>`)
    .join("\n");
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  const owner = String((body as { owner?: unknown }).owner ?? "").trim();
  const repo = String((body as { repo?: unknown }).repo ?? "").trim();

  if (!owner || !repo) {
    return Response.json(
      { error: "owner and repo are required" },
      { status: 400 }
    );
  }

  const force = (body as { force?: unknown }).force === true;

  try {
    const session = await auth();
    const userId = (session as { githubId?: string } | null)?.githubId
      ?? session?.user?.email
      ?? null;

    let octokit: Octokit;
    let ipHash: string | null = null;

    if (userId) {
      octokit = await getOctokit();

      // Rate limit check: count analyses this month for this user
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const usedThisMonth = await db.analysis.count({
        where: { userId, createdAt: { gte: monthStart } },
      });

      if (usedThisMonth >= FREE_MONTHLY_LIMIT) {
        return Response.json(
          { error: "Free plan limit reached (5 analyses/month). Upgrade to Pro for unlimited access." },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": String(FREE_MONTHLY_LIMIT),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
            },
          }
        );
      }
    } else {
      // Anonymous path — unauthenticated Octokit for public repos
      octokit = getPublicOctokit();

      const rawIp = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
      if (rawIp) {
        ipHash = await hashIp(rawIp);
        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);
        const usedToday = await db.analysis.count({
          where: { ipHash, userId: null, createdAt: { gte: todayStart } },
        });

        if (usedToday >= ANON_DAILY_LIMIT) {
          return Response.json(
            { error: "Anonymous limit reached (2/day). Sign in for 5 free analyses/month." },
            { status: 429 }
          );
        }
      }
    }

    // Fetch latest commit SHA for cache keying
    const { data: commits } = await octokit.rest.repos.listCommits({
      owner,
      repo,
      per_page: 1,
    });
    const commitSha = commits[0]?.sha ?? "unknown";

    // Cache hit check: same commit SHA + not stale (skip if force refresh)
    if (commitSha !== "unknown" && !force) {
      const cached = await db.analysis.findUnique({
        where: { owner_repo_commitSha: { owner, repo, commitSha } },
      });

      if (cached && !isCacheStale(cached.createdAt)) {
        const result = cached.result as unknown as AnalysisResult;
        const xml = resultToXml(result);
        const encoder = new TextEncoder();

        return new Response(encoder.encode(xml), {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-store",
            "X-Cache": "HIT",
            "X-Cache-Age": String(Math.floor((Date.now() - cached.createdAt.getTime()) / 1000)),
            "X-Commit-SHA": commitSha.slice(0, 7),
            // Cache hits don't consume quota — no rate limit headers needed
          },
        });
      }
    }

    // Cache miss: run Claude analysis
    const sourceStream = await analyzeRepoStream(octokit, owner, repo);

    // Wrap the stream: accumulate full text, then save to DB when done
    const decoder = new TextDecoder();
    let accumulated = "";
    let streamComplete = false;

    const wrappedStream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const reader = sourceStream.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              streamComplete = true;
              break;
            }
            if (value) {
              accumulated += decoder.decode(value, { stream: true });
              controller.enqueue(value);
            }
          }
          accumulated += decoder.decode();
        } finally {
          controller.close();

          // Only save to DB if stream completed fully — never write partial XML
          if (streamComplete && accumulated && commitSha !== "unknown") {
            const parsed = parseAnalysisXml(accumulated);
            db.analysis
              .upsert({
                where: { owner_repo_commitSha: { owner, repo, commitSha } },
                create: {
                  owner,
                  repo,
                  commitSha,
                  result: parsed as object,
                  userId,
                  ipHash,
                },
                update: {
                  result: parsed as object,
                  viewCount: 0,
                  ...(userId ? { userId } : {}),
                  // do not overwrite ipHash on update
                },
              })
              .catch(() => {
                // Non-critical: don't fail the response if DB write fails
              });
          }
        }
      },
      cancel() {
        // Stream cancelled by client — nothing to do
      },
    });

    return new Response(wrappedStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Cache": "MISS",
        "X-Commit-SHA": commitSha.slice(0, 7),
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Analysis failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
