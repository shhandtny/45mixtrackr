# Design: Freemium User Accounts + Discogs Integration

**Feature**: freemium  
**Date**: 2026-04-20  
**Phase**: Design  
**Architecture**: Option C — Pragmatic Balance  
**Status**: Draft

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

## 1. Overview

**Architecture Decision**: Option C — Pragmatic Balance

Keep the existing in-memory `job-store.ts` unchanged (it handles active job processing reliably). Add a Supabase persistence layer that saves job results + files to the DB/Storage when a job completes. Auth is enforced via Next.js middleware. New pages (`/login`, `/signup`, `/account`, `/history`) use server components for auth state.

**Key principle**: The in-memory job store is the source of truth for *active* jobs. Supabase DB is the source of truth for *completed* jobs.

---

## 2. File Structure

### New files
```
lib/supabase/
  client.ts          — Browser-side Supabase client (for client components)
  server.ts          — Server-side Supabase client (for server components + API routes)
lib/
  usage.ts           — Usage check + increment helpers (3/month limit)
  billing.ts         — Stripe checkout, portal, webhook helpers
middleware.ts        — Auth guard for protected routes

app/
  login/page.tsx     — Sign in form
  signup/page.tsx    — Sign up form
  account/page.tsx   — Plan status + billing + usage counter
  history/page.tsx   — Job history list
  history/[id]/page.tsx — Past result view

app/api/
  auth/callback/route.ts    — Supabase OAuth callback
  stripe/checkout/route.ts  — Create Checkout session
  stripe/portal/route.ts    — Create billing portal session
  stripe/webhook/route.ts   — Handle Stripe events

components/
  UsageBanner.tsx    — "X of 3 uses remaining this month" bar
  AuthModal.tsx      — Sign-up prompt for anonymous users
  UpgradeModal.tsx   — Limit-reached upgrade prompt
```

### Modified files
```
middleware.ts (new)              — Protect /account, /history
app/api/upload/route.ts          — Add auth check + usage enforcement
app/api/download/[id]/route.ts   — Save files to Supabase Storage on completion
components/PageShell.tsx         — Nav: show Login/Signup or Account/History
components/UploadZone.tsx        — Show UsageBanner + AuthModal
components/TrackList.tsx         — Add Discogs link to each track card
```

---

## 3. Database Schema (Supabase PostgreSQL)

### SQL: profiles
```sql
create table profiles (
  id                     uuid primary key references auth.users(id) on delete cascade,
  email                  text not null,
  plan                   text not null default 'free' check (plan in ('free', 'premium')),
  stripe_customer_id     text,
  stripe_subscription_id text,
  subscription_status    text,
  created_at             timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- RLS
alter table profiles enable row level security;
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);
```

### SQL: jobs
```sql
create table jobs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles(id) on delete cascade,
  file_name    text not null,
  status       text not null default 'done' check (status in ('done', 'failed')),
  track_count  int default 0,
  result_json  jsonb,
  srt_path     text,
  zip_path     text,
  created_at   timestamptz default now(),
  expires_at   timestamptz
);

-- RLS
alter table jobs enable row level security;
create policy "Users can view own jobs"
  on jobs for select using (auth.uid() = user_id);
create policy "Service role can insert jobs"
  on jobs for insert with check (true);
```

### SQL: usage
```sql
create table usage (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  month      text not null,  -- format: '2026-04'
  count      int not null default 0,
  unique(user_id, month)
);

-- RLS
alter table usage enable row level security;
create policy "Users can view own usage"
  on usage for select using (auth.uid() = user_id);
```

---

## 4. API Contracts

### POST /api/upload (modified)
**Auth required**: Yes (401 if not logged in)  
**Usage check**: Yes (403 with `{ error: 'limit_reached', usedCount: 3, limit: 3 }` if over limit)

