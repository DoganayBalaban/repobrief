import { getOctokit } from "@/lib/octokit";
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

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  Python: "#3572a5",
  Go: "#00add8",
  Rust: "#dea584",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  Ruby: "#701516",
  Swift: "#f05138",
  Kotlin: "#a97bff",
  PHP: "#4f5d95",
  "C#": "#178600",
  Shell: "#89e051",
  Dockerfile: "#384d54",
  CSS: "#563d7c",
  HTML: "#e34c26",
  Vue: "#41b883",
};

export default async function DashboardPage() {
  const octokit = await getOctokit();
  const { data } = await octokit.rest.repos.listForAuthenticatedUser({
    sort: "updated",
    per_page: 30,
  });

  return (
    <>
      <style>{`
        .repos-header {
          display: flex; align-items: baseline; justify-content: space-between;
          margin-bottom: 20px;
        }
        .repos-title {
          font-size: 15px; font-weight: 700; letter-spacing: -0.02em; color: #e4e4e7;
        }
        .repos-count {
          font-family: ui-monospace, monospace; font-size: 11px; color: #52525b;
        }
        .repo-list { display: flex; flex-direction: column; gap: 2px; }
        .repo-card {
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px;
          padding: 14px 16px;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 4px;
          background: rgba(255,255,255,0.015);
          text-decoration: none;
          transition: border-color .15s, background .15s;
          cursor: pointer;
        }
        .repo-card:hover {
          border-color: rgba(163,230,53,0.2);
          background: rgba(163,230,53,0.025);
        }
        .repo-left { min-width: 0; flex: 1; }
        .repo-name {
          font-size: 13px; font-weight: 600; color: #e4e4e7;
          letter-spacing: -0.01em; white-space: nowrap;
          overflow: hidden; text-overflow: ellipsis;
          margin-bottom: 3px;
        }
        .repo-desc {
          font-family: ui-monospace, monospace; font-size: 11px; color: #52525b;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .repo-right {
          display: flex; align-items: center; gap: 12px;
          shrink: 0; flex-shrink: 0;
        }
        .repo-lang {
          display: flex; align-items: center; gap-x: 5px; gap: 5px;
          font-family: ui-monospace, monospace; font-size: 11px; color: #71717a;
        }
        .lang-dot {
          width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
        }
        .repo-stars {
          font-family: ui-monospace, monospace; font-size: 11px; color: #52525b;
          display: flex; align-items: center; gap: 3px;
        }
        .repo-time {
          font-family: ui-monospace, monospace; font-size: 11px; color: #3f3f46;
          min-width: 52px; text-align: right;
        }
        .repo-private {
          font-family: ui-monospace, monospace; font-size: 10px;
          color: #a3e635; border: 1px solid rgba(163,230,53,0.2);
          padding: 1px 6px; border-radius: 3px;
        }
        .repo-arrow { color: #3f3f46; font-size: 12px; }
      `}</style>

      <div>
        <div className="repos-header">
          <h1 className="repos-title">Repositories</h1>
          <span className="repos-count">{data.length} repos</span>
        </div>

        <ul className="repo-list">
          {data.map((repo) => {
            const [owner, repoName] = repo.full_name.split("/");
            const langColor = repo.language ? (LANG_COLORS[repo.language] ?? "#71717a") : null;

            return (
              <li key={repo.id}>
                <Link href={`/dashboard/${owner}/${repoName}`} className="repo-card">
                  <div className="repo-left">
                    <p className="repo-name">{repo.full_name}</p>
                    <p className="repo-desc">
                      {repo.description ?? "No description"}
                    </p>
                  </div>

                  <div className="repo-right">
                    {repo.private && <span className="repo-private">private</span>}

                    {repo.language && langColor && (
                      <span className="repo-lang">
                        <span className="lang-dot" style={{ background: langColor }} />
                        {repo.language}
                      </span>
                    )}

                    <span className="repo-stars">
                      ⭐ {repo.stargazers_count}
                    </span>

                    <span className="repo-time">
                      {relativeTime(repo.updated_at ?? repo.pushed_at ?? "")}
                    </span>

                    <span className="repo-arrow">→</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
