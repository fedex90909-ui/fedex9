# FeedEx — Shipping, Logistics & Tracking

A polished, production-style logistics platform demo: book shipments, choose
delivery speeds, check out with card or bank transfer, and follow every parcel
on a live tracking timeline — with full customer accounts and a role-protected
admin panel for processing shipments and payments.

> **Demo notice** — this is a demonstration project and is not affiliated with
> or endorsed by FedEx Corporation. No real shipments are booked and no real
> payments are processed.

## Requirements

- **Node.js 20+** (Node 24 tested)
- **npm 10+**

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Open the printed local URL (default `http://localhost:5173`).

## Production build

```bash
npm run build     # outputs to dist/
npm run preview   # serve the production build locally
```

## Environment setup

1. Copy `.env.example` to `.env` for local development:
   ```bash
   cp .env.example .env
   ```
2. Set `VITE_ADMIN_EMAIL` to the email that should receive the **admin** role
   when it registers or signs in (comma-separated for multiple admins).
3. `.env` is git-ignored — never commit real secrets. In production, enter
   environment variables through **Netlify → Site configuration → Environment
   variables**. Placeholders are documented for the future database
   (`DATABASE_URL`), auth secret (`AUTH_SECRET`) and payment provider keys.

## Demo walkthrough

1. **Sign up** (top-right → Sign In → Create an account). You're signed in
   automatically and land on your dashboard.
2. **Ship**: complete the 4-step wizard, pick a delivery speed, then check out
   with the card form or bank transfer (reference + optional receipt upload).
   Payments are recorded with status **Pending**.
3. **My Shipments**: every booking appears with live status; click through to
   the tracking timeline.
4. **Admin**: register/sign in with the `VITE_ADMIN_EMAIL` address to get the
   Admin Panel — dashboard stats & charts, shipment processing (status,
   location, notes → instantly reflected on the public tracking page), payment
   review (Pending → Processing → Paid…), user management and role changes.
5. **Track**: try a demo tracking number, e.g. `794658912345`.

## Architecture

```
src/
├── components/    Reusable UI (header, footer, timeline, forms, badges, charts)
├── context/       React contexts (auth session, booking draft, toasts)
├── hooks/         Shared hooks (useAuth)
├── layouts/       Account + Admin panel layouts
├── lib/           Pure logic: pricing, tracking view-models, validation, config
├── pages/         Route pages (public, auth, account, admin)
├── services/      Data layer — the swap-in point for a real backend
└── types/         Shared model types
netlify/functions/ Serverless seam for the Phase-3 backend (see its README)
```

Key design decisions:

- **Service layer** (`src/services/`) owns all data access and enforces
  session/role checks (customers read only their own records; admin reads
  require the admin role) — swap it for REST calls without touching UI.
- **Passwords** are hashed with PBKDF2-SHA256 (120k iterations) via WebCrypto;
  never stored or logged in plaintext.
- **Card data (demo only):** the full card details entered at checkout —
  cardholder, number, CVV, expiry and billing address — are stored with the
  payment record and shown in the admin panel so orders can be processed. This
  is intentionally for the demo workflow only: before any real or public
  deployment, replace the demo card flow with a real payment gateway
  (Stripe/Adyen) — production systems must never store the full PAN or CVV.
- **Pricing and tracking lookups** are pure functions in `src/lib/`, ready to
  be pointed at real pricing/tracking APIs.

## Deployment (GitHub → Netlify)

1. Push this repository to GitHub (the `.env` file is ignored automatically;
   only `.env.example` is committed).
2. In Netlify: **Add new site → Import an existing project** and pick the repo.
3. Netlify reads `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - SPA redirect `/* → /index.html` so `/track`, `/ship`, `/account`, `/admin`
     all resolve on hard refresh.
4. Add your environment variables (at minimum `VITE_ADMIN_EMAIL`) under
   **Site configuration → Environment variables**, then deploy.

## Scripts

| Command             | Purpose                       |
| ------------------- | ----------------------------- |
| `npm run dev`       | Start the dev server          |
| `npm run build`     | Production build to `dist/`   |
| `npm run preview`   | Preview the production build  |
| `npm run typecheck` | Strict TypeScript check       |