```typescript
// Added logic at top of handler (before existing file write):
const supabase = createServerClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: 'auth_required' }, { status: 401 })

const allowed = await checkAndIncrementUsage(user.id)
if (!allowed) return NextResponse.json({ error: 'limit_reached' }, { status: 403 })

// ... existing job creation logic unchanged
// Store userId on job for later persistence
const job = createJob(jobId, inputPath, workDir, user.id)
```

### GET /api/jobs (new)
**Auth required**: Yes  
**Response**:
```json
{
  "jobs": [
    {
      "id": "uuid",
      "fileName": "mix.mp3",
      "trackCount": 24,
      "createdAt": "2026-04-20T10:00:00Z",
      "status": "done"
    }
  ]
}
```

### POST /api/stripe/checkout (new)
**Auth required**: Yes  
**Request**: `{ priceId: string }`  
**Response**: `{ url: string }` — Stripe Checkout redirect URL

### POST /api/stripe/portal (new)
**Auth required**: Yes  
**Response**: `{ url: string }` — Stripe billing portal URL

### POST /api/stripe/webhook (new)
**Auth required**: No (verified via Stripe-Signature header)  
**Handles events**:
- `customer.subscription.created` → set plan = 'premium'
- `customer.subscription.updated` → update subscription_status
- `customer.subscription.deleted` → set plan = 'free'
- `invoice.payment_failed` → log, grace period (3 days via subscription status)

### GET /api/auth/callback (new)
**Auth required**: No  
Exchanges Supabase auth code for session, redirects to `/`.

---

## 5. Key Modules

### lib/supabase/server.ts
```typescript
import { createServerClient as _createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createServerClient() {
  const cookieStore = cookies()
  return _createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: ... } }
  )
}
```

### lib/supabase/client.ts
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### lib/usage.ts
```typescript
const FREE_LIMIT = 3

export async function checkAndIncrementUsage(userId: string): Promise<boolean> {
  const supabase = createServiceClient() // service role key
  const month = new Date().toISOString().slice(0, 7) // '2026-04'

  // Check plan first — premium users always allowed
  const { data: profile } = await supabase
    .from('profiles').select('plan').eq('id', userId).single()
  if (profile?.plan === 'premium') return true

  // Upsert usage row and check count
  const { data } = await supabase.rpc('increment_usage', { p_user_id: userId, p_month: month })
  return data <= FREE_LIMIT
}
```

