import { getOctokit } from "@/lib/octokit";
import { fetchFileTree } from "@/lib/file-tree";
import { AnalyzeButton } from "@/components/analyze-button";
import Link from "next/link";

interface Props {
  params: Promise<{ owner: string; repo: string }>;
}

export default async function RepoPage({ params }: Props) {
  const { owner, repo } = await params;
  const octokit = await getOctokit();

  const [{ data: repoData }, files] = await Promise.all([
    octokit.rest.repos.get({ owner, repo }),
    fetchFileTree(octokit, owner, repo),
  ]);

  return (
    <>
      <style>{`
        .repo-page {
          display: grid;
          grid-template-columns: 1fr 260px;
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 768px) {
          .repo-page { grid-template-columns: 1fr; }
          .file-tree-panel { order: 2; }
        }
        .repo-header {
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 4px;
          padding: 20px 24px;
          background: rgba(255,255,255,0.015);
          margin-bottom: 20px;
        }
        .repo-back {
          font-family: ui-monospace, monospace; font-size: 11px;
          color: #52525b; text-decoration: none;
          display: inline-flex; align-items: center; gap: 6px;
          margin-bottom: 16px;
          transition: color .15s;
        }
        .repo-back:hover { color: #a1a1aa; }
        .repo-fullname {
          font-size: 20px; font-weight: 800; letter-spacing: -0.03em;
          color: #f4f4f5; margin-bottom: 6px;
        }
        .repo-desc {
          font-family: ui-monospace, monospace; font-size: 12px; color: #52525b;
          margin-bottom: 16px; line-height: 1.6;
        }
        .repo-meta {
          display: flex; flex-wrap: wrap; gap: 16px;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding-top: 14px;
        }
        .meta-item {
          font-family: ui-monospace, monospace; font-size: 11px; color: #52525b;
          display: flex; align-items: center; gap: 5px;
        }
        .meta-badge {
          font-family: ui-monospace, monospace; font-size: 10px;
          border: 1px solid rgba(255,255,255,0.08);
          color: #71717a; padding: 1px 7px; border-radius: 3px;
        }
        .file-tree-panel {
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 4px;
          background: rgba(255,255,255,0.015);
          overflow: hidden;
          position: sticky; top: 72px;
        }
        .file-tree-header {
          padding: 10px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex; align-items: center; justify-content: space-between;
        }
        .file-tree-title {
          font-family: ui-monospace, monospace; font-size: 11px; color: #52525b;
          text-transform: uppercase; letter-spacing: 0.08em;
        }
        .file-tree-count {
          font-family: ui-monospace, monospace; font-size: 10px; color: #3f3f46;
        }
        .file-tree-list {
          max-height: calc(100vh - 200px);
          overflow-y: auto;
          padding: 8px 0;
        }
        .file-tree-list::-webkit-scrollbar { width: 4px; }
        .file-tree-list::-webkit-scrollbar-track { background: transparent; }
        .file-tree-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
        .file-item {
          display: flex; align-items: center; gap: 4px;
          padding: 2px 14px;
          font-family: ui-monospace, monospace; font-size: 11px;
          color: #52525b;
          transition: color .1s;
          line-height: 1.8;
          white-space: nowrap; overflow: hidden;
        }
        .file-item:hover { color: #a1a1aa; }
        .file-connector { opacity: 0.3; flex-shrink: 0; }
        .file-name { truncate: true; overflow: hidden; text-overflow: ellipsis; }
      `}</style>

      <div className="repo-page">
        {/* Main column */}
        <div>
          {/* Header card */}
          <div className="repo-header">
            <Link href="/dashboard" className="repo-back">← repositories</Link>

            <h1 className="repo-fullname">{repoData.full_name}</h1>

            {repoData.description && (
              <p className="repo-desc">{repoData.description}</p>
            )}

            <div className="repo-meta">
              <span className="meta-item">⭐ {repoData.stargazers_count}</span>
              {repoData.language && (
                <span className="meta-item">
                  <span className="meta-badge">{repoData.language}</span>
                </span>
              )}
              <span className="meta-item">branch: {repoData.default_branch}</span>
              <span className="meta-item">
                {repoData.open_issues_count} open issue{repoData.open_issues_count !== 1 ? "s" : ""}
              </span>
              {repoData.private && <span className="meta-item"><span className="meta-badge">private</span></span>}
            </div>
          </div>

          {/* Analyze */}
          <AnalyzeButton owner={owner} repo={repo} />
        </div>

        {/* File tree sidebar */}
        <aside className="file-tree-panel">
          <div className="file-tree-header">
            <span className="file-tree-title">File tree</span>
            <span className="file-tree-count">{files.length} files</span>
          </div>
          <div className="file-tree-list">
            {files.map((f) => {
              const parts = f.path.split("/");
              const depth = parts.length - 1;
              const name = parts[parts.length - 1];
              return (
                <div
                  key={f.path}
                  className="file-item"
                  style={{ paddingLeft: `${14 + depth * 10}px` }}
                  title={f.path}
                >
                  {depth > 0 && <span className="file-connector">└</span>}
                  <span className="file-name">{name}</span>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </>
  );
}
