# PayEasy web app (marketplace + portals)

Next.js (App Router) + TypeScript + Tailwind CSS v4. This repo hosts the **employee marketplace** (`src/app/(public)`) and **merchant**, **employer**, and **ops** portals under path prefixes for local development.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` for the marketplace. Portals:

- Merchant: `http://localhost:3000/merchant/login`
- Employer: `http://localhost:3000/employer/login`
- Ops: `http://localhost:3000/ops/login`

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_PAYEASY_API_URL` (or `NEXT_PUBLIC_API_BASE_URL`) to your Laravel API base including `/api`.

### Production subdomains

Set `NEXT_PUBLIC_USE_SUBDOMAIN_PORTALS=true` when each portal is on its own host, and configure `MERCHANT_PORTAL_HOST`, `EMPLOYER_PORTAL_HOST`, and `OPS_PORTAL_HOST` in the deployment environment so `next.config.ts` rewrites map each hostname to `/merchant`, `/employer`, or `/ops`. Optionally set `NEXT_PUBLIC_MERCHANT_SITE_ORIGIN` if the marketplace and merchant app use different origins for footer links.

## Deploy on Vercel

- Framework preset: Next.js (auto).
- Set environment variables from `.env.example` as needed.

## Where the data comes from

The public shop reads the PayEasy API catalogue (`NEXT_PUBLIC_PAYEASY_API_URL`, default `http://127.0.0.1:8000/api`). Products, categories, prices, and images are served from the API (seeded in `api.payeasy` via `FirstMerchantCatalogueSeeder` and optional Tech N Sync image sync).

## Code map (for juniors)

| Path | Role |
|------|------|
| `src/app/(public)/page.tsx` | Home: hero, deals strip, category tiles, featured grid |
| `src/app/(public)/catalog/page.tsx` | Full catalogue + `?q=&min=&max=` filters |
| `src/app/(public)/catalog/[category]/page.tsx` | One category + same filter query params |
| `src/app/(public)/product/[id]/page.tsx` | Product detail + tenure price table |
| `src/app/(merchant)/merchant/...` | Merchant onboarding & dashboard |
| `src/app/(employer)/employer/...` | Employer workspace |
| `src/app/(ops)/ops/...` | Operations portal |
| `src/lib/catalog.ts` | Fetches catalogue from API, category helpers, filter logic |
| `src/lib/catalog-api.ts` | API client + response mapping for storefront products |
| `src/lib/slug.ts` | Category slug rules (must match URL segments) |
| `src/components/SiteHeader.tsx` | Top layout: Martfury-style mega menu + search |

Styling tokens live in `src/app/globals.css` and follow the PayEasy-aligned design system (petrol green, gold accent, stone background).
