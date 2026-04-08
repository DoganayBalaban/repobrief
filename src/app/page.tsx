import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes scanline {
          from { transform: translateY(-100%); }
          to   { transform: translateY(100vh); }
        }
        .anim-1 { animation: fadeUp .7s cubic-bezier(.16,1,.3,1) .05s both; }
        .anim-2 { animation: fadeUp .7s cubic-bezier(.16,1,.3,1) .2s  both; }
        .anim-3 { animation: fadeUp .7s cubic-bezier(.16,1,.3,1) .35s both; }
        .anim-4 { animation: fadeUp .7s cubic-bezier(.16,1,.3,1) .5s  both; }
        .anim-5 { animation: fadeUp .7s cubic-bezier(.16,1,.3,1) .65s both; }
        .cursor-blink::after {
          content: '▋';
          animation: blink 1s step-end infinite;
          color: #a3e635;
        }
        .dot-grid {
          background-image: radial-gradient(circle, rgba(163,230,53,0.06) 1px, transparent 1px);
          background-size: 32px 32px;
        }
        .scanline {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .scanline::after {
          content: '';
          position: absolute;
          left: 0; right: 0;
          height: 120px;
          background: linear-gradient(to bottom, transparent, rgba(163,230,53,0.015), transparent);
          animation: scanline 8s linear infinite;
        }
        .noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 256px 256px;
        }
        .card-hover {
          transition: border-color .2s ease, background .2s ease;
        }
        .card-hover:hover {
          border-color: rgba(163,230,53,0.25);
          background: rgba(163,230,53,0.03);
        }
      `}</style>

      <div className="relative min-h-screen bg-zinc-950 dot-grid noise text-zinc-100 flex flex-col overflow-hidden">
        <div className="scanline" />

        {/* Nav */}
        <nav className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-zinc-800/60">
          <span className="font-mono text-sm tracking-widest uppercase">
            repo<span className="text-lime-400">brief</span>
          </span>
          <Link
            href="/auth"
            className="font-mono text-xs text-zinc-400 hover:text-lime-400 transition-colors border border-zinc-700 hover:border-lime-400/40 px-4 py-2 rounded-sm"
          >
            sign in →
          </Link>
        </nav>

        {/* Hero */}
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center py-24">
          {/* Badge */}
          <div className="anim-1 mb-8">
            <span className="font-mono text-xs text-lime-400 tracking-widest uppercase border border-lime-400/20 bg-lime-400/5 px-4 py-1.5 rounded-full">
              ◆ AI-powered · GitHub native
            </span>
          </div>

          {/* Headline */}
          <h1 className="anim-2 text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-6 max-w-4xl">
            Understand any
            <br />
            <span className="text-lime-400 cursor-blink">repository</span>
          </h1>

          {/* Subheading */}
          <p className="anim-3 font-mono text-sm md:text-base text-zinc-400 max-w-sm mb-12 leading-relaxed">
            Connect GitHub. Pick a repo. Get a complete AI breakdown —
            architecture, stack, purpose — in seconds.
          </p>

          {/* CTA */}
          <div className="anim-4 flex flex-row items-center justify-center gap-4">
            <Link
              href="/auth"
              className="group flex items-center  gap-2.5 bg-lime-400 text-zinc-950 font-mono font-bold text-sm px-7 py-3.5 rounded-sm hover:bg-lime-300 transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 fill-current shrink-0"
                aria-hidden="true"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Get started free
            </Link>
            <span className="font-mono text-xs text-zinc-600">
              no credit card · free forever
            </span>
          </div>
        </main>

        {/* Feature strip */}
        <section className="relative z-10 px-6 pb-16 max-w-4xl mx-auto w-full anim-5">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-800 border border-zinc-800 rounded-sm overflow-hidden">
            {[
              {
                num: "01",
                title: "Connect",
                desc: "One-click GitHub OAuth. We only read repo metadata — your code stays yours.",
              },
              {
                num: "02",
                title: "Select",
                desc: "Browse your repos sorted by activity, or drop any public GitHub URL.",
              },
              {
                num: "03",
                title: "Brief",
                desc: "Get a structured summary: purpose, tech stack, architecture, and key entry points.",
              },
            ].map((f) => (
              <div
                key={f.num}
                className="card-hover bg-zinc-950 p-7 border border-transparent"
              >
                <p className="font-mono text-xs text-zinc-700 mb-3">{f.num}</p>
                <h3 className="font-black text-zinc-100 text-lg mb-2 tracking-tight">
                  {f.title}
                </h3>
                <p className="font-mono text-xs text-zinc-500 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 border-t border-zinc-800/60 px-8 py-5 flex items-center justify-between">
          <span className="font-mono text-xs text-zinc-700">
            RepoBrief © 2026
          </span>
          <span className="font-mono text-xs text-zinc-800">
            built with claude + next.js
          </span>
        </footer>
      </div>
    </>
  );
}
