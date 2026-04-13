import { analyzeRepoStream } from "@/lib/analyze-stream";
import { getOctokit } from "@/lib/octokit";
import { db } from "@/lib/db";
import { parseAnalysisXml } from "@/lib/parse-xml";

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

  try {
    const octokit = await getOctokit();

    // Fetch latest commit SHA for cache keying
    const { data: commits } = await octokit.rest.repos.listCommits({
      owner,
      repo,
      per_page: 1,
    });
    const commitSha = commits[0]?.sha ?? "unknown";

    const sourceStream = await analyzeRepoStream(octokit, owner, repo);

    // Wrap the stream: accumulate full text, then save to DB when done
    const decoder = new TextDecoder();
    let accumulated = "";

    const wrappedStream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const reader = sourceStream.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
              accumulated += decoder.decode(value, { stream: true });
              controller.enqueue(value);
            }
          }
          accumulated += decoder.decode();
        } finally {
          controller.close();

          // Fire-and-forget: save analysis to DB
          if (accumulated && commitSha !== "unknown") {
            const parsed = parseAnalysisXml(accumulated);
            db.analysis
              .upsert({
                where: { owner_repo_commitSha: { owner, repo, commitSha } },
                create: {
                  owner,
                  repo,
                  commitSha,
                  result: parsed as object,
                },
                update: {
                  result: parsed as object,
                  viewCount: 0,
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
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Analysis failed.";
    if (message === "Not authenticated") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return Response.json({ error: message }, { status: 500 });
  }
}
