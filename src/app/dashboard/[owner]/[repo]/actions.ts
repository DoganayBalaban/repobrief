"use server";

import { getOctokit } from "@/lib/octokit";
import { analyzeRepo, type AnalysisResult } from "@/lib/analyze";

export async function analyzeRepoAction(
  owner: string,
  repo: string
): Promise<{ data: AnalysisResult } | { error: string }> {
  try {
    const octokit = await getOctokit();
    const data = await analyzeRepo(octokit, owner, repo);
    return { data };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Analysis failed." };
  }
}
