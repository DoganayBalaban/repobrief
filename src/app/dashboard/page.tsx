import { getOctokit } from "@/lib/octokit";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { RepoList } from "@/components/repo-list";
import { RepoInputForm } from "@/components/repo-input-form";

const FREE_MONTHLY_LIMIT = 5;

export default async function DashboardPage() {
  const session = await auth();
  const userId = (session as { githubId?: string } | null)?.githubId
    ?? session?.user?.email
    ?? null;

  const octokit = await getOctokit();
  const { data } = await octokit.rest.repos.listForAuthenticatedUser({
    sort: "updated",
    per_page: 30,
  });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const used = userId
    ? await db.analysis.count({ where: { userId, createdAt: { gte: monthStart } } })
    : 0;
  const remaining = Math.max(0, FREE_MONTHLY_LIMIT - used);
  const pct = Math.min(100, (used / FREE_MONTHLY_LIMIT) * 100);
  const resetsAt = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    .toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const isFull = used >= FREE_MONTHLY_LIMIT;

  return (
    <>
      <style>{`
        .dash-top {
          display: grid; grid-template-columns: 1fr auto;
          gap: 16px; align-items: start;
          margin-bottom: 32px;
        }
        @media (max-width: 680px) { .dash-top { grid-template-columns: 1fr; } }

        .dash-analyze-wrap {}
        .dash-analyze-label {
          font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--muted);
          margin-bottom: 8px;
        }

        .quota-card {
          background: #fff; border: 1px solid var(--border);
          border-radius: 12px; padding: 16px 20px;
          min-width: 200px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .quota-card.full { border-color: rgba(239,68,68,0.2); background: #fff8f8; }
        .quota-top {
          display: flex; align-items: baseline; justify-content: space-between;
          margin-bottom: 10px;
        }
        .quota-label {
          font-family: var(--mono); font-size: 10px; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--dim);
        }
        .quota-count {
          font-family: var(--serif); font-size: 22px; font-weight: 700;
          letter-spacing: -0.03em; color: var(--text);
        }
        .quota-count sub { font-size: 13px; font-weight: 400; color: var(--muted); font-family: var(--sans); }
        .quota-track {
          height: 3px; background: rgba(0,0,0,0.07);
          border-radius: 2px; overflow: hidden; margin-bottom: 8px;
        }
        .quota-fill { height: 100%; border-radius: 2px; transition: width .4s; }
        .quota-fill.ok   { background: var(--coral); }
        .quota-fill.warn { background: #e08040; }
        .quota-fill.full { background: #ef4444; }
        .quota-meta {
          font-family: var(--mono); font-size: 10px;
          color: var(--dim); display: flex; gap: 10px;
        }
        .quota-meta .limit { color: #ef4444; }
      `}</style>

      <div className="dash-top">
        <div className="dash-analyze-wrap">
          <p className="dash-analyze-label">Analyze any public repo</p>
          <RepoInputForm basePath="/dashboard" theme="light" />
        </div>

        <div className={`quota-card${isFull ? " full" : ""}`}>
          <div className="quota-top">
            <p className="quota-label">Monthly analyses</p>
            <span className="quota-count">
              {used}<sub> / {FREE_MONTHLY_LIMIT}</sub>
            </span>
          </div>
          <div className="quota-track">
            <div
              className={`quota-fill ${pct < 60 ? "ok" : pct < 100 ? "warn" : "full"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="quota-meta">
            <span>{remaining} remaining</span>
            <span>resets {resetsAt}</span>
            {isFull && <span className="limit">limit reached</span>}
          </div>
        </div>
      </div>

      <RepoList repos={data.map(r => ({
        id: r.id,
        full_name: r.full_name,
        description: r.description ?? null,
        language: r.language ?? null,
        private: r.private,
        stargazers_count: r.stargazers_count,
        updated_at: r.updated_at ?? null,
        pushed_at: r.pushed_at ?? null,
      }))} />
    </>
  );
}
