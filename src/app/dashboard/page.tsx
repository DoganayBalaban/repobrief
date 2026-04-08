import { getOctokit } from "@/lib/octokit";
import Link from "next/link";

export default async function DashboardPage() {
  const octokit = await getOctokit();
  const { data } = await octokit.rest.repos.listForAuthenticatedUser({
    sort: "updated",
    per_page: 20,
  });

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold text-zinc-100">
        Your Repositories
      </h2>
      <ul className="flex flex-col gap-3">
        {data.map((repo) => {
          const [owner, repoName] = repo.full_name.split("/");
          return (
            <li key={repo.id}>
              <Link
                href={`/dashboard/${owner}/${repoName}`}
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-700 hover:bg-zinc-800/60 transition-colors"
              >
                <div>
                  <span className="font-medium text-zinc-100">{repo.full_name}</span>
                  {repo.description && (
                    <p className="mt-1 text-sm text-zinc-500">{repo.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-500 shrink-0 ml-4">
                  {repo.private && (
                    <span className="rounded-full border border-zinc-700 px-2 py-0.5">
                      private
                    </span>
                  )}
                  <span>⭐ {repo.stargazers_count}</span>
                  <span className="text-zinc-700">→</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
