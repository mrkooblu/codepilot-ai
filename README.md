# CodePilot AI

Screenshot in. Code out. Drop a screenshot, pick your framework (HTML/Tailwind, React, Vue, or Plain HTML/CSS), and get production-ready code in seconds. Powered by Kimi K2.5 with Claude Sonnet 4 fallback. Free tier gets 3 generations/day; Pro ($19/mo) gets unlimited.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 + React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Auth | Clerk |
| Database | Supabase (PostgreSQL + RLS) |
| File Storage | Cloudflare R2 |
| Payments | Stripe |
| AI Primary | Kimi K2.5 (Moonshot API) |
| AI Fallback | Claude Sonnet 4 (Anthropic) |
| Rate Limiting | Upstash Redis |
| Analytics | PostHog |
| Error Tracking | Sentry |
| Uptime | Better Stack |
| Hosting | Vercel |
| Code Editor | Monaco Editor |
| State | Zustand (client) + TanStack Query (server) |

## Prerequisites

- **Node.js 22+** — [Download](https://nodejs.org/)
- **pnpm** — `npm install -g pnpm`
- Accounts on: Moonshot AI, Supabase, Clerk, Cloudflare, Stripe, Upstash, PostHog, Sentry, Better Stack

## Account Setup Checklist

### 1. Moonshot AI (Kimi K2.5)
- [ ] Sign up at [platform.moonshot.ai](https://platform.moonshot.ai)
- [ ] Create an API key
- [ ] Copy the key to `MOONSHOT_API_KEY`

### 2. Anthropic (Fallback)
- [ ] Sign up at [console.anthropic.com](https://console.anthropic.com)
- [ ] Create an API key
- [ ] Copy the key to `ANTHROPIC_API_KEY`

### 3. Supabase
- [ ] Create a new project at [supabase.com](https://supabase.com)
- [ ] Go to Settings > API to get your project URL and anon key
- [ ] Go to Settings > API > Service Role to get the service role key
- [ ] Run all migrations from `supabase/migrations/` in the SQL Editor (see Database Setup below)
- [ ] Copy values to `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

### 4. Clerk
- [ ] Create an app at [clerk.com](https://clerk.com)
- [ ] Get Publishable Key and Secret Key from API Keys page
- [ ] Set up a webhook endpoint pointing to `https://your-domain.com/api/webhooks/clerk`
  - Subscribe to events: `user.created`, `user.updated`, `user.deleted`
  - Copy the webhook signing secret
- [ ] Copy values to `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`

### 5. Cloudflare R2
- [ ] Sign up at [cloudflare.com](https://cloudflare.com) and go to R2
- [ ] Create a bucket named `codepilot-uploads`
- [ ] Create an API token with R2 read/write permissions
- [ ] Copy values to `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`
- [ ] Set `R2_BUCKET_NAME=codepilot-uploads`

### 6. Stripe
- [ ] Create an account at [stripe.com](https://stripe.com)
- [ ] Create two products:
  - **Pro Monthly** — $19/month recurring
  - **Pro Annual** — $190/year recurring (V1.5)
- [ ] Copy the Price IDs to `STRIPE_PRO_PRICE_ID` and `STRIPE_ANNUAL_PRICE_ID`
- [ ] Get API keys from Developers > API Keys
- [ ] Set up a webhook endpoint pointing to `https://your-domain.com/api/webhooks/stripe`
  - Subscribe to events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
  - Copy the webhook signing secret
- [ ] Copy values to `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`

### 7. Upstash
- [ ] Create a Redis database at [upstash.com](https://upstash.com)
- [ ] Copy REST URL and token from the database details page
- [ ] Copy values to `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

### 8. PostHog
- [ ] Create a project at [posthog.com](https://posthog.com)
- [ ] Get your project API key from Settings
- [ ] Copy to `NEXT_PUBLIC_POSTHOG_KEY`
- [ ] Set `NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com`

### 9. Sentry
- [ ] Create a Next.js project at [sentry.io](https://sentry.io)
- [ ] Get your DSN from Project Settings > Client Keys
- [ ] Copy to `SENTRY_DSN`

### 10. Better Stack
- [ ] Create an account at [betterstack.com](https://betterstack.com)
- [ ] Add an uptime monitor for `https://your-domain.com/api/health`
- [ ] Set check interval to 3 minutes
- [ ] Configure alert channels (email, Slack, etc.)

## Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|------------|
| `MOONSHOT_API_KEY` | Kimi K2.5 API key from Moonshot |
| `ANTHROPIC_API_KEY` | Claude Sonnet 4 fallback key |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (public) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (public) |
| `CLERK_SECRET_KEY` | Clerk secret key (server-only) |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook signing secret |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 access key |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 secret key |
| `R2_BUCKET_NAME` | R2 bucket name (`codepilot-uploads`) |
| `R2_ENDPOINT` | R2 S3-compatible endpoint URL |
| `STRIPE_SECRET_KEY` | Stripe secret key (server-only) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (public) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRO_PRICE_ID` | Stripe Price ID for $19/mo Pro |
| `STRIPE_ANNUAL_PRICE_ID` | Stripe Price ID for $190/year annual |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST auth token |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project API key (public) |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog ingest endpoint |
| `SENTRY_DSN` | Sentry error tracking DSN |

## Running Locally

```bash
# Install dependencies
pnpm install

# Copy env template and fill in values
cp .env.example .env.local

# Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database Setup

Run migrations in order in the Supabase SQL Editor (Dashboard > SQL Editor > New Query):

1. **001_initial_schema.sql** — MVP tables (users, generations, usage_daily) + RLS policies. Run this first.
2. **002_v15_collections.sql** — Collections and tags. Run when building V1.5 features.
3. **003_v2_templates.sql** — Templates and URL-to-code jobs. Run when building V2 features.
4. **004_v3_api_keys.sql** — API keys for developer access. Run when building V3 features.

For MVP, you only need to run `001_initial_schema.sql`. The rest are future migrations with schemas defined upfront for planning purposes.

```
supabase/migrations/
  001_initial_schema.sql      <-- Run now (MVP)
  002_v15_collections.sql     <-- Run later (V1.5)
  003_v2_templates.sql        <-- Run later (V2)
  004_v3_api_keys.sql         <-- Run later (V3)
```

## Deployment

1. Connect your GitHub repo to [Vercel](https://vercel.com)
2. Add all environment variables from `.env.example` to Vercel project settings
3. Set the framework preset to "Next.js"
4. Push to `main` to trigger production deployment
5. Any branch push creates a preview deployment with a unique URL

CI runs automatically via GitHub Actions on every push and PR (lint + type-check).

## Project Structure

```
codepilot-site/
  .github/workflows/       # CI/CD (GitHub Actions)
  public/                   # Static assets
  src/
    app/
      (app)/                # Main app pages (authenticated)
        history/            # Generation history page
      (auth)/               # Auth pages (Clerk)
        sign-in/            # Sign-in page
        sign-up/            # Sign-up page
      api/                  # API routes
        generate/           # Screenshot-to-code generation (SSE)
        generations/        # CRUD for past generations
        health/             # Health check endpoint
        stripe/             # Stripe checkout session
        usage/              # Usage stats
        webhooks/           # Clerk + Stripe webhooks
      pricing/              # Pricing page
      layout.tsx            # Root layout
      page.tsx              # Landing page / main generation UI
    components/
      editor/               # Monaco code editor
      generation/           # Generation UI (framework selector, export, rating)
      preview/              # Sandboxed iframe preview
      ui/                   # Shared UI components (Button, Card, Badge)
      upload/               # Image upload (drag-and-drop)
    lib/
      ai/                   # AI pipeline (Kimi client, prompts, cache, image processing)
      db/                   # Supabase clients (browser + server)
      store.ts              # Zustand client state
  supabase/
    migrations/             # SQL migrations (001-004)
  .env.example              # Environment variable template
  package.json
  tsconfig.json
  tailwind.config.ts
```

## Sprint Plan

This project follows a 4-week MVP sprint plan. See the full technical blueprint for details:

- **Week 1:** Core pipeline (upload -> generate -> display)
- **Week 2:** Auth + multi-framework + basic UX
- **Week 3:** Payments + iteration + history
- **Week 4:** Landing page + launch prep + monitoring

Reference: `technical-blueprint-v2.md`, Section 11.
