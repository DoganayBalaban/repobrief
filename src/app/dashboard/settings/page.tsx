import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";

const FREE_MONTHLY_LIMIT = 5;

const PLANS = [
  {
    id: "free",
    name: "FREE",
    price: "$0",
    period: "forever",
    features: ["5 analyses / month", "Public & private repos", "AI-generated brief", "Architecture diagram"],
    current: true,
  },
  {
    id: "pro",
    name: "PRO",
    price: "$9",
    period: "/ month",
    features: ["Unlimited analyses", "Public & private repos", "AI-generated brief", "Architecture diagram", "Export to PDF / Markdown", "Priority processing"],
    current: false,
  },
  {
    id: "team",
    name: "TEAM",
    price: "$29",
    period: "/ month",
    features: ["Everything in Pro", "5 team members", "Shared analysis history", "API access", "Slack integration", "Priority support"],
    current: false,
  },
];

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/");

  const userId =
    (session as { githubId?: string } | null)?.githubId ??
    session?.user?.email ??
    null;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const used = userId
    ? await db.analysis.count({ where: { userId, createdAt: { gte: monthStart } } })
    : 0;
  const remaining = Math.max(0, FREE_MONTHLY_LIMIT - used);
  const pct = Math.min(100, (used / FREE_MONTHLY_LIMIT) * 100);
  const daysLeft = Math.ceil((nextReset.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const resetsAt = nextReset.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const user = session.user;
  const userInitials = (user.name ?? user.email ?? "??")
    .split(/\s+/)
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <style>{`
        .cfg-root {
          padding: 40px 40px 80px;
          max-width: 860px;
        }

        /* ── Page header ── */
        .cfg-header {
          padding-bottom: 32px;
          border-bottom: 1px solid var(--line-soft);
          margin-bottom: 48px;
        }
        .cfg-eyebrow {
          font-size: 10px; letter-spacing: 0.14em;
          color: var(--ink-muted); text-transform: uppercase;
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 14px;
        }
        .cfg-eyebrow-dot {
          width: 6px; height: 6px;
          background: var(--accent); border-radius: 50%;
        }
        .cfg-title {
          font-size: clamp(28px, 3vw, 40px);
          line-height: 1; letter-spacing: -0.025em; color: var(--ink);
        }
        .cfg-title .accent {
          color: var(--accent);
          font-family: var(--font-instrument, Georgia, serif);
          font-style: italic;
        }

        /* ── Section ── */
        .cfg-section {
          margin-bottom: 48px;
        }
        .cfg-section-label {
          font-size: 10px; letter-spacing: 0.12em;
          color: var(--ink-muted); text-transform: uppercase;
          margin-bottom: 16px;
          display: flex; align-items: center; gap: 10px;
        }
        .cfg-section-label::after {
          content: "";
          flex: 1; height: 1px;
          background: var(--line-soft);
        }

        /* ── Profile card ── */
        .cfg-profile {
          border: 1px solid var(--line-soft);
          display: flex; align-items: center; gap: 20px;
          padding: 20px 24px;
          background: var(--bg-elevated);
        }
        .cfg-avatar {
          width: 52px; height: 52px;
          background: var(--accent); color: var(--accent-ink);
          font-size: 18px; font-weight: 600;
          display: grid; place-items: center;
          flex-shrink: 0;
        }
        .cfg-avatar-img {
          width: 52px; height: 52px;
          object-fit: cover; flex-shrink: 0;
          border: 1px solid var(--line-soft);
        }
        .cfg-profile-info { flex: 1; min-width: 0; }
        .cfg-profile-name {
          font-size: 16px; letter-spacing: -0.01em; color: var(--ink);
        }
        .cfg-profile-meta {
          display: flex; gap: 16px; flex-wrap: wrap;
          margin-top: 4px;
          font-size: 12px; color: var(--ink-muted);
        }
        .cfg-profile-badge {
          font-size: 9px; letter-spacing: 0.1em;
          padding: 3px 8px;
          border: 1px solid var(--line-soft);
          color: var(--ink-muted); text-transform: uppercase;
          align-self: center;
        }

        /* ── Usage block ── */
        .cfg-usage {
          border: 1px solid var(--line-soft);
          background: var(--bg-elevated);
        }
        .cfg-usage-head {
          padding: 12px 20px;
          border-bottom: 1px solid var(--line-soft);
          display: flex; justify-content: space-between; align-items: center;
          font-size: 10px; letter-spacing: 0.1em;
          color: var(--ink-muted); text-transform: uppercase;
        }
        .cfg-usage-body {
          padding: 20px;
          display: grid; grid-template-columns: 1fr auto;
          gap: 16px; align-items: center;
        }
        .cfg-usage-numbers {
          font-size: 11px; color: var(--ink-muted);
          display: flex; gap: 6px; align-items: baseline; margin-bottom: 8px;
        }
        .cfg-usage-big {
          font-size: 32px; letter-spacing: -0.02em;
          color: var(--ink); font-feature-settings: "tnum";
        }
        .cfg-usage-bar {
          height: 4px; background: var(--bg-soft);
          border: 1px solid var(--line-hairline);
          position: relative; overflow: hidden;
          margin-top: 4px;
        }
        .cfg-usage-fill {
          position: absolute; left: 0; top: 0; bottom: 0;
          background: var(--accent); transition: width 300ms;
        }
        .cfg-usage-fill.mid { background: var(--warn); }
        .cfg-usage-fill.high { background: oklch(62% 0.18 25); }
        .cfg-usage-rows { padding: 0 20px 16px; }
        .cfg-usage-row {
          display: flex; justify-content: space-between;
          padding: 9px 0;
          border-bottom: 1px dashed var(--line-hairline);
          font-size: 12px;
        }
        .cfg-usage-row:last-child { border-bottom: 0; }
        .cfg-usage-row span:first-child { color: var(--ink-muted); letter-spacing: 0.04em; }
        .cfg-usage-row span:last-child { color: var(--ink); font-feature-settings: "tnum"; }
        .cfg-usage-reset {
          padding: 10px 20px;
          border-top: 1px solid var(--line-hairline);
          font-size: 10px; color: var(--ink-muted);
          letter-spacing: 0.06em; text-transform: uppercase;
        }

        /* ── Plans grid ── */
        .cfg-plans {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border: 1px solid var(--line-soft);
        }
        .cfg-plan {
          padding: 24px;
          border-right: 1px solid var(--line-soft);
          position: relative;
          display: flex; flex-direction: column; gap: 0;
        }
        .cfg-plan:last-child { border-right: 0; }
        .cfg-plan.current {
          background: var(--bg-soft);
        }
        .cfg-plan-badge {
          position: absolute; top: 0; right: 0;
          font-size: 9px; letter-spacing: 0.1em;
          padding: 4px 10px;
          background: var(--accent); color: var(--accent-ink);
          text-transform: uppercase;
        }
        .cfg-plan-name {
          font-size: 10px; letter-spacing: 0.14em;
          color: var(--ink-muted); text-transform: uppercase;
          margin-bottom: 12px;
        }
        .cfg-plan-price {
          font-size: 32px; letter-spacing: -0.03em; color: var(--ink);
          line-height: 1;
        }
        .cfg-plan-period {
          font-size: 12px; color: var(--ink-muted); margin-top: 2px;
          margin-bottom: 20px;
        }
        .cfg-plan-features {
          list-style: none; padding: 0; margin: 0 0 24px;
          display: flex; flex-direction: column; gap: 8px;
          flex: 1;
        }
        .cfg-plan-features li {
          font-size: 12px; color: var(--ink-soft);
          display: flex; gap: 8px; align-items: flex-start;
        }
        .cfg-plan-features li::before {
          content: "—";
          color: var(--accent); flex-shrink: 0;
          font-size: 11px; margin-top: 1px;
        }
        .cfg-plan-cta {
          padding: 10px 0;
          font: inherit; font-size: 12px; letter-spacing: 0.04em;
          border: 1px solid var(--line);
          color: var(--ink-soft);
          background: transparent;
          cursor: pointer; text-align: center;
          transition: all 150ms;
          text-decoration: none; display: block;
        }
        .cfg-plan-cta:hover { background: var(--ink); color: var(--bg); border-color: var(--ink); }
        .cfg-plan-cta.active {
          background: var(--ink); color: var(--bg); border-color: var(--ink);
          cursor: default; pointer-events: none;
        }
        .cfg-plan-cta.upgrade {
          background: var(--accent); color: var(--accent-ink); border-color: var(--accent);
        }
        .cfg-plan-cta.upgrade:hover { background: var(--ink); color: var(--bg); border-color: var(--ink); }

        /* ── Danger zone ── */
        .cfg-danger {
          border: 1px solid var(--line-soft);
          background: var(--bg-elevated);
        }
        .cfg-danger-row {
          padding: 16px 20px;
          display: flex; justify-content: space-between; align-items: center;
          border-bottom: 1px solid var(--line-soft);
          gap: 24px;
        }
        .cfg-danger-row:last-child { border-bottom: 0; }
        .cfg-danger-label { font-size: 13px; color: var(--ink); }
        .cfg-danger-sub { font-size: 11px; color: var(--ink-muted); margin-top: 2px; }
        .cfg-signout-btn {
          font: inherit; font-size: 11px; letter-spacing: 0.04em;
          color: var(--ink-muted);
          padding: 7px 16px;
          border: 1px solid var(--line-soft);
          background: transparent;
          transition: all 150ms; cursor: pointer;
          white-space: nowrap; flex-shrink: 0;
        }
        .cfg-signout-btn:hover { color: var(--ink); border-color: var(--line); }

        @media (max-width: 900px) {
          .cfg-root { padding: 28px 20px 60px; }
          .cfg-plans { grid-template-columns: 1fr; }
          .cfg-plan { border-right: 0; border-bottom: 1px solid var(--line-soft); }
          .cfg-plan:last-child { border-bottom: 0; }
        }
      `}</style>

      <div className="cfg-root">
        {/* Header */}
        <div className="cfg-header">
          <div className="cfg-eyebrow">
            <span className="cfg-eyebrow-dot" />
            <span>SETTINGS</span>
          </div>
          <h1 className="cfg-title">
            Account &amp; <span className="accent">plan.</span>
          </h1>
        </div>

        {/* Profile */}
        <div className="cfg-section">
          <div className="cfg-section-label">{"// PROFILE"}</div>
          <div className="cfg-profile">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt={user.name ?? "avatar"} className="cfg-avatar-img" />
            ) : (
              <div className="cfg-avatar">{userInitials}</div>
            )}
            <div className="cfg-profile-info">
              <div className="cfg-profile-name">{user.name ?? user.email}</div>
              <div className="cfg-profile-meta">
                <span>{user.email}</span>
                <span>github oauth</span>
              </div>
            </div>
            <div className="cfg-profile-badge">FREE</div>
          </div>
        </div>

        {/* Usage */}
        <div className="cfg-section">
          <div className="cfg-section-label">{"// USAGE"}</div>
          <div className="cfg-usage">
            <div className="cfg-usage-head">
              <span>MONTHLY QUOTA</span>
              <span>FREE PLAN · {FREE_MONTHLY_LIMIT} ANALYSES</span>
            </div>
            <div className="cfg-usage-body">
              <div>
                <div className="cfg-usage-numbers">
                  <span className="cfg-usage-big">{used}</span>
                  <span>/ {FREE_MONTHLY_LIMIT} used</span>
                </div>
                <div className="cfg-usage-bar">
                  <div
                    className={`cfg-usage-fill${pct >= 90 ? " high" : pct >= 60 ? " mid" : ""}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="cfg-usage-rows">
              <div className="cfg-usage-row">
                <span>USED</span><span>{used}</span>
              </div>
              <div className="cfg-usage-row">
                <span>REMAINING</span><span>{remaining}</span>
              </div>
              <div className="cfg-usage-row">
                <span>RESETS IN</span><span>{daysLeft}d</span>
              </div>
            </div>
            <div className="cfg-usage-reset">Next reset · {resetsAt}</div>
          </div>
        </div>

        {/* Plans */}
        <div className="cfg-section">
          <div className="cfg-section-label">{"// PLANS"}</div>
          <div className="cfg-plans">
            {PLANS.map((plan) => (
              <div key={plan.id} className={`cfg-plan${plan.current ? " current" : ""}`}>
                {plan.current && <div className="cfg-plan-badge">current</div>}
                <div className="cfg-plan-name">{plan.name}</div>
                <div className="cfg-plan-price">{plan.price}</div>
                <div className="cfg-plan-period">{plan.period}</div>
                <ul className="cfg-plan-features">
                  {plan.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                {plan.current ? (
                  <span className="cfg-plan-cta active">current plan</span>
                ) : (
                  <Link href="/#pricing" className="cfg-plan-cta upgrade">
                    upgrade to {plan.name.toLowerCase()} →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Account actions */}
        <div className="cfg-section">
          <div className="cfg-section-label">{"// ACCOUNT"}</div>
          <div className="cfg-danger">
            <div className="cfg-danger-row">
              <div>
                <div className="cfg-danger-label">Sign out</div>
                <div className="cfg-danger-sub">You will be redirected to the homepage.</div>
              </div>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button type="submit" className="cfg-signout-btn">sign out</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
