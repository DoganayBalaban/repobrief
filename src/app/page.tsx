import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

const GH_ICON = (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current shrink-0" aria-hidden="true">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <>
      <style>{`
        :root { --lime: #a3e635; --lime-dim: rgba(163,230,53,0.08); }

        * { box-sizing: border-box; }

        .mono { font-family: var(--font-inter), ui-monospace, monospace; letter-spacing: -0.01em; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes scanline {
          from { transform: translateY(-100vh); }
          to   { transform: translateY(100vh); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.4; }
          100% { transform: scale(1.6); opacity: 0; }
        }

        .a1 { animation: fadeUp .6s cubic-bezier(.16,1,.3,1) .05s both; }
        .a2 { animation: fadeUp .6s cubic-bezier(.16,1,.3,1) .15s both; }
        .a3 { animation: fadeUp .6s cubic-bezier(.16,1,.3,1) .25s both; }
        .a4 { animation: fadeUp .6s cubic-bezier(.16,1,.3,1) .35s both; }
        .a5 { animation: fadeUp .6s cubic-bezier(.16,1,.3,1) .45s both; }
        .a6 { animation: fadeUp .6s cubic-bezier(.16,1,.3,1) .55s both; }

        .cursor::after {
          content: '▋';
          color: var(--lime);
          animation: blink 1s step-end infinite;
        }

        .dot-grid {
          background-image: radial-gradient(circle, rgba(163,230,53,0.07) 1px, transparent 1px);
          background-size: 28px 28px;
        }

        .scan::after {
          content: '';
          position: absolute;
          inset-inline: 0;
          height: 160px;
          background: linear-gradient(to bottom, transparent, rgba(163,230,53,0.012), transparent);
          animation: scanline 10s linear infinite;
          pointer-events: none;
        }

        .noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
          background-size: 200px 200px;
        }

        .feature-card {
          border: 1px solid rgba(255,255,255,0.06);
          transition: border-color .25s ease, background .25s ease;
        }
        .feature-card:hover {
          border-color: rgba(163,230,53,0.2);
          background: rgba(163,230,53,0.03);
        }

        .price-card {
          border: 1px solid rgba(255,255,255,0.07);
          transition: transform .2s ease, border-color .2s ease;
        }
        .price-card:hover { transform: translateY(-2px); }
        .price-card.pro {
          border-color: rgba(163,230,53,0.35);
          background: rgba(163,230,53,0.04);
        }

        .terminal-preview {
          background: #0d0d0d;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px;
          overflow: hidden;
        }
        .terminal-preview .bar {
          background: #1a1a1a;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 8px 12px;
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .dot-r { width:10px;height:10px;border-radius:50%;background:#ff5f57; }
        .dot-y { width:10px;height:10px;border-radius:50%;background:#febc2e; }
        .dot-g { width:10px;height:10px;border-radius:50%;background:#28c840; }
      `}</style>

      <div className="relative min-h-screen bg-zinc-950 dot-grid noise text-zinc-100 overflow-x-hidden">
        <div className="scan absolute inset-0 pointer-events-none overflow-hidden" />

        {/* ── NAV ── */}
        <nav className="relative z-20 flex items-center justify-between px-6 md:px-10 py-5 border-b border-zinc-800/50">
          <span className="mono text-sm tracking-widest uppercase">
            repo<span className="text-lime-400">brief</span>
          </span>
          <div className="flex items-center gap-6">
            <a href="#pricing" className="mono text-xs text-zinc-500 hover:text-zinc-300 transition-colors hidden md:block">Pricing</a>
            <a href="#how" className="mono text-xs text-zinc-500 hover:text-zinc-300 transition-colors hidden md:block">How it works</a>
            <Link href="/auth" className="mono text-xs text-zinc-400 hover:text-lime-400 transition-colors border border-zinc-700 hover:border-lime-400/40 px-4 py-2 rounded-sm">
              sign in →
            </Link>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="relative z-10 flex flex-col items-center justify-center px-6 text-center pt-24 pb-20 md:pt-32 md:pb-28">

          <div className="a1 mb-8">
            <span className="mono text-xs text-lime-400 tracking-widest uppercase border border-lime-400/20 bg-lime-400/5 px-4 py-1.5 rounded-full">
              ◆ AI-powered · GitHub native
            </span>
          </div>

          <h1 className="a2 text-5xl md:text-7xl lg:text-[90px] font-black tracking-tighter leading-[0.88] mb-7 max-w-5xl">
            Understand any<br />
            <span className="text-lime-400 cursor">repository</span>
          </h1>

          <p className="a3 mono text-sm md:text-base text-zinc-400 max-w-md mb-12 leading-relaxed">
            Connect GitHub. Pick a repo. Get architecture diagrams, tech stack, file maps, and onboarding guides — streamed live by Claude.
          </p>

          <div className="a4 flex flex-col sm:flex-row items-center gap-4 mb-8">
            <Link href="/auth" className="flex items-center gap-2.5 bg-lime-400 text-zinc-950 mono font-bold text-sm px-7 py-3.5 rounded-sm hover:bg-lime-300 transition-colors">
              {GH_ICON}
              Get started free
            </Link>
            <a href="#how" className="mono text-xs text-zinc-500 hover:text-zinc-300 transition-colors border border-zinc-800 px-6 py-3.5 rounded-sm hover:border-zinc-600">
              see how it works ↓
            </a>
          </div>

          <p className="a4 mono text-xs text-zinc-700">no credit card · 5 free analyses/month</p>

          {/* Terminal preview */}
          <div className="a5 w-full max-w-2xl mt-16">
            <div className="terminal-preview">
              <div className="bar">
                <div className="dot-r" /><div className="dot-y" /><div className="dot-g" />
                <span className="mono text-xs text-zinc-600 ml-2">repobrief — analysis</span>
              </div>
              <div className="p-5 text-left">
                <p className="mono text-xs text-zinc-600 mb-2">$ analyzing vercel/next.js ...</p>
                <p className="mono text-xs text-lime-400 mb-1">▶ description</p>
                <p className="mono text-xs text-zinc-400 mb-3 leading-relaxed">Next.js is a React framework for building full-stack web applications. It provides server-side rendering, static site generation, and file-based routing out of the box...</p>
                <p className="mono text-xs text-lime-400 mb-1">▶ tech_stack</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {["TypeScript", "React", "Node.js", "Rust", "SWC", "Turbopack"].map(t => (
                    <span key={t} className="mono text-xs border border-zinc-700 text-zinc-400 px-2 py-0.5 rounded-sm">{t}</span>
                  ))}
                </div>
                <p className="mono text-xs text-lime-400 mb-1">▶ architecture</p>
                <p className="mono text-xs text-zinc-600">graph TD<br />{"  "}A[Browser] --{">"} B[Next.js Server]<br />{"  "}B --{">"} C[React Server Components]<br />{"  "}B --{">"} D[API Routes]<span className="text-lime-400 animate-pulse">▋</span></p>
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how" className="relative z-10 px-6 py-24 border-t border-zinc-800/50">
          <div className="max-w-4xl mx-auto">
            <div className="a5 mb-16 text-center">
              <p className="mono text-xs text-lime-400 tracking-widest uppercase mb-3">// how it works</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter">Three steps to clarity</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-zinc-800 rounded-sm overflow-hidden">
              {[
                {
                  num: "01",
                  title: "Connect",
                  desc: "One-click GitHub OAuth. We request read-only access to your repo list. Your code never leaves GitHub.",
                  detail: "oauth scope: repo:read"
                },
                {
                  num: "02",
                  title: "Select",
                  desc: "Browse your repositories sorted by recent activity, or paste any public GitHub URL directly.",
                  detail: "public + private repos"
                },
                {
                  num: "03",
                  title: "Brief",
                  desc: "Claude reads your key files — README, entry points, configs, schema — and generates a structured brief in seconds.",
                  detail: "~15 key files analyzed"
                },
              ].map((f, i) => (
                <div key={f.num} className={`feature-card bg-zinc-950 p-8 ${i < 2 ? 'md:border-r border-zinc-800' : ''} ${i > 0 ? 'border-t md:border-t-0 border-zinc-800' : ''}`}>
                  <p className="mono text-xs text-zinc-700 mb-4">{f.num}</p>
                  <h3 className="font-black text-xl tracking-tight mb-3">{f.title}</h3>
                  <p className="mono text-xs text-zinc-500 leading-relaxed mb-4">{f.desc}</p>
                  <span className="mono text-xs text-lime-400/60 border border-lime-400/15 px-2 py-0.5 rounded-sm">{f.detail}</span>
                </div>
              ))}
            </div>

            {/* Output types */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Description", icon: "◎" },
                { label: "Architecture diagram", icon: "◈" },
                { label: "File map", icon: "◉" },
                { label: "Onboarding guide", icon: "◐" },
                { label: "Tech stack", icon: "◑" },
                { label: "Export to Markdown", icon: "◒" },
                { label: "Share link", icon: "◓" },
                { label: "Live streaming", icon: "◔" },
              ].map(o => (
                <div key={o.label} className="feature-card bg-zinc-950 px-4 py-3 rounded-sm flex items-center gap-2">
                  <span className="text-lime-400 text-sm">{o.icon}</span>
                  <span className="mono text-xs text-zinc-400">{o.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" className="relative z-10 px-6 py-24 border-t border-zinc-800/50">
          <div className="max-w-3xl mx-auto">
            <div className="mb-16 text-center">
              <p className="mono text-xs text-lime-400 tracking-widest uppercase mb-3">// pricing</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-4">Simple, transparent</h2>
              <p className="mono text-sm text-zinc-500">Start free. Upgrade when you need more.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Free */}
              <div className="price-card rounded-sm p-8 bg-zinc-950">
                <p className="mono text-xs text-zinc-600 uppercase tracking-widest mb-4">Free</p>
                <div className="mb-6">
                  <span className="text-4xl font-black">$0</span>
                  <span className="mono text-xs text-zinc-600 ml-2">/ month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    "5 analyses / month",
                    "Public repositories",
                    "7-day shareable link",
                    "Export as Markdown",
                    "Streaming output",
                  ].map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="text-lime-400 mono text-xs">✓</span>
                      <span className="mono text-xs text-zinc-400">{f}</span>
                    </li>
                  ))}
                  {[
                    "Private repositories",
                    "API access",
                  ].map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="text-zinc-700 mono text-xs">✗</span>
                      <span className="mono text-xs text-zinc-700">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth" className="block w-full text-center mono text-xs border border-zinc-700 hover:border-zinc-500 text-zinc-300 px-6 py-3 rounded-sm transition-colors">
                  Get started free
                </Link>
              </div>

              {/* Pro */}
              <div className="price-card pro rounded-sm p-8">
                <div className="flex items-center justify-between mb-4">
                  <p className="mono text-xs text-lime-400 uppercase tracking-widest">Pro</p>
                  <span className="mono text-xs text-lime-400/60 border border-lime-400/20 px-2 py-0.5 rounded-sm">coming soon</span>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-black">$9</span>
                  <span className="mono text-xs text-zinc-600 ml-2">/ month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    "Unlimited analyses",
                    "Public + private repos",
                    "Permanent shareable links",
                    "Export as Markdown",
                    "API access",
                    "Priority support",
                    "Early access to new features",
                  ].map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="text-lime-400 mono text-xs">✓</span>
                      <span className="mono text-xs text-zinc-300">{f}</span>
                    </li>
                  ))}
                </ul>
                <button disabled className="block w-full text-center mono text-xs bg-lime-400/20 text-lime-400/50 border border-lime-400/20 px-6 py-3 rounded-sm cursor-not-allowed">
                  Coming soon
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="relative z-10 border-t border-zinc-800/50 px-6 md:px-10 py-8">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="mono text-sm tracking-widest uppercase">
              repo<span className="text-lime-400">brief</span>
            </span>
            <div className="flex items-center gap-6">
              <a href="https://github.com/DoganayBalaban/repobrief" target="_blank" rel="noopener noreferrer" className="mono text-xs text-zinc-600 hover:text-zinc-400 transition-colors">GitHub</a>
              <a href="#pricing" className="mono text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Pricing</a>
            </div>
            <span className="mono text-xs text-zinc-800">built with claude + next.js</span>
          </div>
        </footer>
      </div>
    </>
  );
}
