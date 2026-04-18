"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

interface Repo {
  id: number;
  full_name: string;
  description: string | null;
  language: string | null;
  private: boolean;
  stargazers_count: number;
  updated_at: string | null;
  pushed_at: string | null;
}

interface RepoListProps {
  repos: Repo[];
}

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

export function RepoList({ repos }: RepoListProps) {
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState<string>("all");

  const languages = useMemo(() => {
    const set = new Set<string>();
    for (const r of repos) if (r.language) set.add(r.language);
    return Array.from(set).sort();
  }, [repos]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return repos.filter((r) => {
      const matchesQuery =
        q === "" ||
        r.full_name.toLowerCase().includes(q) ||
        (r.description ?? "").toLowerCase().includes(q);
      const matchesLang = lang === "all" || r.language === lang;
      return matchesQuery && matchesLang;
    });
  }, [repos, query, lang]);

  const hasFilter = query.trim() !== "" || lang !== "all";

  return (
    <>
      <style>{`
        .rl-filter-bar {
          display: flex; gap: 8px; margin-bottom: 16px;
        }
        .rl-search {
          flex: 1; min-width: 0;
          padding: 9px 14px;
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-family: var(--mono); font-size: 12px;
          color: var(--text); outline: none;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          transition: border-color .15s;
        }
        .rl-search::placeholder { color: var(--dim); }
        .rl-search:focus { border-color: rgba(217,119,87,0.4); }
        .rl-select {
          padding: 9px 32px 9px 12px;
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-family: var(--mono); font-size: 11px;
          color: var(--muted); outline: none; cursor: pointer;
          appearance: none; -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23a8a7a0'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          background-color: #fff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          transition: border-color .15s;
        }
        .rl-select:focus { border-color: rgba(217,119,87,0.4); color: var(--text); }
        .rl-select option { background: #fff; color: var(--text); }

        .rl-header {
          display: flex; align-items: baseline; justify-content: space-between;
          margin-bottom: 12px;
        }
        .rl-title {
          font-family: var(--serif);
          font-size: 1.4rem; font-weight: 700;
          letter-spacing: -0.02em; color: var(--text);
        }
        .rl-count {
          font-family: var(--mono); font-size: 11px; color: var(--dim);
        }

        .rl-list { display: flex; flex-direction: column; gap: 2px; }
        .rl-card {
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; padding: 14px 16px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: #fff;
          text-decoration: none;
          transition: border-color .15s, background .15s, box-shadow .15s;
        }
        .rl-card:hover {
          border-color: rgba(217,119,87,0.3);
          background: rgba(217,119,87,0.025);
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .rl-left { min-width: 0; flex: 1; }
        .rl-name {
          font-size: 13px; font-weight: 600; color: var(--text);
          letter-spacing: -0.01em; white-space: nowrap;
          overflow: hidden; text-overflow: ellipsis; margin-bottom: 3px;
        }
        .rl-desc {
          font-family: var(--mono); font-size: 11px; color: var(--dim);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .rl-right {
          display: flex; align-items: center; gap: 12px; flex-shrink: 0;
        }
        .rl-private {
          font-family: var(--mono); font-size: 10px;
          color: var(--coral); border: 1px solid rgba(217,119,87,0.25);
          background: var(--coral-dim);
          padding: 1px 7px; border-radius: 4px;
        }
        .rl-lang {
          display: flex; align-items: center; gap: 5px;
          font-family: var(--mono); font-size: 11px; color: var(--muted);
        }
        .lang-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .rl-stars {
          font-family: var(--mono); font-size: 11px; color: var(--dim);
          display: flex; align-items: center; gap: 3px;
        }
        .rl-time {
          font-family: var(--mono); font-size: 11px; color: var(--dim);
          min-width: 52px; text-align: right;
        }
        .rl-arrow { color: var(--dim); font-size: 12px; }

        .rl-empty {
          padding: 48px 0;
          display: flex; flex-direction: column; align-items: center; gap: 12px;
        }
        .rl-empty-label {
          font-family: var(--mono); font-size: 12px; color: var(--dim);
        }
        .rl-clear {
          font-family: var(--mono); font-size: 11px; color: var(--muted);
          background: none; border: 1px solid var(--border);
          padding: 5px 14px; border-radius: 6px; cursor: pointer;
          transition: color .15s, border-color .15s;
        }
        .rl-clear:hover { color: var(--text); border-color: rgba(0,0,0,0.15); }
      `}</style>

      <div className="rl-filter-bar">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search repositories…"
          className="rl-search"
        />
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="rl-select"
          disabled={languages.length === 0}
        >
          <option value="all">All languages</option>
          {languages.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      <div className="rl-header">
        <h1 className="rl-title">Repositories</h1>
        <span className="rl-count">
          {hasFilter ? `${filtered.length} / ${repos.length}` : `${repos.length} repos`}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="rl-empty">
          <span className="rl-empty-label">No repos match</span>
          <button className="rl-clear" onClick={() => { setQuery(""); setLang("all"); }}>
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="rl-list" style={{ listStyle: "none" }}>
          {filtered.map((repo) => {
            const [owner, repoName] = repo.full_name.split("/");
            const langColor = repo.language ? (LANG_COLORS[repo.language] ?? "#a8a7a0") : null;

            return (
              <li key={repo.id}>
                <Link href={`/dashboard/${owner}/${repoName}`} className="rl-card">
                  <div className="rl-left">
                    <p className="rl-name">{repo.full_name}</p>
                    <p className="rl-desc">{repo.description ?? "No description"}</p>
                  </div>
                  <div className="rl-right">
                    {repo.private && <span className="rl-private">private</span>}
                    {repo.language && langColor && (
                      <span className="rl-lang">
                        <span className="lang-dot" style={{ background: langColor }} />
                        {repo.language}
                      </span>
                    )}
                    <span className="rl-stars">⭐ {repo.stargazers_count}</span>
                    <span className="rl-time">
                      {relativeTime(repo.updated_at ?? repo.pushed_at ?? "")}
                    </span>
                    <span className="rl-arrow">→</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
