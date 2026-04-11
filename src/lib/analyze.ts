import Anthropic from "@anthropic-ai/sdk";
import type { Octokit } from "octokit";
import { fetchKeyFileContents } from "./file-content";
import { fetchFileTree } from "./file-tree";
import { buildPrompt } from "./prompt";
import { parseAnalysisXml } from "./parse-xml";

export type { AnalysisResult } from "./parse-xml";
export { parseAnalysisXml } from "./parse-xml";

const client = new Anthropic();

export async function analyzeRepo(
  octokit: Octokit,
  owner: string,
  repo: string,
): Promise<ReturnType<typeof parseAnalysisXml>> {
  const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
  const fileTree = await fetchFileTree(octokit, owner, repo);
  const fileContents = await fetchKeyFileContents(octokit, owner, repo, fileTree);

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
    fileContents,
  );

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

  const raw = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  return parseAnalysisXml(raw);
}
