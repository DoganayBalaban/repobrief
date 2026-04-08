import { getOctokit } from "@/lib/octokit";
import { fetchFileTree } from "@/lib/file-tree";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnalyzeButton } from "@/components/analyze-button";
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
    <div className="flex flex-col gap-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link href="/dashboard">← Back</Link>
        </Button>
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>{repoData.full_name}</CardTitle>
                {repoData.description && (
                  <CardDescription className="mt-1">
                    {repoData.description}
                  </CardDescription>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {repoData.private && <Badge variant="outline">private</Badge>}
                {repoData.language && (
                  <Badge variant="secondary">{repoData.language}</Badge>
                )}
              </div>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground font-mono pt-1">
              <span>⭐ {repoData.stargazers_count}</span>
              <span>branch: {repoData.default_branch}</span>
              <span>
                {repoData.open_issues_count} open issue
                {repoData.open_issues_count !== 1 ? "s" : ""}
              </span>
            </div>
          </CardHeader>
        </Card>
      </div>

      <AnalyzeButton owner={owner} repo={repo} />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">File Tree</CardTitle>
          <CardDescription>{files.length} files indexed</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="max-h-96 overflow-y-auto flex flex-col gap-1">
            {files.map((f) => (
              <li
                key={f.path}
                className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {f.path}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
