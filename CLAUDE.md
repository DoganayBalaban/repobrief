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
- **@anthropic-ai/sdk** — Anthropic Claude API client
- **octokit** — GitHub API client

## Architecture

The app uses the Next.js App Router under `src/app/`. All layouts, pages, and route handlers live there. The root layout (`src/app/layout.tsx`) sets up Geist fonts via `next/font/google` and a full-height flex body.

This project is in early/bootstrapped state — `src/app/page.tsx` is still the default starter page. The installed packages (`@anthropic-ai/sdk`, `octokit`) indicate the intended purpose is GitHub repository summarization via Claude, but no application logic has been implemented yet.

API routes should be placed under `src/app/api/` as Route Handlers (not the Pages Router `pages/api/` pattern). Server Components are the default; add `"use client"` only when needed.
