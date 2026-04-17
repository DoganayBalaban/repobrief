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

  return (
    <>
      <style>{`
        .quota-bar-wrap {
          margin-bottom: 24px;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 4px;
          padding: 12px 16px;
          background: rgba(255,255,255,0.015);
          display: flex; align-items: center; gap: 16px;
        }
        .quota-bar-wrap.quota-full { border-color: rgba(239,68,68,0.2); background: rgba(239,68,68,0.03); }
        .quota-info { flex: 1; min-width: 0; }
        .quota-label {
          font-family: ui-monospace, monospace; font-size: 10px;
          color: #52525b; text-transform: uppercase; letter-spacing: 0.08em;
          margin-bottom: 6px;
        }
        .quota-track {
          height: 3px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden;
          margin-bottom: 6px;
        }
        .quota-fill { height: 100%; border-radius: 2px; transition: width .4s; }
        .quota-fill.ok { background: #a3e635; }
        .quota-fill.warn { background: #fb923c; }
        .quota-fill.full { background: #ef4444; }
        .quota-meta {
          font-family: ui-monospace, monospace; font-size: 10px; color: #3f3f46;
          display: flex; gap: 12px;
        }
        .quota-count { font-family: ui-monospace, monospace; font-size: 20px; font-weight: 800; color: #e4e4e7; letter-spacing: -0.03em; white-space: nowrap; }
        .quota-count-sub { font-size: 11px; font-weight: 400; color: #52525b; }
      `}</style>

      <div>
        {/* Quota widget */}
        <div className={`quota-bar-wrap${used >= FREE_MONTHLY_LIMIT ? " quota-full" : ""}`}>
          <div className="quota-info">
            <p className="quota-label">Monthly analyses</p>
            <div className="quota-track">
              <div
                className={`quota-fill ${pct < 60 ? "ok" : pct < 100 ? "warn" : "full"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="quota-meta">
              <span>{remaining} remaining</span>
              <span>resets {resetsAt}</span>
              {used >= FREE_MONTHLY_LIMIT && (
                <span style={{ color: "#ef4444" }}>limit reached</span>
              )}
            </div>
          </div>
          <span className="quota-count">
            {used}<span className="quota-count-sub"> / {FREE_MONTHLY_LIMIT}</span>
          </span>
        </div>

        <div style={{ marginBottom: 24 }}>
          <p style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            Analyze any public repo
          </p>
          <RepoInputForm basePath="/dashboard" />
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
      </div>
    </>
  );
}
