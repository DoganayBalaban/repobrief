# RepoBrief

> Understand any GitHub repository in seconds — powered by Claude AI.

![RepoBrief Landing](public/screenshots/landing.png)

**RepoBrief** analyzes GitHub repositories and generates a structured breakdown: description, architecture diagram, file map, onboarding guide, and tech stack badges — streamed live as Claude thinks.

🌐 **Live:** [repobrief.vercel.app](https://repobrief.vercel.app)

---

## Features

- **GitHub OAuth** — one-click sign-in, no manual token setup
- **AI Analysis** — Claude reads your repo's key files and generates a structured summary
- **Live Streaming** — see the response stream token-by-token as it's generated
- **Mermaid Architecture Diagram** — auto-rendered from Claude's output
- **Tech Stack Badges** — color-coded by category (language, framework, database, devops…)
- **Export as Markdown** — download the full analysis as a `.md` file
- **Share Link** — one-click URL copy

![Auth Page](public/screenshots/auth.png)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router) |
| Language | TypeScript + React 19 |
| AI | Anthropic Claude (claude-sonnet-4-6) |
| Auth | NextAuth v5 + GitHub OAuth |
| GitHub API | Octokit v5 |
| UI | shadcn/ui + Tailwind CSS v4 |
| Diagrams | Mermaid.js + DOMPurify |
| Deploy | Vercel |

---

## How It Works

1. Sign in with GitHub OAuth
2. Pick any repo from your list (or enter a public repo URL)
3. Click **Analyze with Claude**
4. Watch the analysis stream in real-time
5. Get: description · architecture diagram · file map · onboarding guide · tech stack

**Context management:** RepoBrief scores and selects the top ~15 files (README, entry points, config, schema, routes) to fit within Claude's context window without sending everything.

---

## Local Development

```bash
# Clone
git clone https://github.com/DoganayBalaban/repobrief.git
cd repobrief

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in: AUTH_SECRET, AUTH_GITHUB_ID, AUTH_GITHUB_SECRET, ANTHROPIC_API_KEY

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Description |
|---|---|
| `AUTH_SECRET` | NextAuth secret (generate with `openssl rand -base64 32`) |
| `AUTH_GITHUB_ID` | GitHub OAuth App Client ID |
| `AUTH_GITHUB_SECRET` | GitHub OAuth App Client Secret |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `NEXTAUTH_URL` | Base URL (e.g. `http://localhost:3000` for local) |

### GitHub OAuth Setup

1. Go to GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
2. Set **Authorization callback URL** to `http://localhost:3000/api/auth/callback/github`
3. Copy Client ID and Client Secret to `.env.local`

---

## Project Structure

```
src/
├── app/
│   ├── api/analyze/        # Streaming Claude API route
│   ├── auth/               # Sign-in page
│   ├── dashboard/          # Repo list + repo detail pages
│   └── page.tsx            # Landing page
├── components/
│   ├── analyze-button.tsx  # Streaming UI + result cards
│   └── mermaid-diagram.tsx # Mermaid renderer with DOMPurify
└── lib/
    ├── analyze.ts           # Claude API call
    ├── analyze-stream.ts    # Streaming version
    ├── file-content.ts      # Fetch + truncate key files
    ├── file-score.ts        # File scoring algorithm
    ├── file-tree.ts         # GitHub git tree fetcher
    ├── parse-xml.ts         # XML section parser (client-safe)
    └── prompt.ts            # System + user prompt builder
```

---

## Roadmap

- [x] GitHub OAuth
- [x] Octokit file pipeline
- [x] Claude API integration
- [x] Streaming UI
- [x] Mermaid architecture diagram
- [x] Tech stack badges
- [x] Export as Markdown
- [ ] Vercel KV cache (commit-hash based)
- [ ] Neon Postgres (shareable links)
- [ ] Rate limiting (free: 5 analyses/month)
- [ ] Private repo support (Pro)

---

Built with [Claude](https://claude.ai) · [Next.js](https://nextjs.org) · [Vercel](https://vercel.com)
