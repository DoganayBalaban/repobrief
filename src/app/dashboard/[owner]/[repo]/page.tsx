import { getOctokit } from "@/lib/octokit";
import { fetchFileTree } from "@/lib/file-tree";
import Link from "next/link";

interface Props {
  params: Promise<{ owner: string; repo: string }>;
}

export default async function RepoPage({ params }: Props) {
  const { owner, repo } = await params;
  const octokit = await getOctokit();

  const [{ data: repoData }, files] = await Promise.all([
    octokit.rest.repos.get({ owner, repo }),
    fetchFileTree(octokit, owner, repo),
  ]);

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors mb-4 inline-block"
        >
          ← back
        </Link>
        <h2 className="text-xl font-semibold text-zinc-100">{repoData.full_name}</h2>
        {repoData.description && (
          <p className="mt-1 text-sm text-zinc-400">{repoData.description}</p>
        )}
        <div className="flex gap-3 mt-3 text-xs text-zinc-500 font-mono">
          <span>⭐ {repoData.stargazers_count}</span>
          {repoData.language && <span>· {repoData.language}</span>}
          <span>· {repoData.default_branch}</span>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <p className="text-xs font-mono text-zinc-500 mb-4">
          {files.length} files indexed
        </p>
        <ul className="flex flex-col gap-1 max-h-96 overflow-y-auto">
          {files.map((f) => (
            <li key={f.path} className="font-mono text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
              {f.path}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
