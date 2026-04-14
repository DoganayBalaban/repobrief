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
        .analyses-header {
          display: flex; align-items: baseline; justify-content: space-between;
          margin-bottom: 20px;
        }
        .analyses-title {
          font-size: 15px; font-weight: 700; letter-spacing: -0.02em; color: #e4e4e7;
        }
        .analyses-count {
          font-family: ui-monospace, monospace; font-size: 11px; color: #52525b;
        }
        .analyses-back {
          font-family: ui-monospace, monospace; font-size: 11px; color: #52525b;
          text-decoration: none; display: inline-flex; align-items: center; gap: 5px;
          margin-bottom: 20px; transition: color .15s;
        }
        .analyses-back:hover { color: #a1a1aa; }
        .analysis-list { display: flex; flex-direction: column; gap: 2px; }
        .analysis-card {
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; padding: 14px 16px;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 4px;
          background: rgba(255,255,255,0.015);
          text-decoration: none;
          transition: border-color .15s, background .15s;
        }
        .analysis-card:hover {
          border-color: rgba(163,230,53,0.2);
          background: rgba(163,230,53,0.025);
        }
        .analysis-left { min-width: 0; flex: 1; }
        .analysis-repo {
          font-size: 13px; font-weight: 600; color: #e4e4e7;
          letter-spacing: -0.01em;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin-bottom: 4px;
        }
        .analysis-meta {
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
        }
        .analysis-sha {
          font-family: ui-monospace, monospace; font-size: 10px;
          color: #3f3f46; border: 1px solid rgba(255,255,255,0.06);
          padding: 1px 6px; border-radius: 3px;
        }
        .analysis-views {
          font-family: ui-monospace, monospace; font-size: 11px; color: #52525b;
        }
        .analysis-right {
          display: flex; align-items: center; gap: 12px; flex-shrink: 0;
        }
        .analysis-time {
          font-family: ui-monospace, monospace; font-size: 11px; color: #3f3f46;
          min-width: 52px; text-align: right;
        }
        .analysis-arrow { color: #3f3f46; font-size: 12px; }
        .empty-state {
          text-align: center; padding: 60px 24px;
          border: 1px dashed rgba(255,255,255,0.06); border-radius: 4px;
        }
        .empty-title {
          font-size: 14px; font-weight: 600; color: #52525b; margin-bottom: 8px;
        }
        .empty-desc {
          font-family: ui-monospace, monospace; font-size: 11px; color: #3f3f46;
          margin-bottom: 20px;
        }
        .empty-link {
          font-family: ui-monospace, monospace; font-size: 11px; font-weight: 700;
          color: #000; background: #a3e635; padding: 6px 14px;
          border-radius: 3px; text-decoration: none; transition: background .15s;
        }
        .empty-link:hover { background: #bef264; }
      `}</style>

      <div>
        <Link href="/dashboard" className="analyses-back">← repositories</Link>

        <div className="analyses-header">
          <h1 className="analyses-title">My Analyses</h1>
          <span className="analyses-count">{analyses.length} total</span>
        </div>

        {analyses.length === 0 ? (
          <div className="empty-state">
            <p className="empty-title">No analyses yet</p>
            <p className="empty-desc">Pick a repo and run your first analysis.</p>
            <Link href="/dashboard" className="empty-link">Browse repositories →</Link>
          </div>
        ) : (
          <ul className="analysis-list">
            {analyses.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/analysis/${a.owner}/${a.repo}`}
                  className="analysis-card"
                >
                  <div className="analysis-left">
                    <p className="analysis-repo">{a.owner}/{a.repo}</p>
                    <div className="analysis-meta">
                      <span className="analysis-sha">{a.commitSha.slice(0, 7)}</span>
                      <span className="analysis-views">👁 {a.viewCount}</span>
                    </div>
                  </div>
                  <div className="analysis-right">
                    <span className="analysis-time">{timeAgo(a.createdAt)}</span>
                    <span className="analysis-arrow">→</span>
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
