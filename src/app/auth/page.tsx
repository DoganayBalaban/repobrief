import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";

const GH_ICON = (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current shrink-0" aria-hidden="true">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

export default async function AuthPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.7; }
        }
        .auth-card { animation: fadeIn .5s cubic-bezier(.16,1,.3,1) both; }
        .glow {
          position: absolute;
          width: 320px; height: 320px;
          background: radial-gradient(circle, rgba(163,230,53,0.12) 0%, transparent 70%);
          border-radius: 50%;
          animation: glow-pulse 4s ease-in-out infinite;
          pointer-events: none;
        }
        .dot-grid {
          background-image: radial-gradient(circle, rgba(163,230,53,0.06) 1px, transparent 1px);
          background-size: 28px 28px;
        }
        .noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
          background-size: 200px 200px;
        }
        .gh-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%;
          background: #a3e635; color: #09090b;
          font-family: ui-monospace, monospace; font-size: 13px; font-weight: 700;
          padding: 12px 24px; border-radius: 4px; border: none; cursor: pointer;
          transition: background .15s ease;
        }
        .gh-btn:hover { background: #bef264; }
      `}</style>

      <div className="relative min-h-screen bg-zinc-950 dot-grid noise flex items-center justify-center overflow-hidden">
        <div className="glow" style={{ top: '30%', left: '50%', transform: 'translate(-50%,-50%)' }} />

        <div className="auth-card relative z-10 w-full max-w-sm px-6">
          {/* Logo */}
          <div className="text-center mb-10">
            <a href="/" className="inline-block font-mono text-base tracking-widest uppercase text-zinc-100">
              repo<span className="text-lime-400">brief</span>
            </a>
          </div>

          {/* Card */}
          <div className="border border-zinc-800 bg-zinc-950/80 backdrop-blur rounded-sm p-8">
            <div className="mb-7 text-center">
              <h1 className="text-xl font-black tracking-tight mb-2">Sign in</h1>
              <p className="font-mono text-xs text-zinc-500 leading-relaxed">
                Connect GitHub to start analyzing<br />repositories with Claude.
              </p>
            </div>

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

            <div className="mt-6 pt-6 border-t border-zinc-800">
              <ul className="space-y-2">
                {[
                  "Read-only access to your repo list",
                  "5 free analyses per month",
                  "No credit card required",
                ].map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="text-lime-400 font-mono text-xs">✓</span>
                    <span className="font-mono text-xs text-zinc-500">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-center font-mono text-xs text-zinc-700 mt-6">
            RepoBrief © 2026
          </p>
        </div>
      </div>
    </>
  );
}
