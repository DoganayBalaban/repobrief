import { auth, signIn, signOut } from "@/auth";
import { getOctokit } from "@/lib/octokit";

export default async function Home() {
  const session = await auth();

  let repos: { id: number; full_name: string; description: string | null; stargazers_count: number; private: boolean }[] = [];

  if (session?.accessToken) {
    const octokit = await getOctokit();
    const { data } = await octokit.rest.repos.listForAuthenticatedUser({
      sort: "updated",
      per_page: 20,
    });
    repos = data.map((r) => ({
      id: r.id,
      full_name: r.full_name,
      description: r.description,
      stargazers_count: r.stargazers_count,
      private: r.private,
    }));
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            RepoBrief
          </h1>
          {session?.user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-500">
                {session.user.name ?? session.user.email}
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
              >
                <button
                  type="submit"
                  className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn("github");
              }}
            >
              <button
                type="submit"
                className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-300"
              >
                Sign in with GitHub
              </button>
            </form>
          )}
        </div>

        {session?.user ? (
          <ul className="flex flex-col gap-3">
            {repos.map((repo) => (
              <li
                key={repo.id}
                className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {repo.full_name}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    {repo.private && (
                      <span className="rounded-full border border-zinc-300 px-2 py-0.5 dark:border-zinc-700">
                        private
                      </span>
                    )}
                    <span>⭐ {repo.stargazers_count}</span>
                  </div>
                </div>
                {repo.description && (
                  <p className="mt-1 text-sm text-zinc-500">{repo.description}</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-zinc-400">
            Sign in to see your repositories.
          </p>
        )}
      </div>
    </div>
  );
}
