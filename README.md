# Resumark — AI Resume Reviewer

A simple, brutally honest AI-powered resume reviewer. Upload a PDF or paste text, get a score, issues, and line-by-line rewrites in 30 seconds.

**Stack:** React + Vite, Supabase (auth + DB), Stripe (payments), Claude API (analysis), Vercel (hosting).

---

## Setup Guide

### 1. Supabase (auth + database)

1. Go to [supabase.com](https://supabase.com) and create a new project (free tier is fine).
2. Go to **SQL Editor** and paste the contents of `supabase/migrations/001_init.sql`. Run it.
3. Go to **Authentication > Providers > Google** and enable it:
   - You'll need a Google OAuth client ID. Follow [Supabase's guide](https://supabase.com/docs/guides/auth/social-login/auth-google).
   - Set the redirect URL to `https://your-vercel-domain.vercel.app` (update after deploying).
4. Copy your **Project URL** and **anon public key** from **Settings > API**.

### 2. Stripe (payments)

1. Create a [Stripe account](https://stripe.com) (or use test mode).
2. Create a **Product** in the Stripe dashboard:
   - Name: "Resumark Pro"
   - Price: €1.00/month, recurring
3. Copy the **Price ID** (starts with `price_`).
4. Go to **Developers > API Keys** and copy the **Secret key** (starts with `sk_test_` or `sk_live_`).
5. Set up the **Webhook** (do this after deploying to Vercel):
   - Endpoint URL: `https://your-domain.vercel.app/api/webhook`
   - Events to listen for:
     - `checkout.session.completed`
     - `invoice.paid`
     - `customer.subscription.deleted`
     - `customer.subscription.updated`
   - Copy the **Webhook signing secret** (starts with `whsec_`).

### 3. Claude API

1. Go to [console.anthropic.com](https://console.anthropic.com) and get an API key.
2. Add some credits ($5 is enough for hundreds of reviews).

### 4. Deploy to Vercel

1. Push this project to a GitHub repo.
2. Go to [vercel.com](https://vercel.com), import the repo.
3. In Vercel project settings, add these **Environment Variables**:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  (from Supabase Settings > API > service_role)
ANTHROPIC_API_KEY=sk-ant-...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PRICE_ID=price_...
```

4. Deploy. Vercel will build and host it automatically.
5. Update your Supabase Google OAuth redirect URL with the Vercel domain.
6. Update your Stripe webhook endpoint URL with the Vercel domain.

### 5. Custom domain (optional)

1. Buy a domain (Namecheap, Cloudflare, etc.)
2. In Vercel: Settings > Domains > Add your domain
3. Update DNS records as Vercel instructs

---

## Local development

```bash
cp .env.example .env    # Fill in your keys
npm install
npm run dev             # http://localhost:3000
```

Note: The `/api/*` routes won't work locally without `vercel dev`. Install the Vercel CLI:

```bash
npm i -g vercel
vercel dev              # Runs everything including serverless functions
```

---

## Project structure

```
resumark/
├── api/                    # Vercel serverless functions (backend)
│   ├── review.js           # Proxies resume to Claude API
│   ├── create-checkout.js  # Creates Stripe checkout session
│   └── webhook.js          # Handles Stripe subscription events
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Header.jsx
│   │   ├── IssueCard.jsx
│   │   ├── PaywallModal.jsx
│   │   ├── ScoreRing.jsx
│   │   └── SuggestionLine.jsx
│   ├── lib/
│   │   └── supabase.js     # Supabase client
│   ├── pages/
│   │   ├── Landing.jsx     # Marketing landing page
│   │   └── Reviewer.jsx    # Main review interface
│   ├── styles/
│   │   └── global.css      # Global styles + CSS variables
│   ├── App.jsx             # Auth context + routing
│   └── main.jsx            # Entry point
├── supabase/
│   └── migrations/
│       └── 001_init.sql    # Database schema
├── .env.example
├── vercel.json
├── package.json
└── README.md
```

---

## Cost breakdown

| Item | Cost |
|------|------|
| Vercel hosting | Free (hobby tier) |
| Supabase | Free (up to 50k MAU) |
| Claude API | ~€0.01-0.03 per review |
| Stripe | 2.9% + €0.25 per transaction |
| Domain | ~€10/year |

At €1/month per subscriber with ~€0.03 API cost per review, you're profitable from subscriber #1.
