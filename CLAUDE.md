# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server at http://localhost:3000
npm run build    # production build
npm run lint     # run eslint
```

## Stack

- **Next.js 16.2.2** (App Router) — see `node_modules/next/dist/docs/01-app/` for authoritative docs on this version
- **React 19.2.4** with TypeScript
- **Tailwind CSS v4** — configured via `postcss.config.mjs`; uses `@tailwindcss/postcss` plugin (not the v3 CLI)
- **@anthropic-ai/sdk** — Anthropic Claude API, streaming via `messages.stream()`
- **octokit** — GitHub REST API client
- **next-auth v5 (beta)** — GitHub OAuth, `auth()` for session, `signIn/signOut` server actions
- **mermaid + dompurify** — Architecture diagram rendering with XSS sanitization
- **shadcn/ui (new-york)** — UI primitives, configured in `components.json`

## Architecture

**Auth flow:** `src/auth.ts` → NextAuth v5 GitHub provider → JWT callback forwards `accessToken` → `src/lib/octokit.ts` uses it to create authenticated Octokit instance.

**Analysis pipeline:**
1. `src/lib/file-tree.ts` — fetch GitHub git tree (filtered, max 150 files)
2. `src/lib/file-score.ts` — score + select top 15 key files
3. `src/lib/file-content.ts` — fetch + truncate file contents
4. `src/lib/prompt.ts` — build system + user prompt (XML-only output format)
5. `src/lib/analyze-stream.ts` — `messages.stream()` → `ReadableStream<Uint8Array>`

**Streaming:** `POST /api/analyze` (`src/app/api/analyze/route.ts`) returns `ReadableStream`. Client in `src/components/analyze-button.tsx` reads chunks with `TextDecoder`, shows live output, then parses XML sections via `src/lib/parse-xml.ts` (client-safe — no Anthropic import).

**Important:** `parse-xml.ts` must NOT import from `analyze.ts` or anything that imports `@anthropic-ai/sdk` — this causes the Anthropic SDK to bundle into the client.

**Routing guard:** `src/proxy.ts` (Next.js 16 replacement for `middleware.ts`) — redirects unauthenticated `/dashboard` requests to `/`.

**Pages:**
- `/` — Landing page (Server Component, redirects to `/dashboard` if authed)
- `/auth` — Sign-in page with GitHub OAuth server action
- `/dashboard` — Repo list (fetches from GitHub API)
- `/dashboard/[owner]/[repo]` — Repo detail + AnalyzeButton

All pages use inline `<style>` for page-specific animations (dark theme, zinc-950 + lime-400 accent). shadcn/ui components are in `src/components/ui/`.
