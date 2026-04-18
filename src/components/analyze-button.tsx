"use client";

import { useTransition, useState, useRef } from "react";
import { parseAnalysisXml, type AnalysisResult } from "@/lib/parse-xml";
import { MermaidDiagram } from "@/components/mermaid-diagram";

interface Props {
  owner: string;
  repo: string;
  isAnonymous?: boolean;
}

interface TechItem {
  name: string;
  category: string;
  version?: string;
}

function parseTechStack(raw: string): TechItem[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  language:  { bg: "rgba(49,120,198,0.08)",  text: "#3178c6", border: "rgba(49,120,198,0.2)" },
  framework: { bg: "rgba(139,92,246,0.08)",  text: "#7c3aed", border: "rgba(139,92,246,0.2)" },
  database:  { bg: "rgba(16,185,129,0.08)",  text: "#059669", border: "rgba(16,185,129,0.2)" },
  devops:    { bg: "rgba(217,119,87,0.1)",   text: "#c2603a", border: "rgba(217,119,87,0.25)" },
  auth:      { bg: "rgba(234,179,8,0.08)",   text: "#b45309", border: "rgba(234,179,8,0.2)" },
  testing:   { bg: "rgba(236,72,153,0.08)",  text: "#be185d", border: "rgba(236,72,153,0.2)" },
  other:     { bg: "rgba(0,0,0,0.04)",       text: "#6d6c65", border: "rgba(0,0,0,0.09)" },
};

function catStyle(cat: string) {
  return CATEGORY_COLORS[cat.toLowerCase()] ?? CATEGORY_COLORS.other;
}

