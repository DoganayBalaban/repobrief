import { getOctokit } from "@/lib/octokit";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function DashboardPage() {
  const octokit = await getOctokit();
  const { data } = await octokit.rest.repos.listForAuthenticatedUser({
    sort: "updated",
    per_page: 20,
  });

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold">Your Repositories</h2>
      <ul className="flex flex-col gap-3">
        {data.map((repo) => {
          const [owner, repoName] = repo.full_name.split("/");
          return (
            <li key={repo.id}>
              <Link href={`/dashboard/${owner}/${repoName}`}>
                <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                  <CardContent className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium">{repo.full_name}</p>
                      {repo.description && (
                        <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
                          {repo.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      {repo.private && (
                        <Badge variant="outline">private</Badge>
                      )}
                      {repo.language && (
                        <Badge variant="secondary">{repo.language}</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        ⭐ {repo.stargazers_count}
                      </span>
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
