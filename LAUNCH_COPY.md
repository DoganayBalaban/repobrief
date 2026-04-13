# RepoBrief — Launch Copy

## Twitter/X Thread

**1/6**
```
Shipping RepoBrief — paste a GitHub URL, get a full repo breakdown in seconds.
Architecture diagram, file map, tech stack, onboarding guide.
Powered by Claude AI, streams token-by-token. Free.
repobrief.vercel.app
```

**2/6**
```
What you get from a single analysis:
→ Mermaid architecture diagram rendered in-browser
→ Scored file map (top 15 key files by signal)
→ Tech stack badges color-coded by category
→ Step-by-step onboarding guide

From the repo's actual source — no hallucinated summaries.
```

**3/6**
```
Results are cached at the commit hash level.
Same repo, same commit = instant load, no API call.
Share the permanent link with anyone. Tracks view count.
New commit → fresh analysis → new cache entry.
```

**4/6**
```
Export any analysis as Markdown.
Useful for internal docs, PR descriptions, onboarding wikis, Notion.
One click, full structured output.
```

**5/6**
```
The hard part wasn't the Claude integration.
It was context window management.

Repos can have hundreds of files. RepoBrief scores each by signal
(path, name, extension, size), takes top 15, truncates to fit the
window, builds a structured XML prompt.

Streaming: messages.stream() → ReadableStream → TextDecoder on client.
Cold analysis: under 20s on most repos.
```

**6/6**
```
Free: 5 analyses/month, public repos.
Pro: $9/mo — unlimited + private repos.
Open source: github.com/DoganayBalaban/repobrief

Try it: repobrief.vercel.app
```

---

## LinkedIn Post

```
I built RepoBrief over the past two weeks — an AI-powered GitHub repo analyzer
that produces architecture diagrams, file maps, tech stack summaries, and
onboarding guides from a single URL.

The engineering challenge I found most interesting was context window management.
A GitHub repo can have hundreds of files. Sending everything to Claude isn't
feasible, so I built a scoring layer: fetch the full git tree via Octokit, score
each file by path signal, extension, naming conventions, and size, then select
the top 15. Content is fetched and truncated before being assembled into a
structured XML prompt.

Streaming is handled server-side with Anthropic's messages.stream() piped into
a ReadableStream from a Next.js 16 Route Handler. Client reads chunks via
TextDecoder and renders live. Results are cached at the commit hash level in
Neon Postgres — same commit = instant response, shareable permanent link.

Stack: Next.js 16, Claude (claude-sonnet-4-6), Neon Postgres + Prisma,
NextAuth v5, Vercel.

Free: 5 analyses/month on public repos.
Pro: $9/mo — unlimited + private repos.

→ repobrief.vercel.app
→ github.com/DoganayBalaban/repobrief
```

---

## Hacker News — Show HN

**Title:**
```
Show HN: RepoBrief – AI-powered GitHub repo analyzer with streaming output and commit-level caching
```

**Body:**
```
RepoBrief takes a GitHub repo URL and produces a structured analysis: Mermaid
architecture diagram, scored file map, color-coded tech stack badges, and an
onboarding guide. Output streams token-by-token in the browser.

The main technical problem was fitting a real repository into a usable context
window. I built a two-stage pipeline: fetch the full git tree and score each
file using heuristics (path depth, filename patterns like "main"/"index"/"config",
extension weight, size). Then fetch raw content of the top 15 files, truncate
each to a per-file token budget, and assemble a structured XML prompt. This
works well for most repos but breaks down on monorepos with deep nesting or
repos where logic is spread across many small files — a known limitation.

Caching is at the commit hash level using Neon Postgres + Prisma. A given
owner/repo/commit triple returns instantly with no API call. New commit → fresh
analysis → stored under the new hash with a permanent shareable URL.

Streaming: Anthropic's messages.stream() on the server, piped into a
ReadableStream from a Next.js 16 Route Handler, TextDecoder on the client.

Free tier: 5 analyses/month, public repos.
Pro: $9/month, unlimited + private repos.
Open source: github.com/DoganayBalaban/repobrief
```

---

## Product Hunt

**Title:**
```
RepoBrief — Understand any GitHub repo in seconds with Claude AI
```

**Tagline:**
```
AI-powered repo analysis: diagrams, file maps & onboarding
```

**Description:**
```
RepoBrief is an open-source tool that analyzes any GitHub repository and
generates a structured breakdown — powered by Claude AI.

What you get in seconds:
→ Plain-English description of what the repo does
→ Mermaid architecture diagram (auto-rendered)
→ Key file map with one-line explanations
→ Getting started / onboarding guide
→ Tech stack badges color-coded by category

How it's different:
• Streaming output — watch Claude think in real-time
• Commit-hash cache — same commit = instant result, no repeat API calls
• Shareable links — every analysis gets a public URL with view count
• Built with Next.js 16, React 19, Prisma + Neon Postgres, NextAuth v5

Free plan: 5 analyses/month, public repos.

Open source on GitHub. Built in 2 weeks as a portfolio project to demo
streaming LLM architecture, context window management, and full-stack
Next.js with Postgres.
```

**First Comment (maker's comment):**
```
Hey PH! 👋

I built RepoBrief to solve a real pain: jumping into an unfamiliar codebase
and spending 30 minutes just figuring out what it does and where things live.

The hardest technical challenge was context window management — GitHub repos
can have thousands of files, but Claude's context isn't infinite. RepoBrief
scores files by importance (entry points, config, schema, routes) and selects
the top ~15 to send.

Would love feedback on: what other outputs would be useful?
(test coverage summary? dependency audit? contributor guide?)

GitHub: github.com/DoganayBalaban/repobrief
```
