import type { Octokit } from "octokit";

export interface TreeFile {
  path: string;
  size: number | undefined;
}

// Directories that are never useful for analysis
const IGNORED_DIRS = new Set([
  "node_modules", ".git", "dist", "build", ".next", "out",
  ".turbo", "coverage", ".nyc_output", "__pycache__", ".venv",
  "venv", "vendor", "target", ".gradle", "Pods", ".expo",
  "storybook-static", ".cache", "tmp", "temp",
]);

// Exact filenames to skip
const IGNORED_FILES = new Set([
  "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "bun.lockb",
  ".DS_Store", "Thumbs.db", ".gitkeep",
]);

// Extensions that carry no semantic value for Claude
const IGNORED_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".webp", ".avif",
  ".woff", ".woff2", ".ttf", ".eot", ".otf",
  ".mp4", ".mp3", ".wav", ".ogg", ".mov",
  ".pdf", ".zip", ".tar", ".gz", ".rar",
  ".map",       // source maps
  ".lock",
  ".min.js", ".min.css",
]);

const MAX_FILES = 150;

function isIgnored(path: string): boolean {
  const parts = path.split("/");

  // Drop if any segment is an ignored directory
  for (const part of parts.slice(0, -1)) {
    if (IGNORED_DIRS.has(part)) return true;
  }

  const filename = parts[parts.length - 1];

  if (IGNORED_FILES.has(filename)) return true;

  // Check extension (handle .min.js etc. by checking last two dots)
  const ext = filename.includes(".")
    ? "." + filename.split(".").slice(1).join(".")
    : "";
  const simpleExt = filename.includes(".")
    ? "." + filename.split(".").pop()!
    : "";

  if (IGNORED_EXTENSIONS.has(ext) || IGNORED_EXTENSIONS.has(simpleExt)) return true;

  return false;
}

export async function fetchFileTree(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<TreeFile[]> {
  // Get default branch SHA
  const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
  const defaultBranch = repoData.default_branch;

  const { data: branchData } = await octokit.rest.repos.getBranch({
    owner,
    repo,
    branch: defaultBranch,
  });
  const treeSha = branchData.commit.sha;

  // Fetch full recursive tree
  const { data: treeData } = await octokit.rest.git.getTree({
    owner,
    repo,
    tree_sha: treeSha,
    recursive: "1",
  });

  if (treeData.truncated) {
    console.warn(`[file-tree] Tree truncated for ${owner}/${repo} — very large repo`);
  }

  const files = (treeData.tree ?? [])
    .filter((item) => item.type === "blob" && item.path)
    .filter((item) => !isIgnored(item.path!))
    .slice(0, MAX_FILES)
    .map((item) => ({
      path: item.path!,
      size: item.size,
    }));

  return files;
}
