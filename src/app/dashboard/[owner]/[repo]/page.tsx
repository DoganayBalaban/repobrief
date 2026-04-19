import { getOctokit } from "@/lib/octokit";
import { fetchFileTree } from "@/lib/file-tree";
import { RepoDetailClient } from "@/components/repo-detail-client";

interface Props {
  params: Promise<{ owner: string; repo: string }>;
}

interface WeekActivity {
  week: number;
  total: number;
  days: number[];
}

export default async function RepoPage({ params }: Props) {
  const { owner, repo } = await params;
  const octokit = await getOctokit();

  const [{ data: repoData }, files] = await Promise.all([
    octokit.rest.repos.get({ owner, repo }),
    fetchFileTree(octokit, owner, repo).catch(() => []),
  ]);

  let commitWeeks: WeekActivity[] = [];
  try {
    const { data, status } = await octokit.rest.repos.getCommitActivityStats({ owner, repo });
    if (status === 200 && Array.isArray(data) && data.length > 0) {
      commitWeeks = data as WeekActivity[];
    }
  } catch { /* no-op */ }

  return (
    <RepoDetailClient
      owner={owner}
      repo={repo}
      htmlUrl={repoData.html_url}
      description={repoData.description ?? null}
      language={repoData.language ?? null}
      isPrivate={repoData.private}
      stars={repoData.stargazers_count}
      issues={repoData.open_issues_count}
      fileCount={files.length > 0 ? String(files.length) : "—"}
      updatedAt={
        repoData.updated_at
          ? new Date(repoData.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : null
      }
      commitWeeks={commitWeeks}
    />
  );
}
