export interface RepoIdentifier {
  owner: string;
  repo: string;
}

/**
 * Parses a GitHub repo from a URL or "owner/repo" shorthand.
 * Accepted formats:
 *   https://github.com/owner/repo
 *   https://github.com/owner/repo.git
 *   github.com/owner/repo
 *   owner/repo
 */
export function parseRepo(input: string): RepoIdentifier {
  const cleaned = input.trim().replace(/\.git$/, "");

  // Full URL
  const urlMatch = cleaned.match(
    /(?:https?:\/\/)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/
  );
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2] };
  }

  // owner/repo shorthand
  const shortMatch = cleaned.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
  if (shortMatch) {
    return { owner: shortMatch[1], repo: shortMatch[2] };
  }

  throw new Error(`Invalid GitHub repo: "${input}"`);
}
