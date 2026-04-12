import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { MermaidDiagram } from "@/components/mermaid-diagram";
import Link from "next/link";
import type { AnalysisResult } from "@/lib/parse-xml";

interface Props {
  params: Promise<{ owner: string; repo: string }>;
}

interface TechItem {
  name: string;
  category: string;
  version?: string;
}

const CATEGORY_STYLES: Record<string, string> = {
  language:  "bg-blue-100/10 text-blue-300 border border-blue-500/20",
  framework: "bg-purple-100/10 text-purple-300 border border-purple-500/20",
  database:  "bg-green-100/10 text-green-300 border border-green-500/20",
  devops:    "bg-orange-100/10 text-orange-300 border border-orange-500/20",
  auth:      "bg-yellow-100/10 text-yellow-300 border border-yellow-500/20",
  testing:   "bg-pink-100/10 text-pink-300 border border-pink-500/20",
  other:     "bg-zinc-100/5 text-zinc-400 border border-zinc-700",
};

function categoryStyle(category: string) {
  return CATEGORY_STYLES[category.toLowerCase()] ?? CATEGORY_STYLES["other"];
}

export default async function AnalysisPage({ params }: Props) {
  const { owner, repo } = await params;

  const analysis = await db.analysis.findFirst({
    where: { owner, repo },
    orderBy: { createdAt: "desc" },
  });

  if (!analysis) notFound();

  // Increment view count (fire-and-forget)
  db.analysis
    .update({
      where: { id: analysis.id },
      data: { viewCount: { increment: 1 } },
    })
    .catch(() => {});

  const result = analysis.result as unknown as AnalysisResult;

  let techItems: TechItem[] = [];
  if (result.tech_stack) {
    try {
      techItems = JSON.parse(result.tech_stack) as TechItem[];
    } catch { /* skip */ }
  }

  const fileLines = result.file_map
    ? result.file_map.split("\n").filter(Boolean)
    : [];

  return (
    <>
      <style>{`
        .analysis-page { max-width: 860px; margin: 0 auto; padding: 40px 24px 80px; }
        .analysis-nav {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 40px;
        }
        .brand-link {
          font-family: ui-monospace, monospace; font-size: 13px; font-weight: 700;
          color: #a3e635; text-decoration: none; letter-spacing: -0.02em;
        }
        .brand-link:hover { color: #bef264; }
        .cta-btn {
          font-family: ui-monospace, monospace; font-size: 11px;
          background: #a3e635; color: #000; border-radius: 3px;
          padding: 6px 14px; text-decoration: none; font-weight: 700;
          transition: background .15s;
        }
        .cta-btn:hover { background: #bef264; }
        .analysis-hero { margin-bottom: 36px; }
        .analysis-owner {
          font-family: ui-monospace, monospace; font-size: 12px; color: #52525b;
          margin-bottom: 6px;
        }
        .analysis-reponame {
          font-size: 28px; font-weight: 900; letter-spacing: -0.04em;
          color: #f4f4f5; margin-bottom: 10px; line-height: 1.1;
        }
        .analysis-meta {
          display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
        }
        .meta-chip {
          font-family: ui-monospace, monospace; font-size: 10px; color: #3f3f46;
          border: 1px solid rgba(255,255,255,0.06); border-radius: 3px; padding: 2px 8px;
        }
        .section {
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 4px;
          background: rgba(255,255,255,0.015);
          margin-bottom: 16px;
          overflow: hidden;
        }
        .section-header {
          padding: 10px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          display: flex; align-items: center; gap-8px;
        }
        .section-label {
          font-family: ui-monospace, monospace; font-size: 10px;
          color: #52525b; text-transform: uppercase; letter-spacing: 0.1em;
        }
        .section-body { padding: 18px; }
        .desc-text {
          font-size: 14px; color: #a1a1aa; line-height: 1.75;
          white-space: pre-line;
        }
        .tech-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
        .tech-badge {
          display: inline-flex; align-items: center; gap: 5px;
          border-radius: 3px; padding: 3px 10px;
          font-family: ui-monospace, monospace; font-size: 11px;
        }
        .tech-version { opacity: 0.5; }
        .file-list { display: flex; flex-direction: column; gap: 4px; }
        .file-row { display: flex; gap: 10px; align-items: baseline; }
        .file-path {
          font-family: ui-monospace, monospace; font-size: 11px;
          color: #52525b; flex-shrink: 0;
          min-width: 200px;
        }
        .file-sep { color: #3f3f46; font-size: 11px; }
        .file-desc { font-size: 11px; color: #52525b; }
        .onboard-text {
          font-family: ui-monospace, monospace; font-size: 12px;
          color: #71717a; line-height: 1.85; white-space: pre-line;
        }
        .footer-bar {
          margin-top: 48px;
          padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.05);
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px;
        }
        .footer-note {
          font-family: ui-monospace, monospace; font-size: 10px; color: #3f3f46;
        }
        .views-badge {
          font-family: ui-monospace, monospace; font-size: 10px; color: #3f3f46;
          border: 1px solid rgba(255,255,255,0.06); border-radius: 3px; padding: 2px 8px;
        }
      `}</style>

      <div className="analysis-page">
        <nav className="analysis-nav">
          <Link href="/" className="brand-link">repobrief</Link>
          <Link href="/auth" className="cta-btn">Try it free →</Link>
        </nav>

        <div className="analysis-hero">
          <p className="analysis-owner">{owner} /</p>
          <h1 className="analysis-reponame">{repo}</h1>
          <div className="analysis-meta">
            <span className="meta-chip">
              {new Date(analysis.createdAt).toLocaleDateString("en-US", {
                year: "numeric", month: "short", day: "numeric",
              })}
            </span>
            <span className="meta-chip">{analysis.commitSha.slice(0, 7)}</span>
            <span className="meta-chip">{analysis.viewCount + 1} view{analysis.viewCount !== 0 ? "s" : ""}</span>
          </div>
        </div>

        {result.description && (
          <div className="section">
            <div className="section-header">
              <span className="section-label">Description</span>
            </div>
            <div className="section-body">
              <p className="desc-text">{result.description}</p>
            </div>
          </div>
        )}

        {techItems.length > 0 && (
          <div className="section">
            <div className="section-header">
              <span className="section-label">Tech Stack</span>
            </div>
            <div className="section-body">
              <div className="tech-wrap">
                {techItems.map((item, i) => (
                  <span key={i} className={`tech-badge ${categoryStyle(item.category)}`}>
                    {item.name}
                    {item.version && <span className="tech-version">{item.version}</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {result.architecture && (
          <div className="section">
            <div className="section-header">
              <span className="section-label">Architecture</span>
            </div>
            <div className="section-body">
              <MermaidDiagram chart={result.architecture} />
            </div>
          </div>
        )}

        {fileLines.length > 0 && (
          <div className="section">
            <div className="section-header">
              <span className="section-label">File Map</span>
            </div>
            <div className="section-body">
              <div className="file-list">
                {fileLines.map((line, i) => {
                  const [path, ...rest] = line.split("→");
                  return (
                    <div key={i} className="file-row">
                      <span className="file-path">{path?.trim()}</span>
                      {rest.length > 0 && (
                        <>
                          <span className="file-sep">→</span>
                          <span className="file-desc">{rest.join("→").trim()}</span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {result.onboarding && (
          <div className="section">
            <div className="section-header">
              <span className="section-label">Getting Started</span>
            </div>
            <div className="section-body">
              <p className="onboard-text">{result.onboarding}</p>
            </div>
          </div>
        )}

        <div className="footer-bar">
          <span className="footer-note">generated by repobrief · AI-powered repo analysis</span>
          <span className="views-badge">{analysis.viewCount + 1} views</span>
        </div>
      </div>
    </>
  );
}
