"use client";

import {
  AnalyzeButton,
  type AnalyzeButtonHandle,
} from "@/components/analyze-button";
import Link from "next/link";
import { useRef, useState } from "react";

interface WeekActivity {
  week: number;
  total: number;
  days: number[];
}

interface RepoData {
  owner: string;
  repo: string;
  htmlUrl: string;
  description: string | null;
  language: string | null;
  isPrivate: boolean;
  stars: number;
  issues: number;
  fileCount: string;
  updatedAt: string | null;
  commitWeeks: WeekActivity[];
}

function CommitHeatmap({ weeks }: { weeks: WeekActivity[] }) {
  const isEmpty = weeks.length === 0;
  const cells = isEmpty ? Array(364).fill(0) : weeks.flatMap((w) => w.days);
  const max = Math.max(...cells, 1);

  const levels = cells.map((v) => {
    if (v === 0) return 0;
    if (v <= max * 0.15) return 1;
    if (v <= max * 0.4) return 2;
    if (v <= max * 0.7) return 3;
    return 4;
  });

  const totalCommits = cells.reduce((s, v) => s + v, 0);
  const activeDays = cells.filter((v) => v > 0).length;
  const busiestWeek = isEmpty ? 0 : Math.max(...weeks.map((w) => w.total));

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthLabels: { label: string; col: number }[] = [];
  if (!isEmpty) {
    let lastMonth = -1;
    weeks.forEach((w, i) => {
      const m = new Date(w.week * 1000).getMonth();
      if (m !== lastMonth) {
        monthLabels.push({ label: monthNames[m], col: i });
        lastMonth = m;
      }
    });
  }

  const colors = [
    "var(--bg-soft)",
    "color-mix(in oklab, var(--accent) 20%, var(--bg-soft))",
    "color-mix(in oklab, var(--accent) 45%, var(--bg-soft))",
    "color-mix(in oklab, var(--accent) 72%, var(--bg-soft))",
    "var(--accent)",
  ];

  return (
    <div className="heat-wrap">
      <div className="heat-head">
        <div className="heat-head-title">
          {"// COMMIT ACTIVITY"}
          <span className="heat-head-num">last 12 months</span>
        </div>
        <div className="heat-head-stats">
          {isEmpty ? (
            <span style={{ fontStyle: "italic" }}>
              computing stats — reload in a moment
            </span>
          ) : (
            <>
              <span>{totalCommits} commits</span>
              <span>·</span>
              <span>{activeDays} active days</span>
              <span>·</span>
              <span>peak {busiestWeek}/wk</span>
            </>
          )}
        </div>
      </div>
      <div className="heat-body">
        <div className="heat-months">
          {monthLabels.map(({ label, col }) => (
            <span
              key={`${label}-${col}`}
              className="heat-month-label"
              style={{ gridColumn: col + 1 }}
            >
              {label}
            </span>
          ))}
        </div>
        <div className="heat-inner">
          <div className="heat-day-labels">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>
          <div className="heat-grid">
            {Array.from({ length: 52 }, (_, wi) =>
              Array.from({ length: 7 }, (_, di) => {
                const level = levels[wi * 7 + di] ?? 0;
                const w = weeks[wi];
                const title = w
                  ? `${new Date((w.week + di * 86400) * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" })}: ${w.days[di]} commit${w.days[di] !== 1 ? "s" : ""}`
                  : "";
                return (
                  <div
                    key={`${wi}-${di}`}
                    className="heat-cell"
                    style={{
                      background: colors[level],
                      gridColumn: wi + 1,
                      gridRow: di + 1,
                    }}
                    title={title}
                  />
                );
              }),
            )}
          </div>
        </div>
        <div className="heat-legend">
          <span>LESS</span>
          <div className="heat-scale">
            {colors.map((c, i) => (
              <div
                key={i}
                className="heat-scale-cell"
                style={{ background: c }}
              />
            ))}
          </div>
          <span>MORE</span>
        </div>
      </div>
    </div>
  );
}

