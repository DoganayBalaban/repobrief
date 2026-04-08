import type { Octokit } from "octokit";
import { selectKeyFiles, getCharLimit } from "./file-score";
import type { TreeFile } from "./file-tree";

export interface FileContent {
  path: string;
  score: number;
  content: string;
  truncated: boolean;
}

async function fetchOne(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string,
  score: number
): Promise<FileContent | null> {
  try {
    const { data, headers } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });

    // Warn if rate limit is running low
    const remaining = Number(headers["x-ratelimit-remaining"] ?? 100);
    if (remaining < 50) {
      console.warn(`[file-content] GitHub rate limit low: ${remaining} requests remaining`);
    }

    if (Array.isArray(data) || data.type !== "file") return null;

    const raw = Buffer.from(data.content, "base64").toString("utf-8");
    const limit = getCharLimit(path);
    const truncated = raw.length > limit;

    return {
      path,
      score,
      content: truncated ? raw.slice(0, limit) + "\n... [truncated]" : raw,
      truncated,
    };
  } catch {
    return null;
  }
}

export async function fetchKeyFileContents(
  octokit: Octokit,
  owner: string,
  repo: string,
  fileTree: TreeFile[]
): Promise<FileContent[]> {
  const keyFiles = selectKeyFiles(fileTree);

  const results = await Promise.all(
    keyFiles.map((f) => fetchOne(octokit, owner, repo, f.path, f.score))
  );

  return results.filter((r): r is FileContent => r !== null);
}
