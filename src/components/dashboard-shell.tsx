"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export interface ShellRepo {
  id: number;
  full_name: string;
  description: string | null;
  language: string | null;
  private: boolean;
  stargazers_count: number;
  updated_at: string | null;
  pushed_at: string | null;
}

interface Props {
  repos: ShellRepo[];
  user: { name?: string | null; email?: string | null; image?: string | null };
  usage: { used: number; limit: number; resetsAt: string; daysLeft: number };
  children: React.ReactNode;
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: "oklch(62% 0.14 255)",
  JavaScript: "oklch(78% 0.14 90)",
  Python: "oklch(60% 0.12 240)",
  Go: "oklch(68% 0.13 200)",
  Rust: "oklch(58% 0.15 40)",
  Java: "oklch(58% 0.12 60)",
  "C++": "oklch(62% 0.17 350)",
  Ruby: "oklch(52% 0.15 20)",
  Swift: "oklch(62% 0.17 30)",
  Kotlin: "oklch(60% 0.15 300)",
  PHP: "oklch(55% 0.10 260)",
  "C#": "oklch(50% 0.14 150)",
  Shell: "oklch(70% 0.12 140)",
  CSS: "oklch(52% 0.14 290)",
  HTML: "oklch(60% 0.17 40)",
  Vue: "oklch(62% 0.15 155)",
  Elixir: "oklch(60% 0.15 300)",
  Astro: "oklch(62% 0.17 340)",
  HCL: "oklch(60% 0.16 300)",
};

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function UsageMeter({
  used,
  limit,
  resetsAt,
  daysLeft,
}: {
  used: number;
  limit: number;
  resetsAt: string;
  daysLeft: number;
}) {
  const pct = Math.min(100, (used / limit) * 100);
  const level = pct >= 90 ? "high" : pct >= 60 ? "mid" : "low";
  const remaining = Math.max(0, limit - used);

  return (
    <div className="dash-usage" tabIndex={0}>
      <div className="dash-usage-text">
        <div className="dash-usage-top">
          <span>MONTHLY</span>
          <span className="dash-usage-count">
            <strong>{used}</strong>/{limit}
          </span>
        </div>
        <div className="dash-usage-bar">
          <div
            className={`dash-usage-bar-fill ${level}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className="dash-usage-plan">FREE</div>

      <div className="dash-usage-pop">
        <div className="dash-usage-pop-head">
          <span>{"// QUOTA"}</span>
          <span>FREE PLAN</span>
        </div>
        <div className="dash-usage-pop-body">
          <div className="dash-usage-pop-title">
            {remaining} {remaining === 1 ? "analysis" : "analyses"} left this
            month
          </div>
          <p className="dash-usage-pop-sub">
            Free plan includes{" "}
            <strong style={{ color: "var(--ink)" }}>{limit}</strong> repo
            analyses per calendar month. Re-analyzing counts as one.
          </p>
          <div style={{ marginTop: 14 }}>
            <div className="dash-usage-pop-row">
              <span>USED</span>
              <span>{used}</span>
            </div>
            <div className="dash-usage-pop-row">
              <span>REMAINING</span>
              <span>{remaining}</span>
            </div>
            <div className="dash-usage-pop-row">
              <span>RESETS IN</span>
              <span>{daysLeft}d</span>
            </div>
          </div>
          <div className="dash-usage-pop-reset">Next reset · {resetsAt}</div>
          <Link href="/#pricing" className="dash-usage-pop-cta">
            upgrade to pro — unlimited →
          </Link>
        </div>
      </div>
    </div>
  );
}

export function DashboardShell({
  repos,
  user,
  usage,
  children,
}: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "private" | "public">("all");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const pathname = usePathname();
  const router = useRouter();

  const selectedId = useMemo(() => {
    const match = pathname.match(/^\/dashboard\/([^/]+)\/([^/]+)/);
    return match ? `${match[1]}/${match[2]}` : null;
  }, [pathname]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    return () => {
      document.documentElement.removeAttribute("data-theme");
    };
  }, [theme]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("dash-search-input")?.focus();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const filtered = useMemo(() => {
    let rs = repos;
    if (query) {
      const q = query.toLowerCase();
      rs = rs.filter(
        (r) =>
          r.full_name.toLowerCase().includes(q) ||
          (r.description ?? "").toLowerCase().includes(q) ||
          (r.language ?? "").toLowerCase().includes(q),
      );
    }
    if (filter === "private") rs = rs.filter((r) => r.private);
    if (filter === "public") rs = rs.filter((r) => !r.private);
    return rs;
  }, [repos, query, filter]);

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    const val = query.trim();
    const ghUrlMatch = val.match(/github\.com\/([^/]+)\/([^/?#]+)/);
    if (ghUrlMatch) {
      router.push(`/dashboard/${ghUrlMatch[1]}/${ghUrlMatch[2]}`);
      setQuery("");
      return;
    }
    const slashMatch = val.match(/^([^/\s]+)\/([^/\s]+)$/);
    if (slashMatch) {
      router.push(`/dashboard/${slashMatch[1]}/${slashMatch[2]}`);
      setQuery("");
    }
  }

  const userInitials = (user.name ?? user.email ?? "??")
    .split(/\s+/)
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <style>{`
        /* ── Design tokens ── */
        :root {
          --bg:            #F7F5EF;
          --bg-soft:       #EEEBE2;
          --bg-elevated:   #FFFFFF;
          --ink:           #14140F;
          --ink-soft:      #44443D;
          --ink-muted:     #7A7A72;
          --line:          rgba(20,20,15,0.85);
          --line-soft:     rgba(20,20,15,0.12);
          --line-hairline: rgba(20,20,15,0.07);
          --accent:        oklch(68% 0.17 135);
          --accent-ink:    #0f0f0c;
          --accent-soft:   oklch(92% 0.06 135);
          --ok:            oklch(58% 0.12 155);
          --warn:          oklch(72% 0.14 55);
          --grid:          rgba(20,20,15,0.05);

          /* Legacy compat for AnalyzeButton */
          --text:       var(--ink);
          --muted:      var(--ink-muted);
          --dim:        var(--ink-soft);
          --mono:       var(--font-jetbrains), ui-monospace, monospace;
          --sans:       var(--font-dm-sans), system-ui, sans-serif;
          --serif:      var(--font-instrument), Georgia, serif;
          --border:     var(--line-soft);
          --bg-alt:     var(--bg-soft);
          --coral:      var(--accent);
          --coral-dim:  var(--accent-soft);
        }

        [data-theme="dark"] {
          --bg:            #0E0E0B;
          --bg-soft:       #1A1A15;
          --bg-elevated:   #121210;
          --ink:           #F2EFE5;
          --ink-soft:      #BEBBB0;
          --ink-muted:     #807D73;
          --line:          rgba(242,239,229,0.7);
          --line-soft:     rgba(242,239,229,0.14);
          --line-hairline: rgba(242,239,229,0.07);
          --accent:        oklch(78% 0.17 135);
          --accent-soft:   oklch(30% 0.08 135);
          --grid:          rgba(242,239,229,0.05);
        }

        *, *::before, *::after { box-sizing: border-box; }

        body {
          background: var(--bg);
          color: var(--ink);
          font-family: var(--font-jetbrains, ui-monospace, monospace);
          font-size: 14px;
          line-height: 1.55;
          -webkit-font-smoothing: antialiased;
          transition: background 200ms, color 200ms;
        }

        a { color: inherit; text-decoration: none; }
        button { font: inherit; color: inherit; background: none; border: none; cursor: pointer; }

        /* ── Dash root ── */
        .dash-root {
          min-height: 100vh;
          background: var(--bg);
          display: flex;
          flex-direction: column;
        }

        /* ── Top nav ── */
        .dash-nav {
          position: sticky; top: 0; z-index: 40;
          display: grid;
          grid-template-columns: 280px 1fr auto;
          align-items: center;
          border-bottom: 1px solid var(--line-soft);
          background: color-mix(in srgb, var(--bg) 92%, transparent);
          backdrop-filter: blur(12px);
          height: 56px;
        }
        .dash-nav-brand {
          padding: 0 24px;
          display: flex; align-items: center; gap: 10px;
          font-size: 14px; font-weight: 500;
          border-right: 1px solid var(--line-soft);
          height: 100%;
          text-decoration: none; color: var(--ink);
        }
        .dash-nav-brand-mark {
          width: 22px; height: 22px;
          background: var(--ink); color: var(--bg);
          display: grid; place-items: center;
          font-size: 12px; font-weight: 600;
          flex-shrink: 0;
        }
        .dash-nav-brand-tag {
          font-size: 10px; color: var(--ink-muted);
          letter-spacing: 0.08em; margin-left: 4px;
        }

        .dash-search {
          padding: 0 24px;
          height: 100%;
          display: flex; align-items: center;
        }
        .dash-search-input {
          flex: 1; max-width: 580px;
          display: flex; align-items: center; gap: 10px;
          padding: 8px 14px;
          border: 1px solid var(--line-soft);
          background: var(--bg-elevated);
          font: inherit; font-size: 13px;
          transition: border-color 150ms;
        }
        .dash-search-input:focus-within { border-color: var(--accent); }
        .dash-search-input svg { flex-shrink: 0; }
        .dash-search-input input {
          flex: 1; background: transparent;
          border: 0; outline: 0;
          font: inherit; font-size: 13px;
          color: var(--ink);
        }
        .dash-search-input input::placeholder { color: var(--ink-muted); }
        .dash-search-kbd {
          display: inline-flex; gap: 4px;
          font-size: 10px; color: var(--ink-muted); letter-spacing: 0.08em;
        }
        .dash-search-kbd kbd {
          padding: 2px 5px;
          border: 1px solid var(--line-soft);
          background: var(--bg);
          font: inherit; font-size: 10px;
        }

        .dash-nav-right {
          display: flex; align-items: center;
          height: 100%;
          border-left: 1px solid var(--line-soft);
        }
        .dash-nav-item {
          padding: 0 16px; height: 100%;
          display: grid; place-items: center;
          font-size: 12px; color: var(--ink-muted);
          border-right: 1px solid var(--line-soft);
          transition: color 150ms, background 150ms;
          text-decoration: none;
          white-space: nowrap;
        }
        .dash-nav-item:hover { color: var(--ink); background: var(--bg-soft); }
        .dash-nav-item.icon { font-size: 15px; width: 48px; padding: 0; }

        .dash-nav-avatar {
          padding: 0 20px; height: 100%;
          display: flex; align-items: center; gap: 10px;
          cursor: pointer;
          transition: background 150ms;
          position: relative;
          text-decoration: none; color: var(--ink);
        }
        .dash-nav-avatar:hover { background: var(--bg-soft); }
        .dash-nav-avatar-pill {
          width: 28px; height: 28px;
          background: var(--accent); color: var(--accent-ink);
          font-size: 11px; font-weight: 600;
          display: grid; place-items: center;
          flex-shrink: 0;
        }
        .dash-nav-avatar-img {
          width: 28px; height: 28px;
          object-fit: cover; flex-shrink: 0;
          border: 1px solid var(--line-soft);
        }
        .dash-nav-avatar-name { font-size: 13px; letter-spacing: -0.005em; }
        .dash-nav-avatar-user { font-size: 11px; color: var(--ink-muted); }
        .dash-nav-avatar-chevron {
          font-size: 10px; color: var(--ink-muted); margin-left: 4px;
        }

        /* ── Usage meter ── */
        .dash-usage {
          display: flex; align-items: center; gap: 14px;
          padding: 0 18px; height: 100%;
          border-right: 1px solid var(--line-soft);
          cursor: pointer;
          transition: background 150ms;
          position: relative;
        }
        .dash-usage:hover { background: var(--bg-soft); }
        .dash-usage-text {
          display: flex; flex-direction: column; gap: 3px;
          min-width: 110px;
        }
        .dash-usage-top {
          display: flex; justify-content: space-between; align-items: baseline;
          font-size: 10px; letter-spacing: 0.1em;
          color: var(--ink-muted); text-transform: uppercase;
        }
        .dash-usage-count { color: var(--ink); font-feature-settings: "tnum"; letter-spacing: 0; }
        .dash-usage-count strong { font-weight: 500; }
        .dash-usage-bar {
          height: 3px; background: var(--bg-soft);
          border: 1px solid var(--line-hairline);
          position: relative; overflow: hidden;
        }
        .dash-usage-bar-fill {
          position: absolute; left: 0; top: 0; bottom: 0;
          background: var(--accent); transition: width 300ms;
        }
        .dash-usage-bar-fill.mid { background: var(--warn); }
        .dash-usage-bar-fill.high { background: oklch(62% 0.18 25); }
        .dash-usage-plan {
          font-size: 9px; letter-spacing: 0.1em;
          padding: 3px 7px;
          border: 1px solid var(--line-soft);
          color: var(--ink-muted); text-transform: uppercase;
        }

        .dash-usage-pop {
          position: absolute;
          top: calc(100% + 8px); right: 0;
          width: 280px;
          background: var(--bg-elevated);
          border: 1px solid var(--line-soft);
          z-index: 50;
          opacity: 0; pointer-events: none;
          transform: translateY(-4px);
          transition: opacity 180ms, transform 180ms;
          cursor: default;
        }
        .dash-usage:hover .dash-usage-pop {
          opacity: 1; pointer-events: auto; transform: translateY(0);
        }
        .dash-usage-pop-head {
          padding: 10px 14px;
          border-bottom: 1px solid var(--line-soft);
          font-size: 10px; letter-spacing: 0.1em;
          color: var(--ink-muted); text-transform: uppercase;
          display: flex; justify-content: space-between;
        }
        .dash-usage-pop-body { padding: 14px; }
        .dash-usage-pop-title { font-size: 14px; letter-spacing: -0.01em; color: var(--ink); }
        .dash-usage-pop-sub {
          margin-top: 6px; font-size: 12px;
          color: var(--ink-soft); line-height: 1.55;
        }
        .dash-usage-pop-row {
          display: flex; justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px dashed var(--line-hairline);
          font-size: 11px;
        }
        .dash-usage-pop-row:last-of-type { border-bottom: 0; }
        .dash-usage-pop-row span:first-child { color: var(--ink-muted); letter-spacing: 0.04em; }
        .dash-usage-pop-row span:last-child { color: var(--ink); }
        .dash-usage-pop-reset {
          margin-top: 10px; padding-top: 10px;
          border-top: 1px solid var(--line-hairline);
          font-size: 10px; color: var(--ink-muted);
          letter-spacing: 0.06em; text-transform: uppercase;
        }
        .dash-usage-pop-cta {
          display: block; margin-top: 14px;
          padding: 10px 12px;
          background: var(--ink); color: var(--bg);
          font-size: 12px; text-align: center; letter-spacing: 0.04em;
          transition: background 150ms;
          text-decoration: none;
        }
        .dash-usage-pop-cta:hover { background: var(--accent); color: var(--accent-ink); }

        /* ── Main layout ── */
        .dash-main {
          display: grid;
          grid-template-columns: 280px 1fr;
          flex: 1; min-height: 0;
        }

        /* ── Sidebar ── */
        .dash-side {
          border-right: 1px solid var(--line-soft);
          background: var(--bg);
          display: flex; flex-direction: column;
          height: calc(100vh - 56px);
          position: sticky; top: 56px;
          overflow: hidden;
        }
        .dash-side-head {
          padding: 16px 20px 12px;
          border-bottom: 1px solid var(--line-soft);
        }
        .dash-side-label {
          font-size: 10px; letter-spacing: 0.12em;
          color: var(--ink-muted); text-transform: uppercase;
          display: flex; justify-content: space-between; align-items: center;
        }
        .dash-side-count { color: var(--ink); }
        .dash-side-filters {
          display: flex; margin-top: 14px;
          border: 1px solid var(--line-soft);
        }
        .dash-side-filter {
          flex: 1; padding: 7px 0;
          font-size: 11px; color: var(--ink-muted);
          letter-spacing: 0.04em;
          border-right: 1px solid var(--line-soft);
          cursor: pointer; text-align: center;
          transition: all 150ms;
        }
        .dash-side-filter:last-child { border-right: 0; }
        .dash-side-filter.active { background: var(--ink); color: var(--bg); }
        .dash-side-filter:hover:not(.active) { background: var(--bg-soft); color: var(--ink); }

        .dash-side-list {
          flex: 1; overflow-y: auto; padding: 4px 0;
        }
        .dash-side-list::-webkit-scrollbar { width: 4px; }
        .dash-side-list::-webkit-scrollbar-track { background: transparent; }
        .dash-side-list::-webkit-scrollbar-thumb { background: var(--line-soft); }

        .dash-side-empty {
          padding: 40px 20px;
          font-size: 12px; color: var(--ink-muted); text-align: center;
        }
        .dash-side-foot {
          padding: 12px 20px;
          border-top: 1px solid var(--line-soft);
          font-size: 11px; color: var(--ink-muted);
          display: flex; justify-content: space-between;
        }

        /* ── Repo rows ── */
        .repo-row {
          padding: 14px 20px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 4px;
          border-bottom: 1px dashed var(--line-hairline);
          cursor: pointer; position: relative;
          transition: background 150ms;
          text-decoration: none; color: var(--ink);
        }
        .repo-row::before {
          content: "";
          position: absolute; left: 0; top: 0; bottom: 0;
          width: 3px; background: transparent;
          transition: background 150ms;
        }
        .repo-row:hover { background: var(--bg-soft); }
        .repo-row.selected { background: var(--bg-soft); }
        .repo-row.selected::before { background: var(--accent); }

        .repo-row-name {
          font-size: 13px; letter-spacing: -0.005em;
          color: var(--ink); font-weight: 500;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .repo-row-org { color: var(--ink-muted); font-weight: 400; }
        .repo-row-vis {
          font-size: 9px; letter-spacing: 0.08em;
          color: var(--ink-muted); padding: 2px 6px;
          border: 1px solid var(--line-soft);
          text-transform: uppercase; justify-self: end; white-space: nowrap;
        }
        .repo-row-vis.private { color: var(--warn); border-color: var(--warn); }
        .repo-row-meta {
          grid-column: 1 / -1;
          display: flex; gap: 10px;
          font-size: 11px; color: var(--ink-muted);
          margin-top: 2px; align-items: center;
          flex-wrap: nowrap; overflow: hidden;
        }
        .repo-row-lang-dot {
          width: 7px; height: 7px;
          display: inline-block; margin-right: 3px;
          vertical-align: middle; border-radius: 50%;
          flex-shrink: 0;
        }

        /* ── Main content ── */
        .dash-content { min-width: 0; display: flex; flex-direction: column; }

        /* ── Cards ── */
        .dash-card {
          border-right: 1px solid var(--line-soft);
          display: flex; flex-direction: column;
        }
        .dash-card:last-child { border-right: 0; }
        .dash-card-head {
          padding: 14px 24px;
          border-bottom: 1px solid var(--line-soft);
          display: flex; justify-content: space-between; align-items: center;
          font-size: 11px; color: var(--ink-muted); letter-spacing: 0.08em;
        }
        .dash-card-head-title {
          color: var(--ink); letter-spacing: 0.04em;
          display: flex; align-items: center; gap: 8px;
        }
        .dash-card-head-title .num { color: var(--ink-muted); }
        .dash-card-head-actions { display: flex; gap: 12px; font-size: 11px; }
        .dash-card-head-actions a { color: var(--ink-muted); transition: color 150ms; text-decoration: none; }
        .dash-card-head-actions a:hover { color: var(--accent); }

        /* ── Crumb ── */
        .dash-crumb {
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 32px;
          border-bottom: 1px solid var(--line-soft);
          font-size: 12px; color: var(--ink-muted);
        }
        .dash-crumb-path {
          display: flex; align-items: center; gap: 10px;
          letter-spacing: 0.04em; min-width: 0; overflow: hidden;
        }
        .dash-crumb-path strong { color: var(--ink); font-weight: 500; }
        .dash-crumb-path .sep { color: var(--ink-muted); }
        .dash-crumb-back {
          display: inline-flex; align-items: center; gap: 5px;
          color: var(--ink-muted); text-decoration: none;
          transition: color 150ms;
        }
        .dash-crumb-back:hover { color: var(--ink); }
        .dash-crumb-actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
        .dash-crumb-btn {
          padding: 6px 12px; font-size: 11px; letter-spacing: 0.04em;
          border: 1px solid var(--line-soft); color: var(--ink-soft);
          transition: all 150ms; text-decoration: none;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .dash-crumb-btn:hover { color: var(--ink); border-color: var(--line); }
        .dash-crumb-btn.primary { background: var(--ink); color: var(--bg); border-color: var(--ink); }
        .dash-crumb-btn.primary:hover { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }

        /* ── Hero band ── */
        .dash-hero-band {
          padding: 36px 32px 28px;
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 40px;
          border-bottom: 1px solid var(--line-soft);
          align-items: end;
        }
        .dash-hero-title {
          font-size: clamp(28px, 3vw, 42px);
          line-height: 1; letter-spacing: -0.025em; color: var(--ink);
          margin-top: 12px;
        }
        .dash-hero-title .accent {
          color: var(--accent);
          font-family: var(--font-instrument, Georgia, serif);
          font-style: italic;
        }
        .dash-hero-desc {
          margin-top: 14px; font-size: 13px;
          color: var(--ink-soft); line-height: 1.6; max-width: 540px;
        }
        .dash-hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 10px; letter-spacing: 0.12em;
          color: var(--ink-muted); text-transform: uppercase;
        }
        .dash-hero-eyebrow-dot {
          width: 6px; height: 6px;
          background: var(--ok); border-radius: 50%;
        }
        .dash-hero-stats {
          display: grid; grid-template-columns: repeat(3, 1fr);
          border: 1px solid var(--line-soft);
        }
        .hero-stat {
          padding: 16px 18px;
          border-right: 1px solid var(--line-soft);
        }
        .hero-stat:last-child { border-right: 0; }
        .hero-stat-k {
          font-size: 10px; letter-spacing: 0.12em;
          color: var(--ink-muted); text-transform: uppercase;
        }
        .hero-stat-v {
          font-size: 24px; margin-top: 4px;
          letter-spacing: -0.015em; color: var(--ink);
          font-feature-settings: "tnum";
        }
        .hero-stat-sub { font-size: 11px; color: var(--ink-muted); margin-top: 2px; }

        /* ── Analysis section ── */
        .dash-analysis {
          padding: 32px;
          flex: 1;
        }
        .dash-analysis-empty {
          display: flex; flex-direction: column; align-items: flex-start;
          gap: 16px; padding: 48px 32px;
        }
        .dash-analysis-empty-label {
          font-size: 10px; letter-spacing: 0.12em;
          color: var(--ink-muted); text-transform: uppercase;
        }
        .dash-analysis-empty-title {
          font-size: 28px; letter-spacing: -0.02em;
          color: var(--ink); line-height: 1.1;
        }
        .dash-analysis-empty-title .accent { color: var(--accent); }
        .dash-analysis-empty-desc {
          font-size: 13px; color: var(--ink-soft); line-height: 1.6;
          max-width: 460px;
        }

        /* ── Dashboard landing (no repo selected) ── */
        .dash-welcome {
          padding: 72px 40px;
          display: flex; flex-direction: column;
          align-items: flex-start; gap: 20px;
          border-bottom: 1px solid var(--line-soft);
        }
        .dash-welcome-label {
          font-size: 10px; letter-spacing: 0.14em;
          color: var(--ink-muted); text-transform: uppercase;
        }
        .dash-welcome-title {
          font-size: clamp(32px, 4vw, 52px);
          line-height: 1; letter-spacing: -0.025em; color: var(--ink);
        }
        .dash-welcome-title .accent {
          color: var(--accent);
          font-family: var(--font-instrument, Georgia, serif);
          font-style: italic;
        }
        .dash-welcome-sub {
          font-size: 13px; color: var(--ink-soft); line-height: 1.65;
          max-width: 520px;
        }
        .dash-welcome-input-wrap { width: 100%; max-width: 560px; margin-top: 8px; }

        /* ── Repo input inside dashboard ── */
        .dash-repo-input-row {
          display: flex;
          border: 1px solid var(--line);
          background: var(--bg-elevated);
          transition: border-color 150ms;
        }
        .dash-repo-input-row:focus-within { border-color: var(--accent); }
        .dash-repo-input {
          flex: 1; padding: 14px 16px;
          background: transparent; border: 0; outline: 0;
          font: inherit; font-size: 13px; color: var(--ink);
        }
        .dash-repo-input::placeholder { color: var(--ink-muted); }
        .dash-repo-submit {
          padding: 0 20px;
          background: var(--ink); color: var(--bg);
          font-size: 13px; letter-spacing: 0.02em;
          border: 0; cursor: pointer;
          transition: background 150ms;
        }
        .dash-repo-submit:hover { background: var(--accent); color: var(--accent-ink); }

        /* ── Responsive ── */
        @media (max-width: 1180px) {
          .dash-main { grid-template-columns: 240px 1fr; }
          .dash-nav { grid-template-columns: 240px 1fr auto; }
          .dash-side { width: 240px; }
          .dash-usage-text { min-width: 90px; }
          .dash-usage-plan { display: none; }
        }
        @media (max-width: 900px) {
          .dash-main { grid-template-columns: 1fr; }
          .dash-nav { grid-template-columns: auto 1fr auto; }
          .dash-nav-brand { padding: 0 16px; }
          .dash-side { display: none; }
          .dash-hero-band { grid-template-columns: 1fr; }
          .dash-usage { display: none; }
        }
      `}</style>

      <div className="dash-root">
        {/* Nav */}
        <nav className="dash-nav">
          <Link href="/dashboard" className="dash-nav-brand">
            <span className="dash-nav-brand-mark">R</span>
            <span>repobrief</span>
            <span className="dash-nav-brand-tag">beta</span>
          </Link>

          <div className="dash-search">
            <div className="dash-search-input">
              <svg
                width="14"
                height="14"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                opacity="0.6"
              >
                <circle cx="8" cy="8" r="6" />
                <path d="M13 13l4 4" />
              </svg>
              <input
                id="dash-search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="search repos — or paste a github.com URL to analyze…"
              />
            </div>
          </div>

          <div className="dash-nav-right">
            <UsageMeter {...usage} />
            <button
              className="dash-nav-item icon"
              onClick={() =>
                setTheme((t) => (t === "light" ? "dark" : "light"))
              }
              title="toggle theme"
            >
              {theme === "light" ? "◑" : "◐"}
            </button>
            <Link href="/dashboard/settings" className="dash-nav-avatar">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name ?? "avatar"}
                  className="dash-nav-avatar-img"
                />
              ) : (
                <div className="dash-nav-avatar-pill">{userInitials}</div>
              )}
              <div>
                <div className="dash-nav-avatar-name">
                  {user.name ?? user.email}
                </div>
                <div className="dash-nav-avatar-user">
                  @{(user.name ?? "").toLowerCase().replace(/\s+/g, "")}
                </div>
              </div>
              <span className="dash-nav-avatar-chevron">›</span>
            </Link>
          </div>
        </nav>

        {/* Body */}
        <div className="dash-main">
          {/* Sidebar */}
          <aside className="dash-side">
            <div className="dash-side-head">
              <div className="dash-side-label">
                <span>{"// REPOSITORIES"}</span>
                <span className="dash-side-count">
                  {filtered.length}/{repos.length}
                </span>
              </div>
              <div className="dash-side-filters">
                {(["all", "private", "public"] as const).map((k) => (
                  <button
                    key={k}
                    className={`dash-side-filter${filter === k ? " active" : ""}`}
                    onClick={() => setFilter(k)}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>

            <div className="dash-side-list">
              {filtered.length === 0 && (
                <div className="dash-side-empty">
                  no repos match &quot;{query}&quot;
                </div>
              )}
              {filtered.map((r) => {
                const [owner, repoName] = r.full_name.split("/");
                const isSelected = selectedId === r.full_name;
                const langColor = r.language
                  ? (LANG_COLORS[r.language] ?? "oklch(60% 0.05 0)")
                  : undefined;
                const updated = r.updated_at ?? r.pushed_at;

                return (
                  <Link
                    key={r.id}
                    href={`/dashboard/${owner}/${repoName}`}
                    className={`repo-row${isSelected ? " selected" : ""}`}
                  >
                    <div className="repo-row-name">
                      <span className="repo-row-org">{owner}/</span>
                      {repoName}
                    </div>
                    <div
                      className={`repo-row-vis${r.private ? " private" : ""}`}
                    >
                      {r.private ? "priv" : "pub"}
                    </div>
                    <div className="repo-row-meta">
                      {r.language && (
                        <span>
                          <span
                            className="repo-row-lang-dot"
                            style={{ background: langColor }}
                          />
                          {r.language}
                        </span>
                      )}
                      <span>★ {r.stargazers_count}</span>
                      {updated && <span>{relativeTime(updated)}</span>}
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="dash-side-foot">
              <span>
                {repos.length} repos · {repos.filter((r) => r.private).length}{" "}
                private
              </span>
            </div>
          </aside>

          {/* Content */}
          <div className="dash-content">{children}</div>
        </div>
      </div>
    </>
  );
}
