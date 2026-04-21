# Plan: Freemium User Accounts + Discogs Integration

**Feature**: freemium  
**Date**: 2026-04-20  
**Phase**: Plan  
**Status**: Draft

---

## Executive Summary

| Perspective | Summary |
|---|---|
| **Problem** | The site has no user accounts, so every visit is anonymous and one-shot — no retention, no monetization, and no way to re-access past results. |
| **Solution** | Add Supabase auth, a freemium usage limit (3/month free → Stripe paid unlimited), persistent job history with re-downloads, and Discogs links on every identified track. |
| **UX Effect** | Users sign up once, get 3 free identifications per month, can revisit past mixes, re-download files, and click straight to Discogs for any track they discover. |
| **Core Value** | Transforms a one-shot tool into a retained product with a clear upgrade path and Stripe subscription revenue. |

---

## Context Anchor

| Axis | Detail |
|---|---|
| **WHY** | Free tool has no monetization or retention. Need sustainable revenue + user engagement. |
| **WHO** | DJ and vinyl enthusiasts who regularly identify mixes — likely 1–10x/month power users. |
| **RISK** | Auth friction may reduce conversion. File storage costs grow with users. Stripe webhook complexity. |
| **SUCCESS** | Users sign up, hit limit, upgrade. Churn is low. History re-downloads work reliably. |
| **SCOPE** | Auth + freemium limits + Stripe billing + job history + file persistence + Discogs links. |

---

## 1. Requirements

### 1.1 User Authentication
- Email + password signup/login via Supabase Auth
- Optional: Google OAuth (phase 2)
- Email verification before first use
- Password reset flow
- Session persistence (stay logged in)

### 1.2 Freemium Usage Limits
- Anonymous users: 0 free uses (must sign up)
- Free accounts: 3 uses per calendar month (resets on the 1st)
- Premium accounts: unlimited uses
- Usage counter visible in UI (e.g. "2 of 3 uses remaining this month")
- Clear upgrade prompt when limit reached

### 1.3 Stripe Subscription (Premium)
- Single premium plan (e.g. $4.99/month or $39/year)
- Stripe Checkout for payment flow
- Stripe webhook to activate/deactivate premium status in DB
- Billing portal for cancellation/management
- Grace period: if payment fails, keep premium for 3 days before downgrade

### 1.4 Job History
- Each upload is associated with the logged-in user
- History page shows: date, file name, track count, status
- Can re-open any past result (full tracklist with covers)
- History retained for 90 days (free) / indefinitely (premium)

### 1.5 File Re-downloads
- SRT file, album covers ZIP, and tracklist CSV stored persistently in Supabase Storage
- Re-downloadable from history page at any time within retention period
- Files currently generated on-the-fly → must be saved at job completion

### 1.6 Discogs Links
- After song identification, each track card shows a "Find on Discogs" link
- Link searches Discogs for the track title + artist
- Opens in new tab
- No affiliate revenue (Discogs has no public affiliate program)

---

## 2. Out of Scope

- Google / social OAuth login (phase 2)
- Team/shared accounts
- Per-track Discogs purchase tracking or revenue
- Mobile app
- Admin dashboard (use Supabase dashboard directly)

---

## 3. Technical Stack

| Component | Choice | Reason |
|---|---|---|
| Auth | Supabase Auth | Built-in email/password, session management, row-level security |
| Database | Supabase PostgreSQL | Store users, jobs, usage counts, subscriptions |
| File Storage | Supabase Storage | Store SRT, ZIP, covers persistently |
| Payments | Stripe | Subscriptions, webhooks, billing portal |
| Frontend | Next.js App Router (existing) | Server components for auth state |
| Email | Supabase default (SMTP) | Verification + password reset emails |

---

## 4. Database Schema

### `profiles` (extends Supabase auth.users)
```
id          uuid (FK auth.users)
email       text
plan        enum('free', 'premium')
stripe_customer_id  text
stripe_subscription_id  text
subscription_status text
created_at  timestamptz
```

### `jobs`
```
id              uuid (PK, also used as existing job ID)
user_id         uuid (FK profiles)
file_name       text
status          enum('pending', 'processing', 'done', 'failed')
track_count     int
created_at      timestamptz
expires_at      timestamptz  -- 90 days free / null premium
result_json     jsonb        -- full tracklist result
srt_path        text         -- Supabase Storage path
zip_path        text         -- Supabase Storage path
```

### `usage`
```
id          uuid
user_id     uuid (FK profiles)
month       text  -- e.g. '2026-04'
count       int
```

---

## 5. API Changes