const S = {
  card: {
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.07)",
    borderRadius: 14,
    overflow: "hidden" as const,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  cardHead: {
    padding: "14px 20px",
    borderBottom: "1px solid rgba(0,0,0,0.07)",
    background: "#f8f7f4",
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  cardTitle: {
    fontFamily: "var(--mono)",
    fontSize: 11,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "var(--muted)",
  },
  cardBody: { padding: "20px" },
};

export function AnalyzeButton({ owner, repo, isAnonymous = false }: Props) {
  const [isPending, startTransition] = useTransition();
  const [streamText, setStreamText]   = useState("");
  const [result, setResult]           = useState<AnalysisResult | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const [cacheStatus, setCacheStatus] = useState<{ hit: boolean; commitSha: string; age: number } | null>(null);
  const [copied, setCopied]           = useState(false);
  const abortRef                      = useRef<AbortController | null>(null);

  function handleCancel() { abortRef.current?.abort(); }

  function handleAnalyze(force = false) {
    setError(null); setResult(null); setStreamText(""); setCacheStatus(null);
    const controller = new AbortController();
    abortRef.current = controller;

    startTransition(async () => {
      let res: Response;
      try {
        res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ owner, repo, ...(force ? { force: true } : {}) }),
          signal: controller.signal,
        });
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError("Network error. Please try again.");
        return;
      }

      if (!res.ok) {
        if (res.status === 401) {
          setError(isAnonymous ? "Sign in to analyze private repositories." : "Session expired. Please sign in again.");
          return;
        }
        if (res.status === 429) {
          const data: unknown = await res.json().catch(() => ({}));
          const msg = typeof data === "object" && data !== null && "error" in data && typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Rate limit reached. Please try again later.";
          setError(msg);
          return;
        }
        const data: unknown = await res.json().catch(() => ({}));
        const message = typeof data === "object" && data !== null && "error" in data && typeof (data as { error: unknown }).error === "string"
          ? (data as { error: string }).error
          : `Analysis failed (${res.status}). Please try again.`;
        setError(message);
        return;
      }

      const xCache    = res.headers.get("X-Cache");
      const xCommit   = res.headers.get("X-Commit-SHA") ?? "";
      const xAge      = parseInt(res.headers.get("X-Cache-Age") ?? "0", 10);
      const isHit     = xCache === "HIT";
      setCacheStatus({ hit: isHit, commitSha: xCommit, age: xAge });

      if (isHit) {
        const parsed = parseAnalysisXml(await res.text());
        const hasContent = parsed.description || parsed.architecture || parsed.file_map || parsed.onboarding || parsed.tech_stack;
        if (!hasContent) {
          setError("Analysis returned no content. Your API key may be invalid or the model returned an unexpected response.");
          return;
        }
        setResult(parsed);
        return;
      }

      const stream = res.body;
      if (!stream) { setError("No response stream."); return; }

      const reader  = stream.getReader();
      const decoder = new TextDecoder();
      let full      = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (controller.signal.aborted) { await reader.cancel(); break; }
          if (value) { const chunk = decoder.decode(value, { stream: true }); full += chunk; setStreamText(full); }
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError("Stream interrupted. Please try again.");
        return;
      }

      if (controller.signal.aborted) return;
      full += decoder.decode();
      setStreamText(full);
      const parsed = parseAnalysisXml(full);
      const hasContent = parsed.description || parsed.architecture || parsed.file_map || parsed.onboarding || parsed.tech_stack;
      if (!hasContent) {
        setError("Analysis returned no content. Your API key may be invalid or the model returned an unexpected response.");
        setStreamText("");
        return;
      }
      setResult(parsed);
      setStreamText("");
    });
  }

  function handleExport(r: AnalysisResult) {
    const lines: string[] = [`# ${owner}/${repo} — RepoBrief Analysis`, ""];
    if (r.description) lines.push("## Description", "", r.description, "");
    if (r.architecture) lines.push("## Architecture", "", "```mermaid", r.architecture, "```", "");
    if (r.file_map) lines.push("## File Map", "", r.file_map, "");
    if (r.onboarding) lines.push("## Getting Started", "", r.onboarding, "");
    if (r.tech_stack) {
      try {
        const items = JSON.parse(r.tech_stack) as TechItem[];
        if (items.length > 0) {
          lines.push("## Tech Stack", "");
          lines.push(...items.map((t) => `- **${t.name}**${t.version ? ` ${t.version}` : ""} _(${t.category})_`));
          lines.push("");
        }
      } catch { /* skip */ }
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/markdown" }));
    a.download = `${owner}-${repo}-repobrief.md`;
    a.click();
  }

  function handleShare() {
    navigator.clipboard.writeText(`${window.location.origin}/analysis/${owner}/${repo}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function formatAge(age: number) {
    if (age < 3600) return `${Math.floor(age / 60)}m ago`;
    if (age < 86400) return `${Math.floor(age / 3600)}h ago`;
    return `${Math.floor(age / 86400)}d ago`;
  }

  const showStreaming = isPending || (streamText.length > 0 && result === null && !error);

  return (
    <>
      <style>{`
        @keyframes ab-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes ab-pulse {
          0%,100% { opacity:.4; } 50% { opacity:1; }
        }
        @keyframes ab-blink {
          0%,100%{opacity:1} 50%{opacity:0}
        }
        @keyframes ab-skeleton {
          0%,100%{opacity:.5} 50%{opacity:.25}
        }
        .ab-btn {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: var(--sans); font-size: 14px; font-weight: 600;
          color: #fff; background: var(--text);
          padding: 12px 22px; border-radius: 8px; border: none; cursor: pointer;
          transition: opacity .15s, transform .2s;
        }
        .ab-btn:hover:not(:disabled) { opacity: 0.82; transform: translateY(-1px); }
        .ab-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
        .ab-btn-ghost {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: var(--sans); font-size: 13px; font-weight: 400;
          color: var(--muted); background: none;
          padding: 12px 16px; border-radius: 8px;
          border: 1px solid var(--border); cursor: pointer;
          transition: color .15s, border-color .15s, background .15s;
        }
        .ab-btn-ghost:hover { color: var(--text); border-color: rgba(0,0,0,0.14); background: rgba(0,0,0,0.03); }
        .ab-spinner {
          width: 14px; height: 14px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          animation: ab-spin .7s linear infinite;
        }
        .ab-toolbar { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }

        .ab-error {
          background: #fff8f8; border: 1px solid rgba(239,68,68,0.2);
          border-radius: 10px; padding: 14px 18px; margin-bottom: 16px;
          font-size: 13px; color: #dc2626; font-weight: 300; line-height: 1.6;
        }

        /* Stream terminal */
        .ab-terminal {
          background: #0f0e0d; border-radius: 12px; overflow: hidden;
          margin-bottom: 16px;
          border: 1px solid rgba(255,255,255,0.06);
          box-shadow: 0 4px 20px rgba(0,0,0,0.12);
        }
        .ab-term-bar {
          background: #1a1918; padding: 10px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; gap: 6px;
        }
        .ab-dot { width: 10px; height: 10px; border-radius: 50%; }
        .ab-term-label {
          font-family: var(--mono); font-size: 11px; color: #4a4947; margin-left: 8px;
        }
        .ab-term-body {
          padding: 18px 20px; max-height: min(70vh, 30rem);
          overflow-y: auto; font-family: var(--mono); font-size: 12px;
          color: #7a7970; line-height: 1.85; white-space: pre-wrap; word-break: break-all;
        }
        .ab-cursor { display: inline-block; width: 7px; height: 13px; background: var(--coral); vertical-align: middle; margin-left: 3px; animation: ab-blink 1s step-end infinite; }

        /* Skeleton */
        .ab-skeleton-bar {
          height: 10px; border-radius: 5px; background: rgba(0,0,0,0.06);
          animation: ab-skeleton 1.4s ease-in-out infinite;
        }

        /* Result cards */
        .ab-section { margin-bottom: 14px; }
        .ab-section-head {
          padding: 13px 20px;
          border-bottom: 1px solid rgba(0,0,0,0.07);
          background: #f8f7f4;
          display: flex; align-items: center; justify-content: space-between;
        }
        .ab-section-label {
          font-family: var(--mono); font-size: 10px; letter-spacing: 0.09em;
          text-transform: uppercase; color: var(--muted);
        }
        .ab-section-body { padding: 20px; }

        .ab-desc {
          font-size: 14px; color: var(--muted); font-weight: 300;
          line-height: 1.82; white-space: pre-line;
        }
        .ab-tech-grid { display: flex; flex-wrap: wrap; gap: 6px; }
        .ab-tech-badge {
          display: inline-flex; align-items: center; gap: 4px;
          font-family: var(--mono); font-size: 11px; font-weight: 500;
          padding: 4px 10px; border-radius: 5px;
        }
        .ab-tech-version { opacity: 0.55; font-weight: 400; }

        .ab-filemap { display: flex; flex-direction: column; gap: 6px; }
        .ab-filemap-row { display: flex; align-items: baseline; gap: 10px; }
        .ab-file-path {
          font-family: var(--mono); font-size: 11px; color: var(--muted);
          flex-shrink: 0; white-space: nowrap;
        }
        .ab-file-divider { width: 1px; background: var(--border); flex-shrink: 0; align-self: stretch; }
        .ab-file-desc { font-size: 12px; color: var(--muted); font-weight: 300; line-height: 1.6; }

        .ab-onboarding {
          font-size: 14px; color: var(--muted); font-weight: 300;
          line-height: 1.82; white-space: pre-line;
        }

        /* Cache badge */
        .ab-cache-badge {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: var(--mono); font-size: 11px;
          padding: 4px 12px; border-radius: 6px;
          margin-bottom: 16px;
        }
        .ab-cache-hit   { color: #059669; background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); }
        .ab-cache-fresh { color: var(--coral); background: var(--coral-dim); border: 1px solid rgba(217,119,87,0.2); }
        .ab-cache-sha   { opacity: 0.5; }

        /* Anonymous CTA */
        .ab-anon-cta {
          background: #fff; border: 1px solid rgba(217,119,87,0.25);
          border-radius: 12px; padding: 20px 22px;
          margin-bottom: 16px;
        }
        .ab-anon-title {
          font-family: var(--mono); font-size: 11px; letter-spacing: 0.06em;
          color: var(--coral); margin-bottom: 6px;
        }
        .ab-anon-desc {
          font-size: 13px; color: var(--muted); font-weight: 300;
          line-height: 1.7; margin-bottom: 14px;
        }
        .ab-anon-btn {
          display: inline-flex; align-items: center; gap: 7px;
          font-family: var(--sans); font-size: 13px; font-weight: 600;
          color: #fff; background: var(--coral);
          padding: 10px 18px; border-radius: 7px; text-decoration: none;
          transition: opacity .15s;
        }
        .ab-anon-btn:hover { opacity: 0.88; }
      `}</style>

      {/* Toolbar */}
      <div className="ab-toolbar">
        <button
          className="ab-btn"
          onClick={() => handleAnalyze()}
          disabled={isPending}
        >
          {isPending ? <><span className="ab-spinner" /> Analyzing…</> : "Analyze with Claude"}
        </button>

        {isPending && (
          <button className="ab-btn-ghost" onClick={handleCancel}>Cancel</button>
        )}

        {result && !isPending && !error && (
          <>
            <button className="ab-btn-ghost" onClick={handleShare}>
              {copied ? "✓ Copied!" : "Share link"}
            </button>
            <button className="ab-btn-ghost" onClick={() => handleExport(result)}>
              Export MD
            </button>
            {cacheStatus?.hit && (
              <button className="ab-btn-ghost" onClick={() => handleAnalyze(true)}>
                Re-analyze
              </button>
            )}
          </>
        )}
      </div>

      {/* Error */}
      {error && <div className="ab-error">{error}</div>}

      {/* Streaming terminal */}
      {showStreaming && (
        <>
          <div className="ab-terminal ab-section">
            <div className="ab-term-bar">
              <div className="ab-dot" style={{ background: "#ff5f57" }} />
              <div className="ab-dot" style={{ background: "#febc2e" }} />
              <div className="ab-dot" style={{ background: "#28c840" }} />
              <span className="ab-term-label">analyzing {owner}/{repo} ···</span>
            </div>
            <div className="ab-term-body">
              {streamText.length === 0
                ? <span style={{ color: "#4a4947" }}>Starting…</span>
                : <>{streamText}<span className="ab-cursor" /></>
              }
            </div>
          </div>

          {/* Skeleton placeholders */}
          {["Description", "Tech Stack", "Architecture", "File Map", "Getting Started"].map((label) => (
            <div key={label} style={{ ...S.card, marginBottom: 14 }}>
              <div style={S.cardHead}>
                <span style={S.cardTitle}>{label}</span>
              </div>
              <div style={S.cardBody}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div className="ab-skeleton-bar" style={{ width: "100%" }} />
                  <div className="ab-skeleton-bar" style={{ width: "80%" }} />
                  <div className="ab-skeleton-bar" style={{ width: "60%" }} />
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Result */}
      {result && (
        <div>
          {/* Cache status */}
          {cacheStatus && (
            <div className={`ab-cache-badge ${cacheStatus.hit ? "ab-cache-hit" : "ab-cache-fresh"}`}>
              {cacheStatus.hit ? "⚡ Cached" : "✦ Fresh analysis"}
              {cacheStatus.commitSha && (
                <span className="ab-cache-sha">· {cacheStatus.commitSha.slice(0, 7)}</span>
              )}
              {cacheStatus.age > 0 && (
                <span className="ab-cache-sha">· {formatAge(cacheStatus.age)}</span>
              )}
            </div>
          )}

          {/* Anonymous CTA */}
          {isAnonymous && (
            <div className="ab-anon-cta ab-section">
              <p className="ab-anon-title">◆ Sign in to save &amp; share this analysis</p>
              <p className="ab-anon-desc">
                Free account: 5 analyses/month, shareable links, export to Markdown.
              </p>
              <a href="/auth" className="ab-anon-btn">Get started free →</a>
            </div>
          )}

          {/* Description */}
          {result.description && (
            <div style={{ ...S.card, marginBottom: 14 }}>
              <div style={S.cardHead}>
                <span style={S.cardTitle}>Description</span>
              </div>
              <div style={S.cardBody}>
                <p className="ab-desc">{result.description}</p>
              </div>
            </div>
          )}

          {/* Tech Stack */}
          {result.tech_stack && (
            <div style={{ ...S.card, marginBottom: 14 }}>
              <div style={S.cardHead}>
                <span style={S.cardTitle}>Tech Stack</span>
              </div>
              <div style={S.cardBody}>
                <div className="ab-tech-grid">
                  {parseTechStack(result.tech_stack).map((item, i) => {
                    const cs = catStyle(item.category);
                    return (
                      <span
                        key={i}
                        className="ab-tech-badge"
                        style={{ background: cs.bg, color: cs.text, border: `1px solid ${cs.border}` }}
                      >
                        {item.name}
                        {item.version && <span className="ab-tech-version">{item.version}</span>}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Architecture */}
          {result.architecture && (
            <div style={{ ...S.card, marginBottom: 14 }}>
              <div style={S.cardHead}>
                <span style={S.cardTitle}>Architecture</span>
              </div>
              <div style={S.cardBody}>
                <MermaidDiagram chart={result.architecture} />
              </div>
            </div>
          )}

          {/* File Map */}
          {result.file_map && (
            <div style={{ ...S.card, marginBottom: 14 }}>
              <div style={S.cardHead}>
                <span style={S.cardTitle}>File Map</span>
              </div>
              <div style={S.cardBody}>
                <div className="ab-filemap">
                  {result.file_map.split("\n").filter(Boolean).map((line, i) => {
                    const [path, ...rest] = line.split("→");
                    return (
                      <div key={i} className="ab-filemap-row">
                        <span className="ab-file-path">{path?.trim()}</span>
                        {rest.length > 0 && (
                          <>
                            <div className="ab-file-divider" />
                            <span className="ab-file-desc">{rest.join("→").trim()}</span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Onboarding */}
          {result.onboarding && (
            <div style={{ ...S.card, marginBottom: 14 }}>
              <div style={S.cardHead}>
                <span style={S.cardTitle}>Getting Started</span>
              </div>
              <div style={S.cardBody}>
                <p className="ab-onboarding">{result.onboarding}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
