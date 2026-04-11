import { analyzeRepoStream } from "@/lib/analyze-stream";
import { getOctokit } from "@/lib/octokit";

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
    const stream = await analyzeRepoStream(octokit, owner, repo);
    return new Response(stream, {
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
