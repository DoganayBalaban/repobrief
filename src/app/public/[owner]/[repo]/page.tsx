import { getPublicOctokit } from "@/lib/octokit";
import { AnalyzeButton } from "@/components/analyze-button";
import Link from "next/link";

interface Props {
  params: Promise<{ owner: string; repo: string }>;
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

export default async function PublicRepoPage({ params }: Props) {
  const { owner, repo } = await params;
  const octokit = getPublicOctokit();

  let repoData: {
    description: string | null;
    stargazers_count: number;
    language: string | null;
    default_branch: string;
    private: boolean;
  } | null = null;

  try {
    const { data } = await octokit.rest.repos.get({ owner, repo });
    repoData = {
      description: data.description,
      stargazers_count: data.stargazers_count,
      language: data.language ?? null,
      default_branch: data.default_branch,
      private: data.private,
    };
  } catch {
    // Private or not found — AnalyzeButton will surface the error
  }

  const langColor = repoData?.language ? (LANG_COLORS[repoData.language] ?? "#71717a") : null;

  return (
    <>
      <style>{`
        .pub-page {
          min-height: 100vh;
          background: #09090b;
          color: #e4e4e7;
        }
        .pub-nav {
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(9,9,11,0.95);
          backdrop-filter: blur(8px);
          position: sticky; top: 0; z-index: 50;
        }
        .pub-nav-inner {
          max-width: 860px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 24px; height: 52px;
        }
        .pub-logo {
          font-family: ui-monospace, monospace;
          font-size: 13px; letter-spacing: 0.1em;
          text-transform: uppercase; text-decoration: none;
          color: #f4f4f5;
        }
        .pub-logo span { color: #a3e635; }
        .pub-signin {
          font-family: ui-monospace, monospace; font-size: 11px;
          color: #52525b; text-decoration: none;
          border: 1px solid rgba(255,255,255,0.07);
          padding: 5px 12px; border-radius: 4px;
          transition: color .15s, border-color .15s;
        }
        .pub-signin:hover { color: #a3e635; border-color: rgba(163,230,53,0.3); }
        .pub-main {
          max-width: 860px; margin: 0 auto;
          padding: 40px 24px 80px;
        }
        .pub-repo-header {
          margin-bottom: 32px;
        }
        .pub-breadcrumb {
          font-family: ui-monospace, monospace; font-size: 12px;
          color: #52525b; margin-bottom: 8px;
        }
        .pub-breadcrumb a { color: #52525b; text-decoration: none; }
        .pub-breadcrumb a:hover { color: #a1a1aa; }
        .pub-reponame {
          font-size: 22px; font-weight: 700; letter-spacing: -0.03em;
          color: #f4f4f5; margin-bottom: 6px;
        }
        .pub-desc {
          font-family: ui-monospace, monospace; font-size: 12px;
          color: #71717a; margin-bottom: 12px; line-height: 1.5;
        }
        .pub-meta {
          display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
        }
        .pub-meta-item {
          font-family: ui-monospace, monospace; font-size: 11px; color: #52525b;
          display: flex; align-items: center; gap: 4px;
        }
        .pub-lang-dot {
          width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
        }
        .pub-anon-notice {
          font-family: ui-monospace, monospace; font-size: 11px; color: #3f3f46;
          margin-bottom: 20px;
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 4px;
          padding: 8px 12px;
          background: rgba(255,255,255,0.01);
          display: inline-flex; align-items: center; gap: 8px;
        }
        .pub-anon-notice a { color: #52525b; text-decoration: none; }
        .pub-anon-notice a:hover { color: #a3e635; }
      `}</style>

      <div className="pub-page">
        <nav className="pub-nav">
          <div className="pub-nav-inner">
            <Link href="/" className="pub-logo">
              repo<span>brief</span>
            </Link>
            <Link href="/auth" className="pub-signin">sign in →</Link>
          </div>
        </nav>

        <main className="pub-main">
          <div className="pub-repo-header">
            <p className="pub-breadcrumb">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">github.com</a>
              {" / "}
              {owner} / {repo}
            </p>
            <h1 className="pub-reponame">{owner}/{repo}</h1>
            {repoData?.description && (
              <p className="pub-desc">{repoData.description}</p>
            )}
            {repoData && (
              <div className="pub-meta">
                <span className="pub-meta-item">⭐ {repoData.stargazers_count}</span>
                {repoData.language && (
                  <span className="pub-meta-item">
                    {langColor && <span className="pub-lang-dot" style={{ background: langColor }} />}
                    {repoData.language}
                  </span>
                )}
                <span className="pub-meta-item">branch: {repoData.default_branch}</span>
              </div>
            )}
          </div>

          <div className="pub-anon-notice">
            <span>anonymous · 2 analyses/day</span>
            <span>·</span>
            <Link href="/auth">sign in for more →</Link>
          </div>

          <AnalyzeButton owner={owner} repo={repo} isAnonymous={true} />
        </main>
      </div>
    </>
  );
}
