# PayEasy web marketplace (static preview)

Next.js (App Router) + TypeScript + Tailwind CSS v4. This is a **static marketing / catalogue** slice: categories, grid, product detail, search, and sidebar filters — no cart, no accounts, no API calls.

## Run locally

```bash
cd web-frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploy on Vercel

- Set the Vercel project **Root Directory** to `web-frontend`.
- Framework preset: Next.js (auto).
- No environment variables are required for the static catalogue.

## Where the data comes from

1. **Pricing** — sheet **“PayEasy Pricing”** in `PayEasy_Product_Pricing_Updated_Calculation.xlsx` (repo root). Only **client-safe** columns are exported: product name, category, and 3–6 month **selling** prices. Cost price and fee percentages never go into `src/data/products.json`.

2. **Photos** — embedded images from the source catalogue PDF. The generator copies them into `public/products/` and wires `image` paths in the JSON.

### Regenerate JSON + images

Prerequisites:

- Python 3 with working `xml.etree` (macOS `/usr/bin/python3` is reliable).
- Poppler (`pdfimages`): `brew install poppler`

Catalogue PDF path (no supplier branding in this repo’s source code):

- Preferred file at repo root: `payeasy-source-catalogue.pdf` (can be a symlink to your latest export), **or**
- `PAYEASY_CATALOGUE_PDF=/absolute/path/to/file.pdf`

Then:

```bash
cd web-frontend
npm run generate:catalog
git add src/data/products.json public/products
```

Commit the updated JSON and PNGs so Vercel and teammates do not need Poppler for a normal `npm run build`.

## Code map (for juniors)

| Path | Role |
|------|------|
| `src/app/page.tsx` | Home: hero, deals strip, category tiles, featured grid |
| `src/app/catalog/page.tsx` | Full catalogue + `?q=&min=&max=` filters |
| `src/app/catalog/[category]/page.tsx` | One category + same filter query params |
| `src/app/product/[id]/page.tsx` | Product detail + tenure price table |
| `src/lib/catalog.ts` | Loads `products.json`, category helpers, filter logic |
| `src/lib/slug.ts` | Category slug rules (must match URL segments) |
| `src/components/SiteHeader.tsx` | Top layout: Martfury-style mega menu + search |
| `scripts/generate-catalog-data.py` | Excel + PDF → JSON + `public/products` |

Styling tokens live in `src/app/globals.css` and follow the PayEasy-aligned design system (petrol green, gold accent, stone background).
