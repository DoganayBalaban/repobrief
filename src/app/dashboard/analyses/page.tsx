import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default async function MyAnalysesPage() {
  const session = await auth();
  const userId = (session as { githubId?: string } | null)?.githubId
    ?? session?.user?.email
    ?? null;

  if (!userId) redirect("/");

  const analyses = await db.analysis.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <>
      <style>{`
        .an-back {
          font-family: var(--mono); font-size: 11px; color: var(--muted);
          text-decoration: none; display: inline-flex; align-items: center; gap: 5px;
          margin-bottom: 20px; transition: color .15s;
        }
        .an-back:hover { color: var(--text); }

        .an-header {
          display: flex; align-items: baseline; justify-content: space-between;
          margin-bottom: 20px;
        }
        .an-title {
          font-family: var(--serif);
          font-size: 1.4rem; font-weight: 700;
          letter-spacing: -0.02em; color: var(--text);
        }
        .an-count {
          font-family: var(--mono); font-size: 11px; color: var(--dim);
        }

        .an-list { display: flex; flex-direction: column; gap: 2px; }
        .an-card {
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; padding: 14px 16px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: #fff;
          text-decoration: none;
          transition: border-color .15s, background .15s, box-shadow .15s;
        }
        .an-card:hover {
          border-color: rgba(217,119,87,0.3);
          background: rgba(217,119,87,0.025);
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .an-left { min-width: 0; flex: 1; }
        .an-repo {
          font-size: 13px; font-weight: 600; color: var(--text);
          letter-spacing: -0.01em;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin-bottom: 4px;
        }
        .an-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .an-sha {
          font-family: var(--mono); font-size: 10px;
          color: var(--dim); border: 1px solid var(--border);
          background: var(--bg-alt);
          padding: 1px 7px; border-radius: 4px;
        }
        .an-views {
          font-family: var(--mono); font-size: 11px; color: var(--muted);
        }
        .an-right {
          display: flex; align-items: center; gap: 12px; flex-shrink: 0;
        }
        .an-time {
          font-family: var(--mono); font-size: 11px; color: var(--dim);
          min-width: 52px; text-align: right;
        }
        .an-arrow { color: var(--dim); font-size: 12px; }

        .an-empty {
          text-align: center; padding: 64px 24px;
          border: 1px dashed rgba(0,0,0,0.1); border-radius: 12px;
          background: #fff;
        }
        .an-empty-title {
          font-family: var(--serif);
          font-size: 1.1rem; font-weight: 700; color: var(--text);
          margin-bottom: 8px;
        }
        .an-empty-desc {
          font-size: 13px; font-weight: 300; color: var(--muted);
          margin-bottom: 22px; line-height: 1.7;
        }
        .an-empty-link {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 13px; font-weight: 600;
          color: #fff; background: var(--text);
          padding: 11px 20px; border-radius: 8px;
          text-decoration: none; transition: opacity .15s;
        }
        .an-empty-link:hover { opacity: 0.8; }
      `}</style>

      <div>
        <Link href="/dashboard" className="an-back">← Repositories</Link>

        <div className="an-header">
          <h1 className="an-title">My Analyses</h1>
          <span className="an-count">{analyses.length} total</span>
        </div>

        {analyses.length === 0 ? (
          <div className="an-empty">
            <p className="an-empty-title">No analyses yet</p>
            <p className="an-empty-desc">Pick a repo and run your first analysis.</p>
            <Link href="/dashboard" className="an-empty-link">Browse repositories →</Link>
          </div>
        ) : (
          <ul className="an-list" style={{ listStyle: "none" }}>
            {analyses.map((a) => (
              <li key={a.id}>
                <Link href={`/analysis/${a.owner}/${a.repo}`} className="an-card">
                  <div className="an-left">
                    <p className="an-repo">{a.owner}/{a.repo}</p>
                    <div className="an-meta">
                      <span className="an-sha">{a.commitSha.slice(0, 7)}</span>
                      <span className="an-views">👁 {a.viewCount}</span>
                    </div>
                  </div>
                  <div className="an-right">
                    <span className="an-time">{timeAgo(a.createdAt)}</span>
                    <span className="an-arrow">→</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
