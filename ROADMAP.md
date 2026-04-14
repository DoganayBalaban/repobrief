# RepoBrief — Feature Roadmap

## 1. My Analyses (Dashboard history)

**Scope:** Small  
**Value:** Users can revisit previous analyses without re-running Claude.

- Add `/dashboard/analyses` page listing all analyses by current user from DB
- Show: repo name, commit SHA, date, view count, link to shareable page
- Sort by most recent
- Reuse existing `db.analysis.findMany({ where: { userId } })` query

---

## 2. Force Refresh (Re-analyze button)

**Scope:** Small  
**Value:** Power users can bypass cache and get a fresh analysis after code changes.

- Add `?force=true` query param support to `POST /api/analyze`
- When `force=true`: skip cache hit check, run Claude, overwrite DB record
- Add "Re-analyze" button in `analyze-button.tsx` shown alongside result cards
- Counts toward monthly quota (intentional — it's a full Claude call)

---

## 3. Dashboard Repo Search / Filter

**Scope:** Small  
**Value:** 30 repos listed with no filter is noisy. Search improves UX significantly.

- Add client-side search input above repo list in `dashboard/page.tsx`
- Filter by repo name or description in real-time (no API call needed)
- Add language filter dropdown (TypeScript, Python, Go, etc.)
- Keep it client-side — data is already fetched server-side

---

## 4. Public Repo URL Input (No login required)

**Scope:** Medium  
**Value:** Highest conversion impact — users see value before being asked to sign in.

- Add URL input on landing page: `github.com/owner/repo` → analyze
- Anonymous analysis: no GitHub OAuth needed for public repos
- Use unauthenticated Octokit (no personal access token) for public repos
- Rate limit anonymous users by IP (stricter: 1-2 analyses/day)
- Show result, then prompt sign-in to save/share/get full quota
- Cache anonymous results in DB with `userId: null`

---

## 5. Stripe + Pro Plan

**Scope:** Large  
**Value:** Core monetization. Unlocks unlimited analyses + private repos.

- Integrate Stripe Checkout for `$9/month` Pro subscription
- Add `plan` field to user record (requires User model in Prisma)
- Pro users: skip rate limit check in `/api/analyze`
- Add `/dashboard/billing` page: current plan, usage, upgrade/cancel
- Webhook: `customer.subscription.created/deleted` → update plan in DB
- Show upgrade CTA when free limit is reached (currently just error message)

---

## 6. CLI Tool

**Scope:** Large  
**Value:** Developer-native UX, viral potential via `npx repobrief owner/repo`.

- Publish `repobrief` npm package
- `npx repobrief analyze <owner/repo>` → calls `/api/analyze` → streams to terminal
- Auth via personal API key (requires API key system in backend)
- Output: plain text or `--json` flag for structured output
- `npx repobrief analyze <owner/repo> --output analysis.md` → export to file
- Requires: API key management (new feature), rate limiting by key
