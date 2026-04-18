import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

const GH_ICON = (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

export default async function AuthPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:      #faf9f6;
          --text:    #0f0e0d;
          --muted:   #6d6c65;
          --coral:   #d97757;
          --coral-dim: rgba(217,119,87,0.11);
          --border:  rgba(0,0,0,0.08);
          --serif:   var(--font-playfair), Georgia, serif;
          --sans:    var(--font-dm-sans), system-ui, sans-serif;
          --mono:    var(--font-dm-mono), ui-monospace, monospace;
        }

        body { background: var(--bg); font-family: var(--sans); }

        @keyframes rise {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blob-drift {
          0%,100% { transform: translate(-50%,-50%) scale(1); }
          50%      { transform: translate(-50%,-50%) scale(1.08) translateY(12px); }
        }

        .auth-root {
          min-height: 100vh;
          background: var(--bg);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          position: relative; overflow: hidden;
          padding: 2rem 1.5rem;
        }
        .auth-blob {
          position: absolute;
          width: 700px; height: 500px;
          top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          background: radial-gradient(ellipse at center,
            rgba(217,119,87,0.1) 0%,
            rgba(217,119,87,0.04) 45%,
            transparent 70%);
          animation: blob-drift 14s ease-in-out infinite;
          pointer-events: none;
        }
        .auth-wrap {
          position: relative; z-index: 1;
          width: 100%; max-width: 380px;
          animation: rise .55s cubic-bezier(.16,1,.3,1) both;
        }

        /* back link */
        .auth-back {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: var(--mono); font-size: 11px; color: var(--muted);
          text-decoration: none; margin-bottom: 32px;
          transition: color .15s;
        }
        .auth-back:hover { color: var(--text); }

        /* logo */
        .auth-logo {
          display: block; text-align: center;
          font-family: var(--serif); font-size: 20px; font-weight: 700;
          letter-spacing: -0.02em; color: var(--text);
          text-decoration: none; margin-bottom: 36px;
        }
        .auth-logo em { color: var(--coral); font-style: italic; }

        /* card */
        .auth-card {
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 36px 32px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04);
        }
        .auth-heading {
          font-family: var(--serif);
          font-size: 2rem; font-weight: 700;
          letter-spacing: -0.03em; line-height: 1.1;
          color: var(--text); margin-bottom: 8px;
          text-align: center;
        }
        .auth-sub {
          font-size: 13px; color: var(--muted); font-weight: 300;
          line-height: 1.7; text-align: center; margin-bottom: 28px;
        }

        /* github button */
        .gh-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%;
          background: var(--text); color: #fff;
          font-family: var(--sans); font-size: 14px; font-weight: 600;
          padding: 13px 24px; border-radius: 8px;
          border: none; cursor: pointer;
          transition: opacity .15s, transform .2s;
        }
        .gh-btn:hover { opacity: 0.82; transform: translateY(-1px); }

        /* divider */
        .auth-divider {
          border: none; border-top: 1px solid var(--border);
          margin: 24px 0;
        }

        /* feature list */
        .auth-features { display: flex; flex-direction: column; gap: 8px; }
        .auth-feature {
          display: flex; align-items: center; gap: 9px;
          font-size: 13px; color: var(--muted); font-weight: 300;
        }
        .auth-check {
          width: 16px; height: 16px; border-radius: 50%;
          background: var(--coral-dim);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; font-size: 9px; color: var(--coral);
        }

        /* footer */
        .auth-footer {
          font-family: var(--mono); font-size: 11px; color: #c0bfb8;
          text-align: center; margin-top: 24px;
        }
      `}</style>

      <div className="auth-root">
        <div className="auth-blob" aria-hidden="true" />

        <div className="auth-wrap">
          <Link href="/" className="auth-back">← back to home</Link>

          <Link href="/" className="auth-logo">Repo<em>Brief</em></Link>

          <div className="auth-card">
            <h1 className="auth-heading">Sign in</h1>
            <p className="auth-sub">
              Connect GitHub to analyze your repositories with Claude.
            </p>

            <form
              action={async () => {
                "use server";
                await signIn("github", { redirectTo: "/dashboard" });
              }}
            >
              <button type="submit" className="gh-btn">
                {GH_ICON}
                Continue with GitHub
              </button>
            </form>

            <hr className="auth-divider" />

            <div className="auth-features">
              {[
                "Read-only access to your repo list",
                "5 free analyses per month",
                "No credit card required",
              ].map(item => (
                <div key={item} className="auth-feature">
                  <span className="auth-check">✓</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <p className="auth-footer">RepoBrief © 2026</p>
        </div>
      </div>
    </>
  );
}
