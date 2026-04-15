import { Octokit } from "octokit";
import { auth } from "@/auth";

export async function getOctokit() {
  const session = await auth();
  const accessToken = (session as { accessToken?: string } | null)
    ?.accessToken;

  if (!accessToken) {
    throw new Error("Not authenticated");
  }

  return new Octokit({ auth: accessToken });
}

/** Unauthenticated Octokit for public repos — 60 req/hour limit. */
export function getPublicOctokit(): Octokit {
  return new Octokit();
}
