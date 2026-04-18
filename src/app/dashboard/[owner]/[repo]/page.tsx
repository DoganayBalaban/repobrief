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
        .rp-layout {
          display: grid;
          grid-template-columns: 1fr 240px;
          gap: 20px; align-items: start;
        }
        @media (max-width: 800px) {
          .rp-layout { grid-template-columns: 1fr; }
          .rp-sidebar { order: -1; }
        }

        .rp-back {
          font-family: var(--mono); font-size: 11px; color: var(--muted);
          text-decoration: none;
          display: inline-flex; align-items: center; gap: 5px;
          margin-bottom: 18px; transition: color .15s;
        }
        .rp-back:hover { color: var(--text); }

        .rp-header-card {
          background: #fff; border: 1px solid var(--border);
          border-radius: 14px; padding: 22px 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          margin-bottom: 16px;
        }
        .rp-name {
          font-family: var(--serif);
          font-size: 1.7rem; font-weight: 700; letter-spacing: -0.03em;
          color: var(--text); margin-bottom: 7px; line-height: 1.1;
        }
        .rp-name span { color: var(--muted); font-weight: 400; }
        .rp-desc {
          font-size: 14px; color: var(--muted); font-weight: 300;
          line-height: 1.7; margin-bottom: 18px;
        }
        .rp-meta {
          display: flex; flex-wrap: wrap; gap: 14px;
          border-top: 1px solid var(--border); padding-top: 14px;
        }
        .rp-meta-item {
          font-family: var(--mono); font-size: 11px; color: var(--muted);
          display: flex; align-items: center; gap: 5px;
        }
        .rp-badge {
          font-family: var(--mono); font-size: 10px;
          border: 1px solid var(--border); color: var(--muted);
          background: var(--bg-alt);
          padding: 2px 8px; border-radius: 4px;
        }
        .rp-badge.private {
          color: var(--coral); border-color: rgba(217,119,87,0.25);
          background: var(--coral-dim);
        }

        /* Sidebar */
        .rp-sidebar {
          position: sticky; top: 74px;
          background: #fff; border: 1px solid var(--border);
          border-radius: 14px; overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .rp-sidebar-head {
          padding: 11px 16px;
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
          background: var(--bg-alt);
        }
        .rp-sidebar-title {
          font-family: var(--mono); font-size: 10px; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--muted);
        }
        .rp-sidebar-count {
          font-family: var(--mono); font-size: 10px; color: var(--dim);
        }
        .rp-file-list {
          max-height: calc(100vh - 220px);
          overflow-y: auto; padding: 6px 0;
        }
        .rp-file-list::-webkit-scrollbar { width: 3px; }
        .rp-file-list::-webkit-scrollbar-track { background: transparent; }
        .rp-file-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
        .rp-file-item {
          display: flex; align-items: center; gap: 4px;
          padding: 2px 14px;
          font-family: var(--mono); font-size: 11px; color: var(--dim);
          line-height: 1.9; white-space: nowrap; overflow: hidden;
          transition: color .1s;
        }
        .rp-file-item:hover { color: var(--text); }
        .rp-file-connector { opacity: 0.35; flex-shrink: 0; }
        .rp-file-name { overflow: hidden; text-overflow: ellipsis; }
      `}</style>

      <div className="rp-layout">
        <div>
          <Link href="/dashboard" className="rp-back">← Repositories</Link>

          <div className="rp-header-card">
            <h1 className="rp-name">
              <span>{owner}/</span>{repo}
            </h1>
            {repoData.description && (
              <p className="rp-desc">{repoData.description}</p>
            )}
            <div className="rp-meta">
              <span className="rp-meta-item">⭐ {repoData.stargazers_count}</span>
              {repoData.language && (
                <span className="rp-meta-item">
                  <span className="rp-badge">{repoData.language}</span>
                </span>
              )}
              <span className="rp-meta-item">branch: {repoData.default_branch}</span>
              <span className="rp-meta-item">
                {repoData.open_issues_count} open issue{repoData.open_issues_count !== 1 ? "s" : ""}
              </span>
              {repoData.private && (
                <span className="rp-meta-item">
                  <span className="rp-badge private">private</span>
                </span>
              )}
            </div>
          </div>

          <AnalyzeButton owner={owner} repo={repo} />
        </div>

        <aside className="rp-sidebar">
          <div className="rp-sidebar-head">
            <span className="rp-sidebar-title">File tree</span>
            <span className="rp-sidebar-count">{files.length} files</span>
          </div>
          <div className="rp-file-list">
            {files.map((f) => {
              const parts = f.path.split("/");
              const depth = parts.length - 1;
              const name = parts[parts.length - 1];
              return (
                <div
                  key={f.path}
                  className="rp-file-item"
                  style={{ paddingLeft: `${14 + depth * 10}px` }}
                  title={f.path}
                >
                  {depth > 0 && <span className="rp-file-connector">└</span>}
                  <span className="rp-file-name">{name}</span>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </>
  );
}
