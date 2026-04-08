import { Octokit } from "octokit";
import { auth } from "@/auth";

export async function getOctokit() {
  const session = await auth();

  if (!session?.accessToken) {
    throw new Error("Not authenticated");
  }

  return new Octokit({ auth: session.accessToken });
}