export function RepoDetailClient({
  owner,
  repo,
  htmlUrl,
  description,
  language,
  isPrivate,
  stars,
  issues,
  fileCount,
  updatedAt,
  commitWeeks,
}: RepoData) {
  const analyzeRef = useRef<AnalyzeButtonHandle>(null);
  const [analyzing, setAnalyzing] = useState(false);

  function handleAnalyze() {
    setAnalyzing(true);
    analyzeRef.current?.triggerAnalyze();
    // reset indicator after a moment — the button's own isPending handles visual state
    setTimeout(() => setAnalyzing(false), 500);
  }

  function handleExport() {
    analyzeRef.current?.exportBrief();
  }

  return (
    <>
      <style>{`
        .rp-crumb {
          display: flex; justify-content: space-between; align-items: center;
          padding: 0 32px;
          border-bottom: 1px solid var(--line-soft);
          font-size: 12px; color: var(--ink-muted);
          height: 48px;
        }
        .rp-crumb-path {
          display: flex; align-items: center; gap: 8px;
          letter-spacing: 0.04em; min-width: 0; overflow: hidden;
        }
        .rp-crumb-path strong { color: var(--ink); font-weight: 500; }
        .rp-crumb-sep { opacity: 0.4; }
        .rp-crumb-vis {
          font-size: 9px; letter-spacing: 0.08em;
          color: var(--ink-muted); padding: 2px 6px;
          border: 1px solid var(--line-soft);
          text-transform: uppercase; flex-shrink: 0; margin-left: 4px;
        }
        .rp-crumb-vis.private { color: var(--warn); border-color: var(--warn); }
        .rp-crumb-actions { display: flex; align-items: center; gap: 0; height: 100%; }
        .rp-crumb-btn {
          padding: 0 14px; height: 100%;
          font-size: 11px; letter-spacing: 0.04em;
          border-left: 1px solid var(--line-soft);
          color: var(--ink-soft);
          transition: all 150ms; text-decoration: none;
          display: inline-flex; align-items: center; gap: 6px;
          white-space: nowrap; cursor: pointer;
        }
        .rp-crumb-btn:hover { color: var(--ink); background: var(--bg-soft); }
        .rp-crumb-btn.primary {
          background: var(--ink); color: var(--bg);
          border-left-color: var(--ink);
        }
        .rp-crumb-btn.primary:hover { background: var(--accent); color: var(--accent-ink); }

        .rp-hero {
          padding: 36px 32px 28px;
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 40px;
          border-bottom: 1px solid var(--line-soft);
          align-items: end;
        }
        .rp-hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 10px; letter-spacing: 0.12em;
          color: var(--ink-muted); text-transform: uppercase;
        }
        .rp-hero-dot { width: 6px; height: 6px; background: var(--ok); border-radius: 50%; }
        .rp-hero-title {
          font-size: clamp(26px, 2.8vw, 40px);
          line-height: 1; letter-spacing: -0.025em;
          color: var(--ink); margin-top: 12px;
        }
        .rp-hero-title .accent {
          color: var(--accent);
          font-family: var(--font-instrument, Georgia, serif);
          font-style: italic;
        }
        .rp-hero-desc {
          margin-top: 14px; font-size: 13px;
          color: var(--ink-soft); line-height: 1.6; max-width: 520px;
        }
        .rp-hero-stats {
          display: grid; grid-template-columns: repeat(3, 1fr);
          border: 1px solid var(--line-soft);
        }
        .rp-stat { padding: 16px 18px; border-right: 1px solid var(--line-soft); }
        .rp-stat:last-child { border-right: 0; }
        .rp-stat-k { font-size: 10px; letter-spacing: 0.12em; color: var(--ink-muted); text-transform: uppercase; }
        .rp-stat-v { font-size: 22px; margin-top: 4px; letter-spacing: -0.015em; color: var(--ink); font-feature-settings: "tnum"; }
        .rp-stat-sub { font-size: 11px; color: var(--ink-muted); margin-top: 2px; }

        .rp-analysis { padding: 32px; }

        /* Heatmap */
        .heat-wrap { border-top: 1px solid var(--line-soft); }
        .heat-head {
          padding: 14px 32px;
          border-bottom: 1px solid var(--line-soft);
          display: flex; justify-content: space-between; align-items: center;
          font-size: 11px;
        }
        .heat-head-title { color: var(--ink); letter-spacing: 0.04em; display: flex; align-items: center; gap: 8px; }
        .heat-head-num { color: var(--ink-muted); }
        .heat-head-stats { display: flex; gap: 8px; align-items: center; font-size: 11px; color: var(--ink-muted); letter-spacing: 0.04em; }
        .heat-body { padding: 20px 32px 24px; overflow-x: auto; }
        .heat-months {
          display: grid; grid-template-columns: repeat(52, 1fr);
          margin-left: 28px; margin-bottom: 4px;
          font-size: 9px; color: var(--ink-muted);
          letter-spacing: 0.04em; text-transform: uppercase; min-width: 520px;
        }
        .heat-month-label { white-space: nowrap; }
        .heat-inner { display: flex; gap: 6px; align-items: flex-start; min-width: 520px; }
        .heat-day-labels {
          display: flex; flex-direction: column;
          font-size: 9px; color: var(--ink-muted);
          letter-spacing: 0.04em; text-transform: uppercase;
          width: 22px; flex-shrink: 0;
          height: calc(7 * 12px + 6 * 2px);
          justify-content: space-between; padding-top: 1px;
        }
        .heat-grid {
          display: grid;
          grid-template-columns: repeat(52, 12px);
          grid-template-rows: repeat(7, 12px);
          gap: 2px; flex-shrink: 0;
        }
        .heat-cell { width: 12px; height: 12px; transition: transform 100ms; cursor: default; }
        .heat-cell:hover { transform: scale(1.3); z-index: 2; position: relative; }
        .heat-legend {
          display: flex; align-items: center; gap: 6px;
          margin-top: 10px; margin-left: 28px;
          font-size: 9px; color: var(--ink-muted);
          letter-spacing: 0.06em; text-transform: uppercase;
        }
        .heat-scale { display: flex; gap: 2px; }
        .heat-scale-cell { width: 10px; height: 10px; }

        @media (max-width: 900px) {
          .rp-hero { grid-template-columns: 1fr; }
          .rp-crumb { padding: 0 20px; flex-wrap: wrap; height: auto; gap: 8px; padding-top: 10px; padding-bottom: 10px; }
          .rp-crumb-btn { border-left: 0; border: 1px solid var(--line-soft); padding: 6px 12px; height: auto; }
          .rp-analysis { padding: 20px; }
          .heat-body { padding: 16px 20px; }
          .heat-head { padding: 12px 20px; }
        }
      `}</style>

      {/* Crumb */}
      <div className="rp-crumb">
        <div className="rp-crumb-path">
          <Link
            href="/dashboard"
            style={{
              color: "var(--ink-muted)",
              textDecoration: "none",
              transition: "color 150ms",
            }}
          >
            ← repos
          </Link>
          <span className="rp-crumb-sep">/</span>
          <span>{owner}</span>
          <span className="rp-crumb-sep">/</span>
          <strong>{repo}</strong>
          <span className={`rp-crumb-vis${isPrivate ? " private" : ""}`}>
            {isPrivate ? "PRIVATE" : "PUBLIC"}
          </span>
        </div>
        <div className="rp-crumb-actions">
          <a
            href={htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rp-crumb-btn"
          >
            ↗ open on GitHub
          </a>
          <button className="rp-crumb-btn" onClick={handleExport}>
            ↓ export brief
          </button>
          <button
            className="rp-crumb-btn primary"
            onClick={handleAnalyze}
            disabled={analyzing}
          >
            ↻ analyze
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="rp-hero">
        <div>
          <div className="rp-hero-eyebrow">
            <span className="rp-hero-dot" />
            {language ?? "REPOSITORY"}
            {isPrivate ? " · PRIVATE" : " · PUBLIC"}
          </div>
          <h1 className="rp-hero-title">
            {owner}/<span className="accent">{repo}</span>
          </h1>
          {description && <p className="rp-hero-desc">{description}</p>}
        </div>
        <div className="rp-hero-stats">
          <div className="rp-stat">
            <div className="rp-stat-k">STARS</div>
            <div className="rp-stat-v">{stars}</div>
            <div className="rp-stat-sub">stargazers</div>
          </div>
          <div className="rp-stat">
            <div className="rp-stat-k">FILES</div>
            <div className="rp-stat-v">{fileCount}</div>
            <div className="rp-stat-sub">in tree</div>
          </div>
          <div className="rp-stat">
            <div className="rp-stat-k">ISSUES</div>
            <div className="rp-stat-v">{issues}</div>
            <div className="rp-stat-sub">
              {updatedAt ? `updated ${updatedAt}` : "open"}
            </div>
          </div>
        </div>
      </div>

      {/* Analysis */}
      <div className="rp-analysis">
        <AnalyzeButton ref={analyzeRef} owner={owner} repo={repo} hideToolbar />
      </div>

      {/* Commit heatmap */}
      <CommitHeatmap weeks={commitWeeks} />
    </>
  );
}
