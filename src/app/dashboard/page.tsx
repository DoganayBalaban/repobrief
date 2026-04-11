import { getOctokit } from "@/lib/octokit";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default async function DashboardPage() {
  const octokit = await getOctokit();
  const { data } = await octokit.rest.repos.listForAuthenticatedUser({
    sort: "updated",
    per_page: 20,
  });

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold">Your Repositories</h2>
      <ul className="flex flex-col gap-2">
        {data.map((repo) => {
          const [owner, repoName] = repo.full_name.split("/");
          return (
            <li key={repo.id}>
              <Link href={`/dashboard/${owner}/${repoName}`}>
                <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                  <CardContent className="flex items-center justify-between py-3 px-4">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{repo.full_name}</p>
                      {repo.description ? (
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                          {repo.description}
                        </p>
                      ) : (
                        <p className="mt-0.5 text-xs text-muted-foreground/50 italic">No description</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      {repo.private && (
                        <Badge variant="outline" className="text-xs">private</Badge>
                      )}
                      {repo.language && (
                        <Badge variant="secondary" className="text-xs">{repo.language}</Badge>
                      )}
                      <span className="text-xs text-muted-foreground tabular-nums">
                        ⭐ {repo.stargazers_count}
                      </span>
                      <span className="text-xs text-muted-foreground/60 tabular-nums w-16 text-right">
                        {relativeTime(repo.updated_at ?? repo.pushed_at ?? "")}
                      </span>
                      <span className="text-muted-foreground/40 text-sm">→</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
