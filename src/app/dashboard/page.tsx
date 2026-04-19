import { DashRepoInput } from "@/components/dash-repo-input";

export default function DashboardPage() {
  return (
    <>
      <style>{`
        /* ── Dashboard landing ── */
        .dw-section {
          padding: 72px 40px 48px;
          border-bottom: 1px solid var(--line-soft);
        }
        .dw-label {
          font-size: 10px; letter-spacing: 0.14em;
          color: var(--ink-muted); text-transform: uppercase;
          display: flex; align-items: center; gap: 8px;
        }
        .dw-label-dot {
          width: 6px; height: 6px;
          background: var(--accent); border-radius: 50%;
        }
        .dw-title {
          font-size: clamp(32px, 4vw, 52px);
          line-height: 1; letter-spacing: -0.025em;
          color: var(--ink); margin-top: 20px;
        }
        .dw-title .accent {
          color: var(--accent);
          font-family: var(--font-instrument, Georgia, serif);
          font-style: italic;
        }
        .dw-sub {
          margin-top: 16px;
          font-size: 13px; color: var(--ink-soft); line-height: 1.65;
          max-width: 520px;
        }
        .dw-input-wrap {
          margin-top: 32px;
          max-width: 600px;
        }

        /* ── Input component ── */
        .dri-wrap { display: flex; flex-direction: column; gap: 12px; }
        .dri-form { display: flex; flex-direction: column; gap: 6px; }
        .dri-row {
          display: flex;
          border: 1px solid var(--line-soft);
          background: var(--bg-elevated);
          transition: border-color 150ms;
        }
        .dri-row:focus-within { border-color: var(--accent); }
        .dri-row--error { border-color: oklch(62% 0.18 25); }
        .dri-prefix {
          display: grid; place-items: center;
          padding: 0 12px;
          font-size: 12px; color: var(--ink-muted);
          border-right: 1px solid var(--line-soft);
          white-space: nowrap;
          user-select: none;
        }
        .dri-input {
          flex: 1;
          padding: 14px 14px;
          background: transparent;
          border: 0; outline: 0;
          font: inherit; font-size: 13px; color: var(--ink);
        }
        .dri-input::placeholder { color: var(--ink-muted); }
        .dri-btn {
          padding: 0 22px;
          background: var(--ink); color: var(--bg);
          font: inherit; font-size: 13px; letter-spacing: 0.02em;
          border: 0; cursor: pointer;
          transition: background 150ms, color 150ms;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .dri-btn:hover { background: var(--accent); color: var(--accent-ink); }
        .dri-error {
          font-size: 11px; color: oklch(62% 0.18 25);
          letter-spacing: 0.02em;
        }
        .dri-examples {
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
        }
        .dri-examples-label {
          font-size: 11px; color: var(--ink-muted);
          letter-spacing: 0.06em; text-transform: uppercase;
        }
        .dri-pill {
          padding: 4px 10px;
          border: 1px solid var(--line-soft);
          font: inherit; font-size: 11px;
          color: var(--ink-soft);
          background: transparent; cursor: pointer;
          transition: all 150ms;
        }
        .dri-pill:hover { border-color: var(--line); color: var(--ink); background: var(--bg-soft); }

        /* ── How it works tiles ── */
        .dw-tiles {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border-top: 1px solid var(--line-soft);
        }
        .dw-tile {
          padding: 28px 28px 32px;
          border-right: 1px solid var(--line-soft);
          position: relative;
        }
        .dw-tile:last-child { border-right: 0; }
        .dw-tile-num {
          font-size: 10px; letter-spacing: 0.14em;
          color: var(--ink-muted); text-transform: uppercase;
        }
        .dw-tile-title {
          font-size: 18px; margin-top: 16px;
          letter-spacing: -0.01em; color: var(--ink); line-height: 1.2;
        }
        .dw-tile-desc {
          margin-top: 8px; font-size: 12px;
          color: var(--ink-soft); line-height: 1.6;
        }
        .dw-tile-glyph {
          margin-top: 20px;
          font-size: 22px; color: var(--accent);
          opacity: 0.6;
        }

        @media (max-width: 900px) {
          .dw-section { padding: 40px 24px 40px; }
          .dw-tiles { grid-template-columns: 1fr; }
          .dw-tile { border-right: 0; border-bottom: 1px solid var(--line-soft); }
        }
      `}</style>

      <div className="dw-section">
        <div className="dw-label">
          <span className="dw-label-dot" />
          <span>REPOBRIEF — DASHBOARD</span>
        </div>
        <h1 className="dw-title">
          Understand any repo<br />
          in <span className="accent">seconds.</span>
        </h1>
        <p className="dw-sub">
          Select a repository from the sidebar, or paste any GitHub URL below
          to analyze it — architecture, tech stack, and AI-generated brief.
        </p>

        <div className="dw-input-wrap">
          <DashRepoInput basePath="/dashboard" />
        </div>
      </div>

      <div className="dw-tiles">
        <div className="dw-tile">
          <div className="dw-tile-num">01 — PASTE</div>
          <div className="dw-tile-title">Any GitHub URL</div>
          <p className="dw-tile-desc">
            Public or private repos — paste a URL, type owner/repo, or pick from the sidebar.
          </p>
          <div className="dw-tile-glyph">⌘</div>
        </div>
        <div className="dw-tile">
          <div className="dw-tile-num">02 — ANALYZE</div>
          <div className="dw-tile-title">AI reads the code</div>
          <p className="dw-tile-desc">
            Claude scans up to 150 key files and maps the full architecture in seconds.
          </p>
          <div className="dw-tile-glyph">◈</div>
        </div>
        <div className="dw-tile">
          <div className="dw-tile-num">03 — BRIEF</div>
          <div className="dw-tile-title">Instant understanding</div>
          <p className="dw-tile-desc">
            Architecture diagram, tech stack, file map, and onboarding guide — ready to share.
          </p>
          <div className="dw-tile-glyph">⬡</div>
        </div>
      </div>
    </>
  );
}
