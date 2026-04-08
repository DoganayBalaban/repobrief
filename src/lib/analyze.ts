import Anthropic from "@anthropic-ai/sdk";
import type { Octokit } from "octokit";
import { fetchFileTree } from "./file-tree";
import { fetchKeyFileContents } from "./file-content";
import { buildPrompt } from "./prompt";

export interface AnalysisResult {
  description: string;
  architecture: string;
  file_map: string;
  onboarding: string;
  tech_stack: string; // raw JSON string
  raw: string;        // full Claude response for debugging
}

const client = new Anthropic();

function extractXml(tag: string, text: string): string {
  const match = text.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
  return match ? match[1].trim() : "";
}

export async function analyzeRepo(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<AnalysisResult> {
  // 1. Fetch repo metadata
  const { data: repoData } = await octokit.rest.repos.get({ owner, repo });

  // 2. Fetch file tree
  const fileTree = await fetchFileTree(octokit, owner, repo);

  // 3. Fetch key file contents
  const fileContents = await fetchKeyFileContents(octokit, owner, repo, fileTree);

  // 4. Build prompt
  const { system, user } = buildPrompt(
    {
      owner,
      repo,
      description: repoData.description,
      language: repoData.language ?? null,
      stargazers_count: repoData.stargazers_count,
      default_branch: repoData.default_branch,
    },
    fileTree,
    fileContents
  );

  // 5. Call Claude API
  let response: Anthropic.Message;
  try {
    response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system,
      messages: [{ role: "user", content: user }],
    });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      throw new Error("Claude API rate limit reached. Please try again in a moment.");
    }
    if (error instanceof Anthropic.BadRequestError) {
      throw new Error("Repository content is too large to analyze. Try a smaller repository.");
    }
    throw error;
  }

  // 6. Extract text from response
  const raw = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  // 7. Parse XML sections
  return {
    description: extractXml("description", raw),
    architecture: extractXml("architecture", raw),
    file_map: extractXml("file_map", raw),
    onboarding: extractXml("onboarding", raw),
    tech_stack: extractXml("tech_stack", raw),
    raw,
  };
}
