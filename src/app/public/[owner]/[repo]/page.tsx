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

  const langColor = repoData?.language ? (LANG_COLORS[repoData.language] ?? "#a8a7a0") : null;

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:        #faf9f6;
          --bg-alt:    #f2f1ec;
          --bg-card:   #ffffff;
          --text:      #0f0e0d;
          --muted:     #6d6c65;
          --dim:       #a8a7a0;
          --coral:     #d97757;
          --coral-dim: rgba(217,119,87,0.11);
          --border:    rgba(0,0,0,0.07);
          --serif:     var(--font-playfair), Georgia, serif;
          --sans:      var(--font-dm-sans), system-ui, sans-serif;
          --mono:      var(--font-dm-mono), ui-monospace, monospace;
        }

        body { background: var(--bg); color: var(--text); font-family: var(--sans); }

        .pub-root { min-height: 100vh; background: var(--bg); }

        /* Nav */
        .pub-nav {
          border-bottom: 1px solid var(--border);
          background: rgba(250,249,246,0.92);
          backdrop-filter: blur(14px);
          position: sticky; top: 0; z-index: 50;
        }
        .pub-nav-inner {
          max-width: 860px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 24px; height: 58px;
        }
        .pub-logo {
          font-family: var(--serif);
          font-size: 17px; font-weight: 700; letter-spacing: -0.02em;
          color: var(--text); text-decoration: none;
        }
        .pub-logo em { color: var(--coral); font-style: italic; }
        .pub-signin {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 13px; font-weight: 600;
          color: #fff; background: var(--text);
          text-decoration: none; padding: 8px 16px; border-radius: 8px;
          transition: opacity .15s;
        }
        .pub-signin:hover { opacity: 0.8; }

        /* Main */
        .pub-main {
          max-width: 860px; margin: 0 auto;
          padding: 36px 24px 80px;
        }

        /* Repo header card */
        .pub-header-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 14px; padding: 22px 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          margin-bottom: 16px;
        }
        .pub-breadcrumb {
          font-family: var(--mono); font-size: 11px; color: var(--dim);
          margin-bottom: 10px;
        }
        .pub-breadcrumb a { color: var(--dim); text-decoration: none; transition: color .15s; }
        .pub-breadcrumb a:hover { color: var(--text); }
        .pub-reponame {
          font-family: var(--serif);
          font-size: 1.7rem; font-weight: 700; letter-spacing: -0.03em;
          color: var(--text); margin-bottom: 7px; line-height: 1.1;
        }
        .pub-reponame span { color: var(--muted); font-weight: 400; }
        .pub-desc {
          font-size: 14px; color: var(--muted); font-weight: 300;
          line-height: 1.7; margin-bottom: 16px;
        }
        .pub-meta {
          display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
          border-top: 1px solid var(--border); padding-top: 14px;
        }
        .pub-meta-item {
          font-family: var(--mono); font-size: 11px; color: var(--muted);
          display: flex; align-items: center; gap: 5px;
        }
        .pub-lang-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .pub-lang-badge {
          font-family: var(--mono); font-size: 10px;
          border: 1px solid var(--border); color: var(--muted);
          background: var(--bg-alt); padding: 2px 8px; border-radius: 4px;
        }

        /* Anonymous notice */
        .pub-anon-notice {
          display: inline-flex; align-items: center; gap: 10px;
          font-family: var(--mono); font-size: 11px; color: var(--muted);
          border: 1px solid var(--border); border-radius: 8px;
          padding: 8px 14px; background: var(--bg-card);
          margin-bottom: 20px;
        }
        .pub-anon-sep { color: var(--dim); }
        .pub-anon-link {
          color: var(--coral); text-decoration: none; font-weight: 500;
          transition: opacity .15s;
        }
        .pub-anon-link:hover { opacity: 0.8; }
      `}</style>

      <div className="pub-root">
        <nav className="pub-nav">
          <div className="pub-nav-inner">
            <Link href="/" className="pub-logo">Repo<em>Brief</em></Link>
            <Link href="/auth" className="pub-signin">Sign in →</Link>
          </div>
        </nav>

        <main className="pub-main">
          <div className="pub-header-card">
            <p className="pub-breadcrumb">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">github.com</a>
              {" / "}{owner} / {repo}
            </p>
            <h1 className="pub-reponame">
              <span>{owner}/</span>{repo}
            </h1>
            {repoData?.description && (
              <p className="pub-desc">{repoData.description}</p>
            )}
            {repoData && (
              <div className="pub-meta">
                <span className="pub-meta-item">⭐ {repoData.stargazers_count}</span>
                {repoData.language && (
                  <span className="pub-meta-item">
                    {langColor && <span className="pub-lang-dot" style={{ background: langColor }} />}
                    <span className="pub-lang-badge">{repoData.language}</span>
                  </span>
                )}
                <span className="pub-meta-item">branch: {repoData.default_branch}</span>
              </div>
            )}
          </div>

          <div className="pub-anon-notice">
            <span>anonymous · 2 analyses/day</span>
            <span className="pub-anon-sep">·</span>
            <Link href="/auth" className="pub-anon-link">sign in for more →</Link>
          </div>

          <AnalyzeButton owner={owner} repo={repo} isAnonymous={true} />
        </main>
      </div>
    </>
  );
}