### New endpoints
| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/callback` | GET | Supabase OAuth callback handler |
| `/api/stripe/checkout` | POST | Create Stripe Checkout session |
| `/api/stripe/portal` | POST | Create Stripe billing portal session |
| `/api/stripe/webhook` | POST | Handle Stripe events (subscription updates) |
| `/api/jobs` | GET | List user's job history |

### Modified endpoints
| Endpoint | Change |
|---|---|
| `/api/upload` | Check auth + enforce freemium limit before processing |
| `/api/status/[id]` | Verify job belongs to requesting user |
| `/api/download/[id]` | Serve from Supabase Storage if persistent, fallback to on-the-fly |

---

## 6. User Flows

### Sign Up + First Use
1. User lands on homepage → sees "Sign up for free" banner
2. Clicks → email/password form → email verification sent
3. Verifies email → redirected back to app
4. Uploads mix → usage count increments (1 of 3)
5. Gets results with Discogs links on each track

### Hitting the Limit
1. User reaches 3rd upload of the month
2. On 4th attempt → modal: "You've used all 3 free identifications this month. Upgrade to Premium for unlimited access."
3. Click "Upgrade" → Stripe Checkout → payment → webhook → premium activated
4. Redirect back → upload proceeds immediately

### History Re-download
1. User navigates to `/history`
2. Sees list of past jobs with date, filename, track count
3. Clicks a job → full results page (same UI as live results)
4. Downloads SRT, ZIP, or tracklist from stored files

### Discogs Link
1. Results page shows each identified track
2. Each track card has "Find on Discogs ↗" button
3. Clicks → opens `https://www.discogs.com/search/?q={title}+{artist}&type=release` in new tab

---

## 7. UI Changes

### New pages
- `/login` — Sign in form
- `/signup` — Sign up form
- `/account` — Usage counter, plan status, manage billing button
- `/history` — Job history list
- `/history/[id]` — Past result view (reuses result UI)

### Modified components
- `PageShell` — Add nav items: Login/Signup or Account/History
- `UploadZone` — Check auth state; show sign-up prompt for anonymous users; show usage counter for free users
- `TrackList` — Add "Find on Discogs" button to each track card
- New: `UsageBanner` — Shows "X of 3 uses remaining" for free users

---

## 8. Migration Plan

### Existing anonymous jobs
- All current jobs are ephemeral (no DB) — no migration needed
- After launch, all new jobs require auth

### Existing file generation
- SRT and ZIP currently built in-memory and streamed — must also write to Supabase Storage at job completion
- No breaking change to `/api/download/[id]` (backward compatible fallback)

---

## 9. Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Auth friction drops conversion | Medium | Show value first; don't gate blog/SEO pages |
| Supabase Storage costs grow | Low | 90-day retention limit for free users; compress ZIPs |
| Stripe webhook delivery failure | Low | Idempotent webhook handler; use Stripe's retry |
| Users share accounts to avoid limit | Low | Per-account, not per-IP — acceptable tradeoff |
| File re-download after account deletion | Low | Soft-delete jobs; retain 30 days post-deletion |

---

## 10. Success Criteria

- [ ] Users can sign up, verify email, and log in
- [ ] Anonymous uploads are blocked (redirect to signup)
- [ ] Free users are limited to 3 uploads/month with visible counter
- [ ] Stripe checkout completes and premium is activated via webhook
- [ ] Premium users have unlimited uploads
- [ ] Job history lists all past jobs with re-download working
- [ ] Each track in results has a working Discogs search link
- [ ] Billing portal allows users to cancel

---

## 11. Implementation Order (Recommended)

### Phase A — Foundation (Auth + DB)
1. Create Supabase project, configure env vars
2. Set up `profiles`, `jobs`, `usage` tables with RLS policies
3. Add Supabase client to Next.js (`@supabase/ssr`)
4. Build `/login` and `/signup` pages
5. Auth middleware (protect `/account`, `/history`)
6. Update `PageShell` nav for auth state

### Phase B — Usage Limits
7. Modify `/api/upload` to check auth + usage count
8. Increment usage on successful job start
9. Add `UsageBanner` component
10. Add limit-reached modal with upgrade CTA

### Phase C — Stripe
11. Stripe product + price setup
12. `/api/stripe/checkout` endpoint
13. `/api/stripe/webhook` endpoint (activate premium)
14. `/api/stripe/portal` endpoint
15. `/account` page with plan status + manage billing

### Phase D — History + Re-downloads
16. Save job results to `jobs` table at completion
17. Save SRT + ZIP to Supabase Storage at completion
18. `/api/jobs` endpoint
19. `/history` and `/history/[id]` pages

### Phase E — Discogs Links
20. Add Discogs search URL generator to `TrackList`
21. "Find on Discogs" button on each track card