### lib/billing.ts
```typescript
export async function createCheckoutSession(userId: string, email: string) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  return stripe.checkout.sessions.create({
    customer_email: email,
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    mode: 'subscription',
    success_url: `${baseUrl}/account?upgraded=1`,
    cancel_url: `${baseUrl}/account`,
    metadata: { userId },
  })
}

export async function createPortalSession(stripeCustomerId: string) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  return stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${baseUrl}/account`,
  })
}
```

### Persistence hook in recognition-pipeline.ts
```typescript
// After job completes (all segments processed):
if (job.userId) {
  await persistJobToSupabase(job) // saves result_json, uploads SRT/ZIP to Storage
}
```

---

## 6. Middleware

### middleware.ts
```typescript
import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED = ['/account', '/history']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PROTECTED.some(p => pathname.startsWith(p))) {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = { matcher: ['/account/:path*', '/history/:path*'] }
```

---

## 7. UI Components

### UsageBanner
```
┌─────────────────────────────────────────────────────┐
│  2 of 3 free identifications used this month        │
│  [████████░░] Upgrade for unlimited →               │
└─────────────────────────────────────────────────────┘
```
- Shown below upload zone for free users
- Hidden for premium users
- "Upgrade" link opens Stripe Checkout

### AuthModal (shown to anonymous users on upload attempt)
```
┌─────────────────────────────────────────────────────┐
│  Create a free account to identify your mix         │
│                                                     │
│  3 free identifications per month                  │
│  Full tracklist with album covers                  │
│  Re-download files anytime                         │
│                                                     │
│  [Sign up free]     [Sign in]                       │
└─────────────────────────────────────────────────────┘
```

### UpgradeModal (shown when limit reached)
```
┌─────────────────────────────────────────────────────┐
│  You've used all 3 free identifications this month  │
│                                                     │
│  Upgrade to Premium                                 │
│  • Unlimited identifications                        │
│  • Permanent history                                │
│  • $4.99/month                                     │
│                                                     │
│  [Upgrade Now]     [Maybe later]                    │
└─────────────────────────────────────────────────────┘
```

### Discogs button on TrackList
```
┌────────────────────────────────────────────┐
│ [Cover] Track Title                        │
│         Artist Name • Album Name           │
│         [↓ SRT] [↓ ZIP]  [Find on Discogs ↗] │
└────────────────────────────────────────────┘
```

### /history page
```
Past Identifications

[Mix 1.mp3]       Apr 20, 2026 • 24 tracks   [View] [↓]
[vinyl-set.wav]   Apr 18, 2026 • 31 tracks   [View] [↓]
[dj-set.mp4]      Apr 15, 2026 • 18 tracks   [View] [↓]

Free plan: History kept for 90 days
```

---

## 8. Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # server-only, never exposed to client

# Stripe
STRIPE_SECRET_KEY=           # server-only
STRIPE_PUBLISHABLE_KEY=      # client-safe
STRIPE_WEBHOOK_SECRET=       # for webhook signature verification
STRIPE_PRICE_ID=             # monthly subscription price ID

# Existing
ACR_HOST=
ACR_ACCESS_KEY=
ACR_ACCESS_SECRET=
OPENAI_API_KEY=
```

---

## 9. Security Considerations

- **RLS policies** on all Supabase tables — users can only see their own data
- **Service role key** only used server-side (never in client components or `NEXT_PUBLIC_`)
- **Stripe webhook** verified with `stripe.webhooks.constructEvent()` signature check
- **Usage increment** is atomic via Postgres function `increment_usage` (prevents race condition)
- **Anonymous users** see no upload prompt — reduces abuse surface

---

## 10. Dependencies to Install

```bash
npm install @supabase/ssr @supabase/supabase-js stripe
```

---

## 11. Implementation Guide

### 11.1 Module Map

| Module | Key Files | Complexity |
|---|---|---|
| M1 — Supabase Setup | `lib/supabase/`, `.env.local`, DB migrations | Low |
| M2 — Auth Pages | `app/login/`, `app/signup/`, `middleware.ts` | Low |
| M3 — Usage Limits | `lib/usage.ts`, `/api/upload` (modify), `UsageBanner` | Medium |
| M4 — Stripe Billing | `lib/billing.ts`, `/api/stripe/*`, `app/account/` | Medium |
| M5 — Job Persistence | `lib/job-persist.ts`, modify `recognition-pipeline.ts`, `/api/download` | Medium |
| M6 — History Pages | `app/history/`, `/api/jobs` | Low |
| M7 — Discogs Links | `components/TrackList.tsx` | Low |

### 11.2 Dependencies Between Modules

```
M1 (Supabase) ──→ M2 (Auth) ──→ M3 (Usage) ──→ M4 (Stripe)
                              └──→ M5 (Persist) ──→ M6 (History)
M2 ──→ M7 (Discogs) [independent, can do last]
```

### 11.3 Session Guide

**Recommended implementation sessions:**

| Session | Modules | Goal | Est. Time |
|---|---|---|---|
| Session 1 | M1 + M2 | Supabase connected, login/signup working | 2h |
| Session 2 | M3 | Upload blocked for anon, usage counter shown | 1.5h |
| Session 3 | M4 | Stripe checkout + webhook + account page | 2h |
| Session 4 | M5 + M6 | Jobs saved, history page shows re-downloads | 2h |
| Session 5 | M7 + polish | Discogs links, nav updates, edge cases | 1h |

**Invoke per session:**
```
/pdca do freemium --scope M1,M2
/pdca do freemium --scope M3
/pdca do freemium --scope M4
/pdca do freemium --scope M5,M6
/pdca do freemium --scope M7
```
