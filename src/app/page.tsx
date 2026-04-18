"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

type DiagramNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  accent?: boolean;
};
type DiagramVariant = {
  title: string;
  nodes: DiagramNode[];
  edges: [string, string][];
  status: string;
};

const DIAGRAM_VARIANTS: DiagramVariant[] = [
  {
    title: "nextjs-starter",
    nodes: [
      { id: "a", label: "app/", x: 250, y: 48, w: 110, h: 32, accent: true },
      { id: "b", label: "api/", x: 90, y: 140, w: 90, h: 32 },
      { id: "c", label: "components/", x: 220, y: 140, w: 140, h: 32 },
      { id: "d", label: "lib/", x: 400, y: 140, w: 80, h: 32 },
      { id: "e", label: "db.ts", x: 70, y: 240, w: 110, h: 32 },
      { id: "f", label: "Button.tsx", x: 210, y: 240, w: 110, h: 32 },
      { id: "g", label: "Card.tsx", x: 340, y: 240, w: 100, h: 32 },
      { id: "h", label: "auth.ts", x: 460, y: 240, w: 100, h: 32 },
      {
        id: "i",
        label: "PostgreSQL",
        x: 50,
        y: 340,
        w: 150,
        h: 32,
        accent: true,
      },
      {
        id: "j",
        label: "Stripe API",
        x: 420,
        y: 340,
        w: 130,
        h: 32,
        accent: true,
      },
    ],
    edges: [
      ["a", "b"],
      ["a", "c"],
      ["a", "d"],
      ["b", "e"],
      ["c", "f"],
      ["c", "g"],
      ["d", "h"],
      ["e", "i"],
      ["h", "j"],
    ],
    status: "Next.js 15 · TypeScript · Prisma · 47 files",
  },
  {
    title: "fastapi-service",
    nodes: [
      { id: "a", label: "main.py", x: 220, y: 48, w: 120, h: 32, accent: true },
      { id: "b", label: "routers/", x: 80, y: 140, w: 110, h: 32 },
      { id: "c", label: "models/", x: 230, y: 140, w: 110, h: 32 },
      { id: "d", label: "services/", x: 380, y: 140, w: 110, h: 32 },
      { id: "e", label: "users.py", x: 30, y: 240, w: 110, h: 32 },
      { id: "f", label: "orders.py", x: 160, y: 240, w: 110, h: 32 },
      { id: "g", label: "user.py", x: 295, y: 240, w: 100, h: 32 },
      { id: "h", label: "email.py", x: 420, y: 240, w: 110, h: 32 },
      {
        id: "i",
        label: "PostgreSQL",
        x: 120,
        y: 340,
        w: 140,
        h: 32,
        accent: true,
      },
      { id: "j", label: "Redis", x: 300, y: 340, w: 90, h: 32, accent: true },
      {
        id: "k",
        label: "SendGrid",
        x: 420,
        y: 340,
        w: 110,
        h: 32,
        accent: true,
      },
    ],
    edges: [
      ["a", "b"],
      ["a", "c"],
      ["a", "d"],
      ["b", "e"],
      ["b", "f"],
      ["c", "g"],
      ["d", "h"],
      ["g", "i"],
      ["f", "j"],
      ["h", "k"],
    ],
    status: "FastAPI · Python 3.11 · SQLAlchemy · 38 files",
  },
  {
    title: "react-go-monorepo",
    nodes: [
      {
        id: "a",
        label: "monorepo",
        x: 220,
        y: 48,
        w: 120,
        h: 32,
        accent: true,
      },
      { id: "b", label: "apps/web", x: 100, y: 140, w: 110, h: 32 },
      { id: "c", label: "apps/api", x: 240, y: 140, w: 110, h: 32 },
      { id: "d", label: "packages/", x: 380, y: 140, w: 110, h: 32 },
      { id: "e", label: "React", x: 60, y: 240, w: 80, h: 32 },
      { id: "f", label: "Vite", x: 150, y: 240, w: 80, h: 32 },
      { id: "g", label: "Go/Gin", x: 260, y: 240, w: 100, h: 32 },
      { id: "h", label: "ui", x: 380, y: 240, w: 60, h: 32 },
      { id: "i", label: "db", x: 450, y: 240, w: 60, h: 32 },
      {
        id: "j",
        label: "Postgres",
        x: 230,
        y: 340,
        w: 110,
        h: 32,
        accent: true,
      },
    ],
    edges: [
      ["a", "b"],
      ["a", "c"],
      ["a", "d"],
      ["b", "e"],
      ["b", "f"],
      ["c", "g"],
      ["d", "h"],
      ["d", "i"],
      ["g", "j"],
      ["i", "j"],
    ],
    status: "Turborepo · Go 1.22 · React 19 · 62 files",
  },
];

