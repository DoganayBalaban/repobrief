import Anthropic from "@anthropic-ai/sdk";
import type { Octokit } from "octokit";
import { fetchFileTree } from "./file-tree";
import { fetchKeyFileContents } from "./file-content";
import { buildPrompt } from "./prompt";

const client = new Anthropic();

export async function analyzeRepoStream(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<ReadableStream<Uint8Array>> {
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

  // 5. Start streaming Claude API call
  let stream: Anthropic.Stream<Anthropic.RawMessageStreamEvent>;
  try {
    stream = client.messages.stream({
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

  // 6. Convert to Web ReadableStream of UTF-8 encoded text chunks
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (error) {
        if (error instanceof Anthropic.RateLimitError) {
          controller.error(new Error("Claude API rate limit reached. Please try again in a moment."));
        } else if (error instanceof Anthropic.BadRequestError) {
          controller.error(new Error("Repository content is too large to analyze. Try a smaller repository."));
        } else {
          controller.error(error);
        }
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });
}
