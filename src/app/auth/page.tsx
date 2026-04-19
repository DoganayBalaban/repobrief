import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AuthCard } from "@/components/auth-card";

const SCOPES = [
  { key: "read:user", desc: "Your public profile, username, avatar, and email address.", badge: "REQUIRED", cls: "ok" },
  { key: "repo:read", desc: "Read-only access to your repositories — file contents, metadata, and branches. No write access.", badge: "READ ONLY", cls: "ok" },
  { key: "user:email", desc: "Used to send you analysis receipts. Never shared, never sold.", badge: "OPTIONAL", cls: "" },
];

export default async function AuthPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:           #faf9f6;
          --bg-elevated:  #ffffff;
          --bg-soft:      #f3f2ef;
          --ink:          #0f0e0d;
          --ink-soft:     #3d3c38;
          --ink-muted:    #8a8880;
          --line:         rgba(0,0,0,0.12);
          --line-soft:    rgba(0,0,0,0.07);
          --line-hairline:rgba(0,0,0,0.04);
          --accent:       oklch(68% 0.17 135);
          --accent-ink:   #0f0e0d;
          --ok:           oklch(60% 0.16 150);
          --warn:         oklch(62% 0.18 25);
          --grid:         rgba(0,0,0,0.04);
        }

        html, body { height: 100%; }
        body {
          background: var(--bg);
          font-family: var(--font-dm-sans, system-ui, sans-serif);
          color: var(--ink);
          -webkit-font-smoothing: antialiased;
        }

        a { text-decoration: none; color: inherit; }
        button { background: none; border: 0; cursor: pointer; font: inherit; }

        /* Layout */
        .auth-wrap {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          background: var(--bg);
          position: relative;
        }
        .auth-wrap::before {
          content: "";
          position: absolute; inset: 0;
          background-image:
            linear-gradient(var(--grid) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid) 1px, transparent 1px);
          background-size: 56px 56px;
          pointer-events: none;
          mask-image: radial-gradient(circle at 20% 30%, black 0%, transparent 60%);
          z-index: 0;
        }

        /* Left panel */
        .auth-left {
          padding: 40px 56px;
          border-right: 1px solid var(--line);
          display: flex; flex-direction: column;
          position: relative; z-index: 1;
          background: var(--bg);
        }
        .auth-brand {
          display: flex; align-items: center; gap: 10px;
          font-size: 15px; font-weight: 500;
          font-family: var(--font-jetbrains, monospace);
        }
        .auth-brand-mark {
          width: 22px; height: 22px;
          background: var(--ink); color: var(--bg);
          display: grid; place-items: center;
          font-size: 12px; font-weight: 600;
        }
        .auth-brand-tag {
          font-size: 11px; color: var(--ink-muted);
          letter-spacing: 0.08em; margin-left: 4px;
        }
        .auth-backlink {
          margin-top: 40px;
          font-size: 12px; color: var(--ink-muted);
          letter-spacing: 0.08em; text-transform: uppercase;
          display: inline-flex; align-items: center; gap: 8px;
          width: fit-content; transition: color 150ms;
          font-family: var(--font-jetbrains, monospace);
        }
        .auth-backlink:hover { color: var(--ink); }
        .auth-headline-block {
          margin-top: auto;
          padding: 60px 0 40px;
          max-width: 520px;
        }
        .auth-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; text-transform: uppercase;
          letter-spacing: 0.12em; color: var(--ink-muted);
          font-family: var(--font-jetbrains, monospace);
        }
        .auth-eyebrow-dot {
          width: 6px; height: 6px;
          background: var(--accent); border-radius: 50%;
          flex-shrink: 0;
        }
        .auth-title {
          font-size: clamp(40px, 4.5vw, 64px);
          line-height: 0.98;
          letter-spacing: -0.025em;
          margin-top: 20px; color: var(--ink);
          font-family: var(--font-jetbrains, monospace);
          font-weight: 400;
        }
        .auth-title .serif {
          font-family: var(--font-instrument, Georgia, serif);
          font-style: italic; color: var(--accent);
        }
        .auth-sub {
          margin-top: 24px; font-size: 14px;
          line-height: 1.7; color: var(--ink-soft);
          max-width: 460px;
        }

        /* Scopes */
        .auth-scopes { margin-top: 44px; max-width: 520px; }
        .auth-scopes-label {
          font-size: 11px; letter-spacing: 0.12em;
          color: var(--ink-muted); text-transform: uppercase;
          padding-bottom: 12px; border-bottom: 1px solid var(--line);
          display: flex; justify-content: space-between;
          font-family: var(--font-jetbrains, monospace);
        }
        .scope-item {
          display: grid; grid-template-columns: 140px 1fr auto;
          gap: 16px; padding: 18px 0;
          border-bottom: 1px solid var(--line-soft);
          align-items: start;
        }
        .scope-key {
          font-size: 11px; letter-spacing: 0.08em;
          color: var(--ink); text-transform: uppercase;
          font-family: var(--font-jetbrains, monospace);
        }
        .scope-desc { font-size: 13px; line-height: 1.55; color: var(--ink-soft); }
        .scope-badge {
          font-size: 10px; letter-spacing: 0.08em;
          padding: 3px 8px; border: 1px solid var(--line-soft);
          color: var(--ink-muted); text-transform: uppercase;
          white-space: nowrap;
          font-family: var(--font-jetbrains, monospace);
        }
        .scope-badge.ok { color: var(--ok); border-color: var(--ok); }

        .auth-footer-left {
          margin-top: auto; padding-top: 40px;
          display: flex; justify-content: space-between;
          font-size: 11px; color: var(--ink-muted);
          letter-spacing: 0.08em; text-transform: uppercase;
          font-family: var(--font-jetbrains, monospace);
        }

        /* Right panel */
        .auth-right {
          padding: 40px 56px;
          display: flex; flex-direction: column;
          align-items: stretch; justify-content: center;
          position: relative; z-index: 1;
          background: var(--bg);
        }

        /* Card */
        .auth-card {
          max-width: 460px; margin: 0 auto; width: 100%;
          border: 1px solid var(--line);
          background: var(--bg-elevated);
        }
        .auth-card-head {
          padding: 14px 20px;
          border-bottom: 1px solid var(--line-soft);
          font-size: 11px; color: var(--ink-muted);
          letter-spacing: 0.1em; text-transform: uppercase;
          display: flex; justify-content: space-between; align-items: center;
          font-family: var(--font-jetbrains, monospace);
        }
        .auth-card-head-dots { display: flex; gap: 6px; }
        .auth-card-head-dots .dot {
          width: 9px; height: 9px;
          border: 1px solid var(--line-soft);
        }
        .auth-card-body { padding: 36px 32px 32px; }
        .auth-card-title {
          font-size: 22px; letter-spacing: -0.015em; line-height: 1.25;
          font-family: var(--font-jetbrains, monospace); font-weight: 500;
        }
        .auth-card-sub {
          margin-top: 10px; font-size: 13px;
          color: var(--ink-soft); line-height: 1.6;
        }

        /* GitHub button */
        .gh-btn {
          width: 100%; margin-top: 28px;
          padding: 16px 20px;
          display: flex; align-items: center; justify-content: space-between;
          background: var(--ink); color: var(--bg);
          border: 1px solid var(--ink); font: inherit; font-size: 14px;
          cursor: pointer; transition: all 200ms;
          position: relative; overflow: hidden;
        }
        .gh-btn:hover {
          background: var(--accent); color: var(--accent-ink);
          border-color: var(--accent);
        }
        .gh-btn-left { display: flex; align-items: center; gap: 12px; }
        .gh-btn-arrow { font-size: 16px; transition: transform 200ms; }
        .gh-btn:hover .gh-btn-arrow { transform: translateX(4px); }

        /* Auth steps */
        .auth-state {
          margin-top: 24px;
          border-top: 1px dashed var(--line-soft);
          padding-top: 20px; font-size: 12px;
          color: var(--ink-soft);
          font-family: var(--font-jetbrains, monospace);
        }
        .state-row {
          display: grid; grid-template-columns: 22px 1fr auto;
          gap: 10px; padding: 7px 0; align-items: center;
          opacity: 0.35; transition: opacity 200ms;
        }
        .state-row.active { opacity: 1; }
        .state-row.active .state-label { color: var(--ink); }
        .state-row.done { opacity: 0.7; }
        .state-idx { font-size: 10px; color: var(--ink-muted); letter-spacing: 0.08em; }
        .state-label { font-size: 12px; }
        .state-tick {
          font-size: 11px; color: var(--ink-muted);
          min-width: 50px; text-align: right;
        }
        .state-row.active .state-tick { color: var(--accent); }
        .state-row.done .state-tick { color: var(--ok); }
        .gh-btn-progress {
          position: absolute; bottom: 0; left: 0;
          height: 2px; background: var(--accent);
          transition: width 60ms linear;
        }

        .auth-card-foot {
          padding: 14px 20px; border-top: 1px solid var(--line-soft);
          font-size: 11px; color: var(--ink-muted);
          letter-spacing: 0.08em;
          display: flex; justify-content: space-between; align-items: center;
          font-family: var(--font-jetbrains, monospace);
        }
        .auth-card-foot a { color: var(--ink-soft); transition: color 150ms; }
        .auth-card-foot a:hover { color: var(--accent); }

        /* Alt + trust */
        .auth-alt {
          max-width: 460px; margin: 24px auto 0; width: 100%;
          font-size: 12px; color: var(--ink-muted);
        }
        .auth-alt a {
          color: var(--ink); border-bottom: 1px solid var(--line-soft);
          padding-bottom: 2px; transition: all 150ms;
        }
        .auth-alt a:hover { border-color: var(--accent); color: var(--accent); }
        .auth-trust {
          max-width: 460px; margin: 48px auto 0; width: 100%;
          border-top: 1px solid var(--line-soft); padding-top: 20px;
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 16px; font-size: 11px; color: var(--ink-muted);
        }
        .trust-item { display: flex; flex-direction: column; gap: 4px; }
        .trust-item-k {
          font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--ink-muted);
          font-family: var(--font-jetbrains, monospace);
        }
        .trust-item-v { font-size: 12px; color: var(--ink); letter-spacing: -0.005em; }

        @media (max-width: 960px) {
          .auth-wrap { grid-template-columns: 1fr; }
          .auth-left { border-right: 0; border-bottom: 1px solid var(--line); padding: 28px 24px; }
          .auth-right { padding: 28px 24px 48px; }
          .auth-headline-block { padding: 40px 0 24px; }
          .auth-trust { grid-template-columns: 1fr; }
          .scope-item { grid-template-columns: 1fr auto; }
          .scope-key { grid-column: 1 / -1; }
        }
      `}</style>

      <div className="auth-wrap">
        {/* Left panel */}
        <div className="auth-left">
          <Link href="/" className="auth-brand">
            <span className="auth-brand-mark">R</span>
            <span>repobrief</span>
            <span className="auth-brand-tag">v0.4</span>
          </Link>

          <Link href="/" className="auth-backlink">← back to home</Link>

          <div className="auth-headline-block">
            <div className="auth-eyebrow">
              <span className="auth-eyebrow-dot" />
              AUTHORIZATION · STEP 01 OF 01
            </div>
            <h1 className="auth-title">
              Connect once.<br />
              Read any repo <span className="serif">forever.</span>
            </h1>
            <p className="auth-sub">
              We use GitHub sign-in so you don&apos;t have to manage another password — and so analysis of your
              private repos works without uploading a single line of code. Read-only. Revoke anytime.
            </p>
          </div>

          <div className="auth-scopes">
            <div className="auth-scopes-label">
              <span>{"// PERMISSIONS REQUESTED"}</span>
              <span>03 SCOPES</span>
            </div>
            {SCOPES.map(s => (
              <div className="scope-item" key={s.key}>
                <div className="scope-key">{s.key}</div>
                <div className="scope-desc">{s.desc}</div>
                <div className={`scope-badge${s.cls ? ` ${s.cls}` : ""}`}>{s.badge}</div>
              </div>
            ))}
          </div>

          <div className="auth-footer-left">
            <span>SOC 2 TYPE II · IN PROGRESS</span>
            <span>ISTANBUL // 2026</span>
          </div>
        </div>

        {/* Right panel */}
        <div className="auth-right">
          <AuthCard />

          <div className="auth-alt">
            <span>don&apos;t have a GitHub account? <a href="https://github.com/signup" target="_blank" rel="noreferrer">create one →</a></span>
          </div>

          <div className="auth-trust">
            <div className="trust-item">
              <span className="trust-item-k">DATA</span>
              <span className="trust-item-v">never stored</span>
            </div>
            <div className="trust-item">
              <span className="trust-item-k">SCOPE</span>
              <span className="trust-item-v">read-only</span>
            </div>
            <div className="trust-item">
              <span className="trust-item-k">REVOKE</span>
              <span className="trust-item-v">one click, anytime</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