function AnimatedDiagram({
  variant = 0,
  live = true,
}: {
  variant?: number;
  live?: boolean;
}) {
  const [step, setStep] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const data = DIAGRAM_VARIANTS[variant % DIAGRAM_VARIANTS.length];

  useEffect(() => {
    setStep(0);
    const total = data.nodes.length + data.edges.length;
    let i = 0;
    const tick = () => {
      i++;
      setStep(i);
      if (i < total + 6) timer.current = setTimeout(tick, 110);
    };
    timer.current = setTimeout(tick, 200);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [variant, data.nodes.length, data.edges.length]);

  const edgePath = (aId: string, bId: string) => {
    const na = data.nodes.find((n) => n.id === aId)!;
    const nb = data.nodes.find((n) => n.id === bId)!;
    const x1 = na.x + na.w / 2;
    const y1 = na.y + na.h;
    const x2 = nb.x + nb.w / 2;
    const y2 = nb.y;
    const midY = (y1 + y2) / 2;
    return `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
  };

  const total = data.nodes.length + data.edges.length;
  const shown = Math.min(step, total);

  return (
    <div className="diagram-card">
      <div className="diagram-chrome">
        <div className="diagram-chrome-dots">
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
        </div>
        <div>~/{data.title} · architecture.mmd</div>
        <div>
          {String(shown).padStart(2, "0")}/{String(total).padStart(2, "0")}
        </div>
      </div>
      <div className="diagram-body">
        <svg
          viewBox="0 0 600 400"
          className="mermaid-svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <pattern
              id={`dots-${variant}`}
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="1"
                cy="1"
                r="0.6"
                fill="currentColor"
                opacity="0.12"
              />
            </pattern>
          </defs>
          <rect width="600" height="400" fill={`url(#dots-${variant})`} />

          {data.edges.map(([a, b], i) => {
            const visible = step > data.nodes.length + i;
            return (
              <path
                key={`e-${i}`}
                d={edgePath(a, b)}
                className="edge-line"
                style={{
                  strokeDasharray: 400,
                  strokeDashoffset: visible ? 0 : 400,
                  transition: "stroke-dashoffset 450ms ease",
                }}
              />
            );
          })}

          {data.nodes.map((n, i) => {
            const visible = step > i;
            return (
              <g
                key={n.id}
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(-4px)",
                  transition: "opacity 300ms ease, transform 300ms ease",
                }}
              >
                <rect
                  x={n.x}
                  y={n.y}
                  width={n.w}
                  height={n.h}
                  className={`node-box ${n.accent ? "accent" : ""}`}
                />
                <text
                  x={n.x + n.w / 2}
                  y={n.y + n.h / 2 + 4}
                  textAnchor="middle"
                  className="node-text"
                >
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="diagram-status">
        <div>
          {live ? (
            <>
              <span className="blink-dot" />
              analyzing
            </>
          ) : (
            "ready"
          )}
        </div>
        <div>{data.status}</div>
      </div>
    </div>
  );
}

function parseGitHubInput(
  input: string,
): { owner: string; repo: string } | null {
  const t = input.trim().replace(/\/$/, "");
  const url = t.match(/github\.com\/([^/]+)\/([^/\s?#]+)/);
  if (url) return { owner: url[1], repo: url[2] };
  const short = t.match(/^([^/\s]+)\/([^/\s]+)$/);
  if (short) return { owner: short[1], repo: short[2] };
  return null;
}

type DemoRepo = {
  name: string;
  lang: string;
  stars: string;
  stack: Record<string, { n: string; v: string }[]>;
  metrics: [string, string][];
  summary: ReactNode;
};

const DEMO_REPOS: DemoRepo[] = [
  {
    name: "vercel/next.js",
    lang: "TypeScript",
    stars: "124k",
    stack: {
      FRAMEWORK: [
        { n: "Next.js", v: "15.2.0" },
        { n: "React", v: "19.0.1" },
      ],
      LANGUAGE: [
        { n: "TypeScript", v: "5.4.5" },
        { n: "Node.js", v: "20.x" },
      ],
      TOOLING: [
        { n: "Turbopack", v: "2.0" },
        { n: "SWC", v: "1.7" },
        { n: "pnpm", v: "9.x" },
      ],
      TESTING: [
        { n: "Jest", v: "29.7" },
        { n: "Playwright", v: "1.45" },
      ],
    },
    metrics: [
      ["Files analyzed", "4,218"],
      ["Primary language", "TypeScript (87%)"],
      ["First commit", "Oct 2016"],
      ["Contributors", "3,400+"],
    ],
    summary: (
      <span>
        <strong>Next.js</strong> is the React framework for production. The repo
        is a monorepo with the core framework under <code>packages/next/</code>,
        containing the router, bundler integration, and server runtime. It
        exposes hooks into <strong>Turbopack</strong> for development and ships
        with hybrid rendering: SSG, SSR, and RSC on the same tree. Start reading
        at <code>packages/next/src/server/</code>.
      </span>
    ),
  },
  {
    name: "tiangolo/fastapi",
    lang: "Python",
    stars: "79k",
    stack: {
      FRAMEWORK: [
        { n: "FastAPI", v: "0.115" },
        { n: "Starlette", v: "0.38" },
      ],
      LANGUAGE: [
        { n: "Python", v: "3.11+" },
        { n: "Pydantic", v: "2.8" },
      ],
      TOOLING: [
        { n: "uvicorn", v: "0.30" },
        { n: "uv", v: "0.4" },
        { n: "Ruff", v: "0.6" },
      ],
      TESTING: [
        { n: "pytest", v: "8.3" },
        { n: "httpx", v: "0.27" },
      ],
    },
    metrics: [
      ["Files analyzed", "1,284"],
      ["Primary language", "Python (94%)"],
      ["First commit", "Dec 2018"],
      ["Contributors", "680+"],
    ],
    summary: (
      <span>
        <strong>FastAPI</strong> is a modern Python web framework built on{" "}
        <strong>Starlette</strong> and <strong>Pydantic</strong>. The core is in{" "}
        <code>fastapi/</code>, with routing, dependency injection, and OpenAPI
        generation. Request handling lives in <code>routing.py</code>; Pydantic
        v2 drives serialization and validation. Excellent test coverage — start
        with <code>tests/</code> to understand behavior.
      </span>
    ),
  },
  {
    name: "supabase/supabase",
    lang: "TypeScript",
    stars: "72k",
    stack: {
      FRAMEWORK: [
        { n: "Next.js", v: "14.2" },
        { n: "Expo", v: "51" },
      ],
      LANGUAGE: [
        { n: "TypeScript", v: "5.4" },
        { n: "SQL", v: "—" },
      ],
      DATABASE: [
        { n: "PostgreSQL", v: "15" },
        { n: "PostgREST", v: "12" },
      ],
      TOOLING: [
        { n: "Turborepo", v: "2.0" },
        { n: "pnpm", v: "9.x" },
      ],
    },
    metrics: [
      ["Files analyzed", "8,842"],
      ["Primary language", "TypeScript (76%)"],
      ["First commit", "Jul 2020"],
      ["Contributors", "2,100+"],
    ],
    summary: (
      <span>
        <strong>Supabase</strong> is a Turborepo monorepo that ships the Studio
        dashboard (<code>apps/studio</code>), auth, storage, and docs as
        independent Next.js apps. The database layer sits on{" "}
        <strong>PostgreSQL</strong> + <strong>PostgREST</strong>. Good entry
        point: <code>apps/studio/components/</code> for the UI, or{" "}
        <code>apps/www/pages/</code> for the marketing stack.
      </span>
    ),
  },
];

const FAQ_ITEMS = [
  {
    q: "Do you store my source code?",
    a: "No. We analyze in-memory and persist only the generated artifacts — the diagram, the tech stack, and the brief. Your source is fetched via the GitHub API at analysis time and never written to disk.",
  },
  {
    q: "How does the GitHub OAuth scope work?",
    a: "We request read-only repo access. You can revoke it from GitHub's settings at any time. For public repos, no OAuth is needed — just paste the URL.",
  },
  {
    q: "Which languages and frameworks are supported?",
    a: "JavaScript, TypeScript, Python, Go, Rust, Ruby, Java, Kotlin, Swift, PHP, Elixir, C#, and C++ — plus their major frameworks. If your repo has a manifest file, we probably understand it.",
  },
  {
    q: "Can I self-host this?",
    a: "Yes, on the Team plan. We ship a Docker image and Kubernetes Helm chart. You bring your own LLM key (Claude or a compatible model) and we run entirely in your network.",
  },
  {
    q: "How accurate is the AI brief?",
    a: "The brief is guided by deterministic analysis — we parse manifests, imports, and config files first, then pass findings to the model to phrase. It won't hallucinate a database you're not using.",
  },
  {
    q: "Is there an API?",
    a: "Yes. The Pro plan includes 5,000 API calls / month. The Team plan is uncapped.",
  },
];

export default function Page() {
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [input, setInput] = useState("vercel/next.js");
  const [variant, setVariant] = useState(0);
  const [demoIdx, setDemoIdx] = useState(0);
  const [faqOpen, setFaqOpen] = useState<number>(0);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const heroExamples: { label: string; v: number }[] = [
    { label: "vercel/next.js", v: 0 },
    { label: "tiangolo/fastapi", v: 1 },
    { label: "supabase/supabase", v: 2 },
  ];

  useEffect(() => {
    if (typeof window === "undefined" || !rootRef.current) return;
    const els = rootRef.current.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("in");
        });
      },
      { threshold: 0.1 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  function submitRepo(raw: string) {
    const parsed = parseGitHubInput(raw);
    if (!parsed) return;
    router.push(`/public/${parsed.owner}/${parsed.repo}`);
  }

  const demo = DEMO_REPOS[demoIdx];

  return (
    <div ref={rootRef} data-theme={theme} className="rb-root">
      <style>{`
        .rb-root {
          --bg: #F7F5EF;
          --bg-soft: #EEEBE2;
          --bg-elevated: #FFFFFF;
          --ink: #14140F;
          --ink-soft: #44443D;
          --ink-muted: #7A7A72;
          --line: #1A1A15;
          --line-soft: rgba(20,20,15,0.12);
          --line-hairline: rgba(20,20,15,0.08);
          --accent: oklch(68% 0.18 75);
          --accent-ink: #1A1A15;
          --accent-soft: oklch(92% 0.06 75);
          --ok: oklch(58% 0.12 155);
          --grid: rgba(20,20,15,0.05);
          background: var(--bg);
          color: var(--ink);
          font-family: var(--font-jetbrains), ui-monospace, Menlo, monospace;
          font-size: 15px;
          line-height: 1.55;
          -webkit-font-smoothing: antialiased;
          min-height: 100vh;
          transition: background 240ms ease, color 240ms ease;
        }
        .rb-root[data-theme="dark"] {
          --bg: #0E0E0B;
          --bg-soft: #1A1A15;
          --bg-elevated: #121210;
          --ink: #F2EFE5;
          --ink-soft: #BEBBB0;
          --ink-muted: #807D73;
          --line: #F2EFE5;
          --line-soft: rgba(242,239,229,0.14);
          --line-hairline: rgba(242,239,229,0.08);
          --accent: oklch(78% 0.17 75);
          --accent-ink: #0E0E0B;
          --accent-soft: oklch(30% 0.08 75);
          --grid: rgba(242,239,229,0.05);
        }
        .rb-root *, .rb-root *::before, .rb-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .rb-root a { color: inherit; text-decoration: none; }
        .rb-root button { font: inherit; color: inherit; background: none; border: none; cursor: pointer; }
        .rb-root code { font-family: inherit; font-size: 0.94em; color: var(--ink); background: var(--bg-soft); padding: 1px 4px; }

        .serif { font-family: var(--font-instrument), 'Times New Roman', serif; font-weight: 400; letter-spacing: -0.01em; }

        /* nav */
        .rb-nav { position: sticky; top: 0; z-index: 50; background: color-mix(in srgb, var(--bg) 90%, transparent); backdrop-filter: blur(12px); border-bottom: 1px solid var(--line); }
        .rb-nav-inner { display: flex; align-items: center; justify-content: space-between; padding: 16px 40px; max-width: 1320px; margin: 0 auto; gap: 24px; }
        .rb-logo { display: flex; align-items: center; gap: 10px; font-weight: 500; font-size: 15px; letter-spacing: -0.01em; }
        .rb-logo-mark { width: 22px; height: 22px; background: var(--ink); color: var(--bg); display: grid; place-items: center; font-size: 12px; font-weight: 600; }
        .rb-root[data-theme="dark"] .rb-logo-mark { background: var(--accent); color: var(--accent-ink); }
        .rb-nav-links { display: flex; gap: 28px; font-size: 13px; color: var(--ink-soft); }
        .rb-nav-links a { transition: color 150ms; }
        .rb-nav-links a:hover { color: var(--ink); }
        .rb-nav-cta { display: flex; align-items: center; gap: 10px; }

        .btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; font-size: 13px; border: 1px solid var(--line); background: transparent; color: var(--ink); transition: all 150ms; cursor: pointer; letter-spacing: 0.01em; }
        .btn:hover { background: var(--ink); color: var(--bg); }
        .btn-primary { background: var(--ink); color: var(--bg); }
        .btn-primary:hover { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
        .btn-accent { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
        .btn-accent:hover { background: var(--ink); color: var(--bg); border-color: var(--ink); }
        .btn-ghost { border-color: var(--line-soft); color: var(--ink-soft); padding: 8px 10px; }
        .btn-ghost:hover { color: var(--ink); border-color: var(--line); background: transparent; }

        .eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--ink-muted); }
        .eyebrow-dot { width: 6px; height: 6px; background: var(--accent); border-radius: 50%; }

        .section-label { display: flex; align-items: center; justify-content: space-between; padding: 14px 40px; font-size: 11px; color: var(--ink-muted); letter-spacing: 0.12em; text-transform: uppercase; border-bottom: 1px solid var(--line-soft); }
        .section-label-right { display: flex; gap: 16px; }

        /* hero */
        .rb-hero { position: relative; padding: 72px 40px 80px; border-bottom: 1px solid var(--line); overflow: hidden; }
        .rb-hero-grid { position: absolute; inset: 0; background-image: linear-gradient(var(--grid) 1px, transparent 1px), linear-gradient(90deg, var(--grid) 1px, transparent 1px); background-size: 56px 56px; pointer-events: none; -webkit-mask-image: radial-gradient(circle at 30% 50%, black 0%, transparent 75%); mask-image: radial-gradient(circle at 30% 50%, black 0%, transparent 75%); }
        .rb-hero-inner { position: relative; max-width: 1320px; margin: 0 auto; display: grid; grid-template-columns: 1.05fr 1fr; gap: 56px; align-items: center; }
        .rb-hero-title { font-size: clamp(44px, 6vw, 84px); line-height: 0.96; letter-spacing: -0.025em; margin-top: 24px; color: var(--ink); }
        .rb-hero-title .slash { color: var(--accent); font-style: italic; }
        .rb-hero-sub { margin-top: 28px; max-width: 540px; font-size: 15px; line-height: 1.65; color: var(--ink-soft); }
        .rb-hero-input-wrap { margin-top: 36px; max-width: 540px; }
        .rb-hero-input-row { display: flex; border: 1px solid var(--line); background: var(--bg-elevated); transition: border-color 150ms; }
        .rb-hero-input-row:focus-within { border-color: var(--accent); }
        .rb-hero-input-prefix { padding: 0 12px; display: grid; place-items: center; font-size: 13px; color: var(--ink-muted); border-right: 1px solid var(--line-soft); }
        .rb-hero-input { flex: 1; padding: 14px; background: transparent; border: 0; outline: 0; font: inherit; color: var(--ink); font-size: 13px; }
        .rb-hero-input::placeholder { color: var(--ink-muted); }
        .rb-hero-analyze { padding: 0 20px; background: var(--ink); color: var(--bg); font-size: 13px; display: flex; align-items: center; gap: 8px; transition: background 150ms; }
        .rb-hero-analyze:hover { background: var(--accent); color: var(--accent-ink); }
        .rb-hero-examples { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px; font-size: 12px; }
        .rb-hero-example-label { color: var(--ink-muted); padding: 4px 0; }
        .rb-hero-example-pill { padding: 4px 10px; border: 1px solid var(--line-soft); color: var(--ink-soft); transition: all 150ms; cursor: pointer; }
        .rb-hero-example-pill:hover { border-color: var(--line); color: var(--ink); background: var(--bg-soft); }

        /* diagram */
        .diagram-card { position: relative; border: 1px solid var(--line); background: var(--bg-elevated); aspect-ratio: 1 / 1; max-height: 560px; display: flex; flex-direction: column; }
        .diagram-chrome { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-bottom: 1px solid var(--line-soft); font-size: 11px; color: var(--ink-muted); letter-spacing: 0.06em; }
        .diagram-chrome-dots { display: flex; gap: 6px; }
        .dot { width: 9px; height: 9px; border: 1px solid var(--line-soft); }
        .diagram-body { flex: 1; position: relative; overflow: hidden; color: var(--ink); }
        .mermaid-svg { width: 100%; height: 100%; display: block; }
        .node-box { fill: var(--bg-elevated); stroke: var(--ink); stroke-width: 1; }
        .node-box.accent { fill: var(--accent-soft); stroke: var(--accent); }
        .node-text { font-family: var(--font-jetbrains), monospace; font-size: 11px; fill: var(--ink); }
        .edge-line { stroke: var(--ink); stroke-width: 1; fill: none; }
        .diagram-status { position: absolute; bottom: 0; left: 0; right: 0; padding: 10px 14px; border-top: 1px solid var(--line-soft); font-size: 11px; color: var(--ink-muted); display: flex; justify-content: space-between; background: var(--bg-elevated); }
        .blink-dot { width: 6px; height: 6px; background: var(--accent); border-radius: 50%; display: inline-block; margin-right: 6px; animation: rb-blink 1.2s infinite; }
        @keyframes rb-blink { 0%, 70% { opacity: 1; } 85%, 100% { opacity: 0.3; } }

        /* marquee */
        .rb-marquee { display: flex; padding: 18px 0; overflow: hidden; font-size: 12px; color: var(--ink-muted); white-space: nowrap; border-bottom: 1px solid var(--line); letter-spacing: 0.06em; text-transform: uppercase; }
        .rb-marquee-track { display: flex; gap: 48px; animation: rb-scroll 40s linear infinite; padding-right: 48px; }
        .rb-marquee-track span { display: inline-flex; align-items: center; gap: 10px; }
        .rb-marquee-track span::before { content: "▸"; color: var(--accent); }
        @keyframes rb-scroll { to { transform: translateX(-50%); } }

        /* how it works */
        .rb-howto { border-bottom: 1px solid var(--line); }
        .rb-howto-head { padding: 72px 40px 40px; max-width: 1320px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1.3fr; gap: 40px; align-items: end; }
        .section-title { font-size: clamp(36px, 4vw, 56px); line-height: 1; letter-spacing: -0.02em; }
        .section-title .accent { color: var(--accent); font-style: italic; }
        .rb-howto-grid { max-width: 1320px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1px solid var(--line); }
        .rb-step { padding: 32px 28px 40px; border-right: 1px solid var(--line-soft); position: relative; min-height: 280px; display: flex; flex-direction: column; color: var(--ink); }
        .rb-step:last-child { border-right: 0; }
        .rb-step-num { font-size: 11px; color: var(--ink-muted); letter-spacing: 0.12em; }
        .rb-step-title { font-size: 20px; margin-top: 40px; line-height: 1.2; letter-spacing: -0.01em; }
        .rb-step-desc { margin-top: 12px; font-size: 13px; color: var(--ink-soft); line-height: 1.6; }
        .rb-step-visual { margin-top: auto; padding-top: 20px; height: 72px; display: flex; align-items: flex-end; }

        /* features */
        .rb-features { border-bottom: 1px solid var(--line); }
        .rb-features-head { padding: 72px 40px 40px; max-width: 1320px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1.3fr; gap: 40px; align-items: end; }
        .rb-features-grid { max-width: 1320px; margin: 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1px solid var(--line); }
        .rb-feature { padding: 32px 28px 36px; border-right: 1px solid var(--line-soft); border-bottom: 1px solid var(--line-soft); color: var(--ink); }
        .rb-feature:nth-child(3n) { border-right: 0; }
        .rb-feature:nth-last-child(-n+3) { border-bottom: 0; }
        .rb-feature-label { font-size: 11px; color: var(--ink-muted); letter-spacing: 0.12em; }
        .rb-feature-title { font-size: 22px; margin-top: 12px; letter-spacing: -0.01em; }
        .rb-feature-desc { margin-top: 12px; font-size: 13px; color: var(--ink-soft); line-height: 1.6; }
        .rb-feature-glyph { margin-top: 24px; height: 100px; border: 1px solid var(--line-soft); background: var(--bg-soft); display: grid; place-items: center; overflow: hidden; position: relative; color: var(--ink); }

        /* live demo */
        .rb-demo { border-bottom: 1px solid var(--line); }
        .rb-demo-head { padding: 72px 40px 40px; max-width: 1320px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1.3fr; gap: 40px; align-items: end; }
        .rb-demo-wrap { max-width: 1320px; margin: 0 auto; padding: 0 40px 72px; }
        .rb-demo-tabs { display: flex; border: 1px solid var(--line); border-bottom: 0; background: var(--bg-elevated); }
        .rb-demo-tab { padding: 14px 18px; font-size: 12px; color: var(--ink-muted); border-right: 1px solid var(--line-soft); cursor: pointer; transition: all 150ms; display: flex; flex-direction: column; gap: 4px; min-width: 160px; text-align: left; }
        .rb-demo-tab:last-child { border-right: 0; }
        .rb-demo-tab-repo { color: var(--ink); font-size: 13px; }
        .rb-demo-tab-lang { font-size: 11px; letter-spacing: 0.08em; }
        .rb-demo-tab.active { background: var(--bg); color: var(--ink); border-bottom: 1px solid var(--bg); margin-bottom: -1px; }
        .rb-demo-tab:hover:not(.active) { background: var(--bg-soft); }
        .rb-demo-panel { border: 1px solid var(--line); background: var(--bg-elevated); display: grid; grid-template-columns: 280px 1fr 280px; min-height: 520px; }
        .rb-demo-col { padding: 24px; border-right: 1px solid var(--line-soft); overflow: hidden; color: var(--ink); }
        .rb-demo-col:last-child { border-right: 0; }
        .rb-demo-col-title { font-size: 11px; color: var(--ink-muted); letter-spacing: 0.12em; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; }
        .stack-item { display: flex; justify-content: space-between; align-items: center; padding: 9px 0; border-bottom: 1px dashed var(--line-hairline); font-size: 12px; }
        .stack-item-name { color: var(--ink); }
        .stack-item-v { color: var(--ink-muted); }
        .stack-group + .stack-group { margin-top: 22px; }
        .stack-group-label { font-size: 10px; color: var(--ink-muted); letter-spacing: 0.14em; margin-bottom: 4px; }
        .ai-summary { font-size: 13px; line-height: 1.7; color: var(--ink-soft); }
        .ai-summary strong { color: var(--ink); font-weight: 500; }
        .ai-metric { display: flex; justify-content: space-between; padding: 8px 0; font-size: 12px; border-bottom: 1px dashed var(--line-hairline); }
        .ai-metric-v { color: var(--ink); font-feature-settings: "tnum"; }

        /* preview */
        .rb-preview { border-bottom: 1px solid var(--line); }
        .rb-preview-head { padding: 72px 40px 40px; max-width: 1320px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1.3fr; gap: 40px; align-items: end; }
        .rb-preview-grid { max-width: 1320px; margin: 0 auto; padding: 0 40px 72px; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .code-card { border: 1px solid var(--line); background: var(--bg-elevated); overflow: hidden; display: flex; flex-direction: column; }
        .code-card-head { padding: 10px 14px; border-bottom: 1px solid var(--line-soft); font-size: 11px; color: var(--ink-muted); letter-spacing: 0.08em; display: flex; justify-content: space-between; }
        .code-card-body { padding: 20px; font-size: 12.5px; line-height: 1.7; overflow: auto; min-height: 360px; color: var(--ink); }
        .code-card-body pre { margin: 0; white-space: pre-wrap; word-break: break-word; font-family: var(--font-jetbrains), monospace; }
        .c-k { color: var(--accent); }
        .c-s { color: var(--ok); }
        .c-c { color: var(--ink-muted); font-style: italic; }

        /* pricing */
        .rb-pricing { border-bottom: 1px solid var(--line); }
        .rb-pricing-head { padding: 72px 40px 40px; max-width: 1320px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1.3fr; gap: 40px; align-items: end; }
        .rb-pricing-grid { max-width: 1320px; margin: 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1px solid var(--line); }
        .rb-price-card { padding: 32px 28px 36px; border-right: 1px solid var(--line-soft); display: flex; flex-direction: column; min-height: 460px; color: var(--ink); }
        .rb-price-card:last-child { border-right: 0; }
        .rb-price-card.featured { background: var(--bg-soft); }
        .price-tier { font-size: 12px; letter-spacing: 0.12em; color: var(--ink-muted); }
        .price-value { font-size: 48px; line-height: 1; margin-top: 20px; letter-spacing: -0.02em; }
        .price-value sup { font-size: 18px; color: var(--ink-muted); vertical-align: top; margin-right: 2px; }
        .price-value small { font-size: 13px; color: var(--ink-muted); margin-left: 4px; }
        .price-desc { margin-top: 14px; font-size: 13px; color: var(--ink-soft); line-height: 1.5; }
        .price-list { margin-top: 24px; list-style: none; display: flex; flex-direction: column; gap: 10px; font-size: 13px; }
        .price-list li { display: flex; gap: 10px; align-items: flex-start; }
        .price-list li::before { content: "+"; color: var(--accent); font-weight: 500; }
        .price-cta { margin-top: auto; padding-top: 24px; }

        /* faq */
        .rb-faq { border-bottom: 1px solid var(--line); }
        .rb-faq-head { padding: 72px 40px 40px; max-width: 1320px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1.3fr; gap: 40px; align-items: end; }
        .rb-faq-list { max-width: 1320px; margin: 0 auto; padding: 0 40px 72px; }
        .rb-faq-item { border-top: 1px solid var(--line-soft); }
        .rb-faq-item:last-child { border-bottom: 1px solid var(--line-soft); }
        .rb-faq-q { width: 100%; text-align: left; padding: 22px 0; display: flex; justify-content: space-between; align-items: center; font-size: 16px; letter-spacing: -0.01em; transition: color 150ms; color: var(--ink); }
        .rb-faq-q:hover { color: var(--accent); }
        .rb-faq-q-toggle { width: 22px; height: 22px; display: grid; place-items: center; border: 1px solid var(--line-soft); font-size: 14px; transition: transform 200ms, border-color 150ms, color 150ms; }
        .rb-faq-item.open .rb-faq-q-toggle { transform: rotate(45deg); border-color: var(--accent); color: var(--accent); }
        .rb-faq-a { max-height: 0; overflow: hidden; transition: max-height 300ms ease, padding 300ms ease; font-size: 13px; color: var(--ink-soft); line-height: 1.7; }
        .rb-faq-item.open .rb-faq-a { max-height: 260px; padding: 0 0 24px; }

        /* final cta */
        .rb-cta-final { padding: 120px 40px; border-bottom: 1px solid var(--line); background: var(--ink); color: var(--bg); position: relative; overflow: hidden; }
        .rb-root[data-theme="dark"] .rb-cta-final { background: var(--accent-soft); color: var(--ink); }
        .rb-cta-final-inner { max-width: 1320px; margin: 0 auto; display: grid; grid-template-columns: 1.2fr 1fr; gap: 40px; align-items: center; }
        .rb-cta-final-title { font-size: clamp(40px, 5vw, 72px); line-height: 0.98; letter-spacing: -0.025em; }
        .rb-cta-final-title em { color: var(--accent); font-style: italic; font-family: var(--font-instrument), serif; }
        .rb-cta-final-sub { margin-top: 20px; font-size: 14px; opacity: 0.7; max-width: 420px; }
        .rb-cta-final-btn { display: inline-flex; align-items: center; gap: 12px; padding: 18px 28px; background: var(--accent); color: var(--accent-ink); border: 1px solid var(--accent); font-size: 14px; transition: all 150ms; }
        .rb-cta-final-btn:hover { background: var(--bg); color: var(--ink); border-color: var(--bg); }

        /* footer */
        .rb-footer { padding: 48px 40px 32px; }
        .rb-footer-inner { max-width: 1320px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; }
        .rb-footer-brand-desc { margin-top: 16px; font-size: 12px; color: var(--ink-muted); max-width: 280px; line-height: 1.6; }
        .rb-footer-col-title { font-size: 11px; letter-spacing: 0.12em; color: var(--ink-muted); text-transform: uppercase; margin-bottom: 16px; }
        .rb-footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 10px; font-size: 13px; color: var(--ink-soft); }
        .rb-footer-col a:hover { color: var(--accent); }
        .rb-footer-bottom { max-width: 1320px; margin: 48px auto 0; padding-top: 20px; border-top: 1px solid var(--line-soft); display: flex; justify-content: space-between; font-size: 11px; color: var(--ink-muted); letter-spacing: 0.06em; }

        /* tweaks */
        .rb-tweaks { position: fixed; bottom: 24px; right: 24px; z-index: 100; background: var(--bg-elevated); border: 1px solid var(--line); padding: 16px; font-size: 12px; min-width: 240px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); color: var(--ink); }
        .rb-tweaks-head { display: flex; justify-content: space-between; margin-bottom: 14px; font-size: 11px; color: var(--ink-muted); letter-spacing: 0.12em; }
        .tweak-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-top: 1px solid var(--line-soft); }
        .tweak-row:first-of-type { border-top: 0; }
        .tweak-seg { display: flex; border: 1px solid var(--line-soft); }
        .tweak-seg button { padding: 4px 10px; font-size: 11px; border-right: 1px solid var(--line-soft); color: var(--ink-soft); }
        .tweak-seg button:last-child { border-right: 0; }
        .tweak-seg button.on { background: var(--ink); color: var(--bg); }
        .rb-tweaks-toggle { position: fixed; bottom: 24px; right: 24px; z-index: 99; padding: 8px 12px; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; border: 1px solid var(--line); background: var(--bg-elevated); color: var(--ink-soft); }

        .reveal { opacity: 0; transform: translateY(16px); transition: opacity 600ms ease, transform 600ms ease; }
        .reveal.in { opacity: 1; transform: none; }

        @media (max-width: 900px) {
          .rb-hero-inner, .rb-howto-head, .rb-features-head, .rb-demo-head, .rb-preview-head, .rb-pricing-head, .rb-faq-head, .rb-cta-final-inner { grid-template-columns: 1fr; }
          .rb-howto-grid, .rb-features-grid, .rb-pricing-grid, .rb-demo-panel { grid-template-columns: 1fr; }
          .rb-step, .rb-feature, .rb-price-card { border-right: 0; border-bottom: 1px solid var(--line-soft); }
          .rb-preview-grid { grid-template-columns: 1fr; }
          .rb-footer-inner { grid-template-columns: 1fr 1fr; }
          .rb-nav-links { display: none; }
          .rb-hero, .rb-howto-head, .rb-features-head, .rb-demo-head, .rb-preview-head, .rb-pricing-head, .rb-faq-head, .rb-demo-wrap, .rb-preview-grid, .rb-faq-list, .section-label, .rb-nav-inner, .rb-cta-final, .rb-footer { padding-left: 24px; padding-right: 24px; }
        }
      `}</style>

      {/* NAV */}
      <nav className="rb-nav">
        <div className="rb-nav-inner">
          <Link href="/" className="rb-logo">
            <span>repobrief</span>
            <span
              style={{
                fontSize: 11,
                color: "var(--ink-muted)",
                letterSpacing: "0.08em",
                marginLeft: 4,
              }}
            >
              v0.1
            </span>
          </Link>
          <div className="rb-nav-links">
            <a href="#how">how it works</a>
            <a href="#features">features</a>
            <a href="#demo">demo</a>
            <a href="#pricing">pricing</a>
            <a href="#faq">faq</a>
          </div>
          <div className="rb-nav-cta">
            <button
              className="btn btn-ghost"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? "◑" : "◐"}
            </button>

            <Link className="btn btn-accent" href="/auth">
              connect github →
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="rb-hero">
        <div className="rb-hero-grid" />
        <div className="rb-hero-inner">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-dot" /> REPOBRIEF // ANALYSIS ENGINE
            </div>
            <h1 className="rb-hero-title">
              Understand any
              <br />
              codebase in <span className="serif slash">minutes,</span>
              <br />
              not weeks.
            </h1>
            <p className="rb-hero-sub">
              Paste a GitHub repo. We map the architecture with Mermaid, extract
              the tech stack, and write a plain-English brief — so you can ship
              on day one instead of day thirty.
            </p>
            <div className="rb-hero-input-wrap">
              <form
                className="rb-hero-input-row"
                onSubmit={(e) => {
                  e.preventDefault();
                  submitRepo(input);
                }}
              >
                <div className="rb-hero-input-prefix">github.com/</div>
                <input
                  className="rb-hero-input"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    const match = heroExamples.find(
                      (x) =>
                        x.label.toLowerCase() ===
                        e.target.value.toLowerCase().trim(),
                    );
                    if (match) setVariant(match.v);
                  }}
                  placeholder="owner/repository"
                  autoComplete="off"
                  spellCheck={false}
                />
                <button type="submit" className="rb-hero-analyze">
                  analyze →
                </button>
              </form>
              <div className="rb-hero-examples">
                <span className="rb-hero-example-label">try:</span>
                {heroExamples.map((ex) => (
                  <button
                    key={ex.label}
                    type="button"
                    className="rb-hero-example-pill"
                    onClick={() => {
                      setInput(ex.label);
                      setVariant(ex.v);
                    }}
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <AnimatedDiagram variant={variant} live />
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="rb-marquee">
        <div className="rb-marquee-track">
          {[
            "JavaScript",
            "TypeScript",
            "Python",
            "Go",
            "Rust",
            "Ruby",
            "Java",
            "C++",
            "Svelte",
            "React",
            "Vue",
            "Django",
            "Rails",
            "Next.js",
            "FastAPI",
            "Elixir",
            "Kotlin",
          ]
            .concat([
              "JavaScript",
              "TypeScript",
              "Python",
              "Go",
              "Rust",
              "Ruby",
              "Java",
              "C++",
              "Svelte",
              "React",
              "Vue",
              "Django",
              "Rails",
              "Next.js",
              "FastAPI",
              "Elixir",
              "Kotlin",
            ])
            .map((s, i) => (
              <span key={i}>{s}</span>
            ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section id="how" className="rb-howto">
        <div className="section-label">
          <span>{"// 01 — HOW IT WORKS"}</span>
          <div className="section-label-right">
            <span>04 STEPS</span>
            <span>≈ 90s</span>
          </div>
        </div>
        <div className="rb-howto-head">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-dot" /> THE FLOW
            </div>
          </div>
          <h2 className="section-title reveal">
            From clone-URL to clarity in{" "}
            <span className="serif accent">under two minutes.</span>
          </h2>
        </div>
        <div className="rb-howto-grid">
          {[
            {
              n: "01",
              t: "Paste a URL",
              d: "Any public GitHub repo. Or sign in with GitHub to browse your private ones — read-only, revoke anytime.",
              v: (
                <svg width="100%" height="60" viewBox="0 0 200 60">
                  <rect
                    x="1"
                    y="18"
                    width="198"
                    height="28"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    opacity="0.4"
                  />
                  <text
                    x="12"
                    y="37"
                    fontFamily="var(--font-jetbrains)"
                    fontSize="10"
                    fill="currentColor"
                    opacity="0.6"
                  >
                    github.com/
                  </text>
                  <text
                    x="78"
                    y="37"
                    fontFamily="var(--font-jetbrains)"
                    fontSize="10"
                    fill="var(--accent)"
                  >
                    owner/repo
                  </text>
                  <line
                    x1="142"
                    y1="24"
                    x2="142"
                    y2="40"
                    stroke="var(--accent)"
                    strokeWidth="1"
                  >
                    <animate
                      attributeName="opacity"
                      values="1;0;1"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                  </line>
                </svg>
              ),
            },
            {
              n: "02",
              t: "We walk the tree",
              d: "We parse the file graph, manifests, and imports — mapping modules, services, and their relationships.",
              v: (
                <svg width="100%" height="60" viewBox="0 0 200 60">
                  <g
                    fontFamily="var(--font-jetbrains)"
                    fontSize="10"
                    fill="currentColor"
                    opacity="0.7"
                  >
                    <text x="4" y="14">
                      └ src/
                    </text>
                    <text x="20" y="28">
                      ├ api/
                    </text>
                    <text x="20" y="42">
                      ├ lib/
                    </text>
                    <text x="20" y="56">
                      └ ui/
                    </text>
                  </g>
                  <rect
                    x="2"
                    y="4"
                    width="80"
                    height="12"
                    fill="var(--accent)"
                    opacity="0.2"
                  />
                </svg>
              ),
            },
            {
              n: "03",
              t: "AI explains the why",
              d: "Claude reads key files and writes a brief: what this app does, how it's structured, and where to start.",
              v: (
                <svg width="100%" height="60" viewBox="0 0 200 60">
                  <line
                    x1="4"
                    y1="14"
                    x2="180"
                    y2="14"
                    stroke="currentColor"
                    strokeWidth="6"
                    opacity="0.15"
                  />
                  <line
                    x1="4"
                    y1="14"
                    x2="130"
                    y2="14"
                    stroke="var(--accent)"
                    strokeWidth="6"
                  />
                  <line
                    x1="4"
                    y1="30"
                    x2="150"
                    y2="30"
                    stroke="currentColor"
                    strokeWidth="6"
                    opacity="0.15"
                  />
                  <line
                    x1="4"
                    y1="30"
                    x2="90"
                    y2="30"
                    stroke="var(--accent)"
                    strokeWidth="6"
                  />
                  <line
                    x1="4"
                    y1="46"
                    x2="160"
                    y2="46"
                    stroke="currentColor"
                    strokeWidth="6"
                    opacity="0.15"
                  />
                  <line
                    x1="4"
                    y1="46"
                    x2="110"
                    y2="46"
                    stroke="var(--accent)"
                    strokeWidth="6"
                  />
                </svg>
              ),
            },
            {
              n: "04",
              t: "Ship on day one",
              d: "Open the brief in your editor, share it with your team, or export the Mermaid diagram to your docs.",
              v: (
                <svg width="100%" height="60" viewBox="0 0 200 60">
                  <rect
                    x="2"
                    y="10"
                    width="40"
                    height="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    opacity="0.4"
                  />
                  <rect
                    x="50"
                    y="10"
                    width="40"
                    height="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    opacity="0.4"
                  />
                  <rect
                    x="98"
                    y="10"
                    width="40"
                    height="40"
                    fill="var(--accent)"
                    opacity="0.25"
                    stroke="var(--accent)"
                    strokeWidth="1"
                  />
                  <text
                    x="118"
                    y="34"
                    textAnchor="middle"
                    fontFamily="var(--font-jetbrains)"
                    fontSize="10"
                    fill="currentColor"
                  >
                    .md
                  </text>
                  <path
                    d="M 148 30 L 175 30 M 170 25 L 175 30 L 170 35"
                    stroke="var(--accent)"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>
              ),
            },
          ].map((s) => (
            <div className="rb-step reveal" key={s.n}>
              <div className="rb-step-num">{s.n}</div>
              <h3 className="rb-step-title">{s.t}</h3>
              <p className="rb-step-desc">{s.d}</p>
              <div className="rb-step-visual">{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="rb-features">
        <div className="section-label">
          <span>{"// 02 — FEATURES"}</span>
          <div className="section-label-right">
            <span>06 MODULES</span>
          </div>
        </div>
        <div className="rb-features-head">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-dot" /> WHAT YOU GET
            </div>
          </div>
          <h2 className="section-title reveal">
            Six tools that turn a repo into a{" "}
            <span className="serif accent">full onboarding doc.</span>
          </h2>
        </div>
        <div className="rb-features-grid">
          {[
            {
              l: "MODULE 01",
              t: "Live architecture map",
              d: "Auto-generated Mermaid diagrams show how modules and services actually connect — rendered, not guessed.",
              g: (
                <svg width="160" height="88" viewBox="0 0 160 88">
                  <rect
                    x="60"
                    y="4"
                    width="40"
                    height="16"
                    fill="var(--accent)"
                    opacity="0.25"
                    stroke="var(--accent)"
                  />
                  <rect
                    x="10"
                    y="36"
                    width="40"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    opacity="0.6"
                  />
                  <rect
                    x="60"
                    y="36"
                    width="40"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    opacity="0.6"
                  />
                  <rect
                    x="110"
                    y="36"
                    width="40"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    opacity="0.6"
                  />
                  <rect
                    x="60"
                    y="68"
                    width="40"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    opacity="0.6"
                  />
                  <line
                    x1="80"
                    y1="20"
                    x2="30"
                    y2="36"
                    stroke="currentColor"
                    opacity="0.4"
                  />
                  <line
                    x1="80"
                    y1="20"
                    x2="80"
                    y2="36"
                    stroke="currentColor"
                    opacity="0.4"
                  />
                  <line
                    x1="80"
                    y1="20"
                    x2="130"
                    y2="36"
                    stroke="currentColor"
                    opacity="0.4"
                  />
                  <line
                    x1="80"
                    y1="52"
                    x2="80"
                    y2="68"
                    stroke="currentColor"
                    opacity="0.4"
                  />
                </svg>
              ),
            },
            {
              l: "MODULE 02",
              t: "Tech stack, dated",
              d: "Every framework, library, database, and runtime — with versions, license flags, and freshness indicators.",
              g: (
                <svg width="180" height="88" viewBox="0 0 180 88">
                  {[
                    "React 19.0.1",
                    "Next.js 15.2",
                    "Prisma 5.8",
                    "PostgreSQL 16",
                  ].map((t, i) => (
                    <g key={t}>
                      <rect
                        x="4"
                        y={6 + i * 20}
                        width="172"
                        height="14"
                        fill="none"
                        stroke="currentColor"
                        opacity="0.25"
                      />
                      <text
                        x="10"
                        y={16 + i * 20}
                        fontFamily="var(--font-jetbrains)"
                        fontSize="9"
                        fill="currentColor"
                      >
                        {t}
                      </text>
                      <circle
                        cx="168"
                        cy={13 + i * 20}
                        r="2"
                        fill="var(--accent)"
                      />
                    </g>
                  ))}
                </svg>
              ),
            },
            {
              l: "MODULE 03",
              t: "Plain-English brief",
              d: "An AI-written overview: what the repo does, how data flows, which files matter, and how to run it locally.",
              g: (
                <svg width="160" height="88" viewBox="0 0 160 88">
                  <line
                    x1="4"
                    y1="10"
                    x2="80"
                    y2="10"
                    stroke="var(--accent)"
                    strokeWidth="2"
                  />
                  {[20, 32, 44, 56, 68, 80].map((y, i) => (
                    <line
                      key={y}
                      x1="4"
                      y1={y}
                      x2={4 + 80 + (i % 3) * 25}
                      y2={y}
                      stroke="currentColor"
                      strokeWidth="2"
                      opacity={0.2 + (i % 2) * 0.15}
                    />
                  ))}
                </svg>
              ),
            },
            {
              l: "MODULE 04",
              t: "File heatmap",
              d: "See which files are the beating heart of the codebase — by commit density, imports, and coupling.",
              g: (
                <svg width="180" height="88" viewBox="0 0 180 88">
                  {Array.from({ length: 60 }).map((_, i) => {
                    const x = 4 + (i % 15) * 12;
                    const y = 4 + Math.floor(i / 15) * 20;
                    const op = ((i * 37) % 100) / 100;
                    return (
                      <rect
                        key={i}
                        x={x}
                        y={y}
                        width="9"
                        height="16"
                        fill="var(--accent)"
                        opacity={op * 0.9 + 0.05}
                      />
                    );
                  })}
                </svg>
              ),
            },
            {
              l: "MODULE 05",
              t: "Dependency graph",
              d: "Go beyond package.json. We trace real imports to surface what each module actually depends on.",
              g: (
                <svg width="160" height="88" viewBox="0 0 160 88">
                  {[
                    [30, 20],
                    [80, 12],
                    [130, 28],
                    [50, 50],
                    [110, 60],
                    [80, 75],
                  ].map(([x, y], i) => (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r={i === 1 ? 6 : 4}
                      fill={i === 1 ? "var(--accent)" : "currentColor"}
                      opacity={i === 1 ? 1 : 0.5}
                    />
                  ))}
                  {[
                    [30, 20, 80, 12],
                    [80, 12, 130, 28],
                    [80, 12, 50, 50],
                    [80, 12, 110, 60],
                    [50, 50, 80, 75],
                    [110, 60, 80, 75],
                  ].map(([x1, y1, x2, y2], i) => (
                    <line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="currentColor"
                      opacity="0.3"
                    />
                  ))}
                </svg>
              ),
            },
            {
              l: "MODULE 06",
              t: "Export everything",
              d: "Markdown, JSON, raw Mermaid, or a shareable link. Drop the brief straight into your team docs.",
              g: (
                <svg width="180" height="88" viewBox="0 0 180 88">
                  {["markdown", "mermaid", "json", "link"].map((t, i) => (
                    <g key={t}>
                      <rect
                        x={4 + i * 44}
                        y="28"
                        width="40"
                        height="32"
                        fill="none"
                        stroke="currentColor"
                        opacity="0.4"
                      />
                      <text
                        x={24 + i * 44}
                        y="48"
                        textAnchor="middle"
                        fontFamily="var(--font-jetbrains)"
                        fontSize="8"
                        fill="currentColor"
                      >
                        .{t}
                      </text>
                    </g>
                  ))}
                </svg>
              ),
            },
          ].map((f) => (
            <div className="rb-feature reveal" key={f.l}>
              <div className="rb-feature-label">{f.l}</div>
              <h3 className="rb-feature-title">{f.t}</h3>
              <p className="rb-feature-desc">{f.d}</p>
              <div className="rb-feature-glyph">{f.g}</div>
            </div>
          ))}
        </div>
      </section>

      {/* LIVE DEMO */}
      <section id="demo" className="rb-demo">
        <div className="section-label">
          <span>{"// 03 — LIVE DEMO"}</span>
          <div className="section-label-right">
            <span>INTERACTIVE</span>
          </div>
        </div>
        <div className="rb-demo-head">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-dot" /> TRY IT WITHOUT SIGNING IN
            </div>
          </div>
          <h2 className="section-title reveal">
            Pick a repo. Watch <span className="serif accent">it unpack.</span>
          </h2>
        </div>
        <div className="rb-demo-wrap">
          <div className="rb-demo-tabs">
            {DEMO_REPOS.map((r, i) => (
              <button
                key={r.name}
                className={`rb-demo-tab ${i === demoIdx ? "active" : ""}`}
                onClick={() => setDemoIdx(i)}
              >
                <span className="rb-demo-tab-repo">{r.name}</span>
                <span className="rb-demo-tab-lang">
                  {r.lang.toUpperCase()} · ★ {r.stars}
                </span>
              </button>
            ))}
          </div>
          <div className="rb-demo-panel">
            <div className="rb-demo-col">
              <div className="rb-demo-col-title">
                TECH STACK <span>{Object.keys(demo.stack).length} groups</span>
              </div>
              {Object.entries(demo.stack).map(([group, items]) => (
                <div className="stack-group" key={group}>
                  <div className="stack-group-label">{group}</div>
                  {items.map((it) => (
                    <div className="stack-item" key={it.n}>
                      <span className="stack-item-name">{it.n}</span>
                      <span className="stack-item-v">{it.v}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="rb-demo-col" style={{ padding: 0 }}>
              <div style={{ padding: "24px 24px 8px" }}>
                <div className="rb-demo-col-title">
                  ARCHITECTURE <span>auto-generated</span>
                </div>
              </div>
              <div
                style={{ padding: "0 12px 12px", height: "calc(100% - 60px)" }}
              >
                <div
                  style={{
                    height: "100%",
                    border: "1px solid var(--line-soft)",
                  }}
                >
                  <AnimatedDiagram variant={demoIdx} live={false} />
                </div>
              </div>
            </div>
            <div className="rb-demo-col">
              <div className="rb-demo-col-title">
                AI BRIEF <span>claude 4.5</span>
              </div>
              <div className="ai-summary">{demo.summary}</div>
              <div style={{ marginTop: 24 }}>
                <div className="rb-demo-col-title">METRICS</div>
                {demo.metrics.map(([k, v]) => (
                  <div className="ai-metric" key={k}>
                    <span style={{ color: "var(--ink-muted)" }}>{k}</span>
                    <span className="ai-metric-v">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PREVIEW */}
      <section className="rb-preview">
        <div className="section-label">
          <span>{"// 04 — OUTPUT"}</span>
          <div className="section-label-right">
            <span>MARKDOWN · MERMAID</span>
          </div>
        </div>
        <div className="rb-preview-head">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-dot" /> WHAT YOU EXPORT
            </div>
          </div>
          <h2 className="section-title reveal">
            One command. Two files.{" "}
            <span className="serif accent">A full onboarding.</span>
          </h2>
        </div>
        <div className="rb-preview-grid">
          <div className="code-card reveal">
            <div className="code-card-head">
              <span>architecture.mmd</span>
              <span>MERMAID · 42 LINES</span>
            </div>
            <div className="code-card-body">
              <pre>
                <span className="c-k">graph</span> TD{"\n"}
                {"  "}A[<span className="c-s">app/</span>] --&gt; B[
                <span className="c-s">api/</span>]{"\n"}
                {"  "}A --&gt; C[<span className="c-s">components/</span>]{"\n"}
                {"  "}A --&gt; D[<span className="c-s">lib/</span>]{"\n"}
                {"\n"}
                {"  "}B --&gt; E[<span className="c-s">routes/</span>]{"\n"}
                {"  "}B --&gt; F[<span className="c-s">middleware/</span>]{"\n"}
                {"  "}C --&gt; G[<span className="c-s">ui/</span>]{"\n"}
                {"  "}C --&gt; H[<span className="c-s">forms/</span>]{"\n"}
                {"  "}D --&gt; I[<span className="c-s">db.ts</span>]{"\n"}
                {"  "}D --&gt; J[<span className="c-s">auth.ts</span>]{"\n"}
                {"\n"}
                {"  "}I --&gt; K[(PostgreSQL)]{"\n"}
                {"  "}J --&gt; L[(Clerk)]{"\n"}
                {"\n"}
                {"  "}
                <span className="c-c">%% generated by repobrief v0.4</span>
                {"\n"}
                {"  "}
                <span className="c-c">%% commit: a7f3d2e · 2026-04-18</span>
              </pre>
            </div>
          </div>
          <div className="code-card reveal">
            <div className="code-card-head">
              <span>brief.md</span>
              <span>MARKDOWN · 184 LINES</span>
            </div>
            <div className="code-card-body">
              <pre>
                <span className="c-k"># acme-dashboard</span>
                {"\n\n"}A multi-tenant admin panel built on Next.js 15 with
                {"\n"}
                server components, Prisma, and Clerk for auth.{"\n\n"}
                <span className="c-k">## tl;dr</span>
                {"\n\n"}- Renders on Node.js runtime, not edge{"\n"}- Data
                layer: Prisma → PostgreSQL (AWS RDS){"\n"}- Auth: Clerk (see{" "}
                <span className="c-s">lib/auth.ts</span>){"\n"}- Billing: Stripe
                Subscriptions{"\n\n"}
                <span className="c-k">## where to start</span>
                {"\n\n"}
                Read <span className="c-s">
                  app/(dashboard)/layout.tsx
                </span>{" "}
                first —{"\n"}
                it wires auth, tenant context, and nav. All feature{"\n"}
                routes live under{" "}
                <span className="c-s">app/(dashboard)/[org]/</span>.{"\n\n"}
                <span className="c-k">## how to run</span>
                {"\n\n"}
                <span className="c-s">
                  pnpm install{"\n"}pnpm db:push{"\n"}pnpm dev
                </span>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="rb-pricing">
        <div className="section-label">
          <span>{"// 05 — PRICING"}</span>
          <div className="section-label-right">
            <span>3 TIERS</span>
          </div>
        </div>
        <div className="rb-pricing-head">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-dot" /> PAY FOR WHAT YOU SHIP
            </div>
          </div>
          <h2 className="section-title reveal">
            Free to try. <span className="serif accent">Honest to scale.</span>
          </h2>
        </div>
        <div className="rb-pricing-grid">
          {[
            {
              tier: "HOBBY",
              price: "0",
              per: "/ forever",
              desc: "For curious developers exploring open-source codebases.",
              features: [
                "10 public repo analyses / month",
                "Architecture diagram (Mermaid)",
                "AI brief (short form)",
                "Markdown export",
              ],
              cta: "Start free",
              ctaClass: "btn",
              featured: false,
            },
            {
              tier: "PRO",
              price: "18",
              per: "/ month",
              desc: "For engineers onboarding to new jobs, contractors, and reviewers.",
              features: [
                "Unlimited public + private repos",
                "Full brief + dependency graph",
                "File heatmap + code owners",
                "JSON / Mermaid / PDF export",
                "Priority analysis queue",
              ],
              cta: "Start 14-day trial",
              ctaClass: "btn btn-accent",
              featured: true,
            },
            {
              tier: "TEAM",
              price: "Custom",
              per: "",
              desc: "For engineering teams onboarding together or auditing inherited code.",
              features: [
                "Everything in Pro",
                "Shared workspace + comments",
                "SAML / SSO",
                "On-prem deploy option",
                "Dedicated support",
              ],
              cta: "Book a call",
              ctaClass: "btn",
              featured: false,
            },
          ].map((t) => (
            <div
              key={t.tier}
              className={`rb-price-card ${t.featured ? "featured" : ""} reveal`}
            >
              <div className="price-tier">
                {t.tier}{" "}
                {t.featured && (
                  <span style={{ color: "var(--accent)" }}>· POPULAR</span>
                )}
              </div>
              <div className="price-value">
                {t.price === "Custom" ? (
                  <span style={{ fontSize: 36 }}>Custom</span>
                ) : (
                  <>
                    <sup>$</sup>
                    {t.price}
                    <small>{t.per}</small>
                  </>
                )}
              </div>
              <div className="price-desc">{t.desc}</div>
              <ul className="price-list">
                {t.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <div className="price-cta">
                <Link href="/auth" className={t.ctaClass}>
                  {t.cta} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="rb-faq">
        <div className="section-label">
          <span>{"// 06 — FAQ"}</span>
          <div className="section-label-right">
            <span>06 ITEMS</span>
          </div>
        </div>
        <div className="rb-faq-head">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-dot" /> QUESTIONS
            </div>
          </div>
          <h2 className="section-title reveal">
            Things people ask{" "}
            <span className="serif accent">before signing up.</span>
          </h2>
        </div>
        <div className="rb-faq-list">
          {FAQ_ITEMS.map((it, i) => (
            <div
              key={i}
              className={`rb-faq-item ${faqOpen === i ? "open" : ""}`}
            >
              <button
                className="rb-faq-q"
                onClick={() => setFaqOpen(faqOpen === i ? -1 : i)}
              >
                <span>{it.q}</span>
                <span className="rb-faq-q-toggle">+</span>
              </button>
              <div className="rb-faq-a">{it.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="rb-cta-final">
        <div className="rb-cta-final-inner">
          <div>
            <h2 className="rb-cta-final-title">
              Stop reading
              <br />
              codebases.{" "}
              <em>
                Start
                <br />
                shipping in them.
              </em>
            </h2>
            <p className="rb-cta-final-sub">
              Connect your GitHub and turn your next unfamiliar repo into a
              brief in 90 seconds. Free to try.
            </p>
          </div>
          <div style={{ justifySelf: "end" }}>
            <Link href="/auth" className="rb-cta-final-btn">
              <span style={{ fontSize: 16 }}>◉</span>
              Connect GitHub → Analyze a repo
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="rb-footer">
        <div className="rb-footer-inner">
          <div>
            <div className="rb-logo">
              <div className="rb-logo-mark">R</div>
              <span>repobrief</span>
            </div>
            <p className="rb-footer-brand-desc">
              Read any codebase in minutes. Built for engineers who&apos;d
              rather ship than spelunk.
            </p>
          </div>
          <div className="rb-footer-col">
            <div className="rb-footer-col-title">Product</div>
            <ul>
              <li>
                <a href="#features">Features</a>
              </li>
              <li>
                <a href="#pricing">Pricing</a>
              </li>
              <li>
                <a href="#demo">Demo</a>
              </li>
              <li>
                <a href="#faq">FAQ</a>
              </li>
            </ul>
          </div>
          <div className="rb-footer-col">
            <div className="rb-footer-col-title">Company</div>
            <ul>
              <li>
                <a href="#">About</a>
              </li>
              <li>
                <a href="#">Blog</a>
              </li>
              <li>
                <a href="#">Careers</a>
              </li>
              <li>
                <a href="#">Contact</a>
              </li>
            </ul>
          </div>
          <div className="rb-footer-col">
            <div className="rb-footer-col-title">Resources</div>
            <ul>
              <li>
                <a
                  href="https://github.com/DoganayBalaban/repobrief"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a href="#">Docs</a>
              </li>
              <li>
                <a href="#">API</a>
              </li>
              <li>
                <a href="#">Security</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="rb-footer-bottom">
          <span>© 2026 REPOBRIEF // ALL RIGHTS RESERVED</span>
          <span>MADE WITH ◆ IN ISTANBUL</span>
        </div>
      </footer>
    </div>
  );
}
