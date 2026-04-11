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
