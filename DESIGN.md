# PayEasy Web Frontend — Design System

This document describes the **implemented** design language in `web-frontend`. Tokens live in `src/app/globals.css`; components apply them via Tailwind arbitrary values (`text-[color:var(--color-primary)]`).

**Canonical brand spec:** `payeasy-aligned-design-system (1).md` at the monorepo root. This file records what the storefront actually ships today, including intentional deviations.

---

## 1. Visual theme

PayEasy should feel **premium, calm, and financially trustworthy** — a corporate-grade BNPL marketplace, not a loud consumer loan app. Surfaces are warm stone and white; brand green anchors trust; gold accents signal premium CTAs and key financial figures.

| Trait | Implementation |
|-------|----------------|
| Trust & structure | Deep petrol green headers, credit snapshot strip, eligibility badges |
| Marketplace polish | Product cards, hero carousel, category rail (Motta-style sidebar on desktop) |
| Payroll transparency | Monthly instalment pricing, salary-aware filtering, deduction-cap copy |
| Mobile-first | Fixed bottom tab bar, icon+label header utilities, safe-area padding |

---

## 2. Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router), React 19 |
| Styling | Tailwind CSS v4 (`@import "tailwindcss"`) |
| Tokens | CSS custom properties on `:root` |
| Font | [Outfit](https://fonts.google.com/specimen/Outfit) via `next/font/google` — single family for UI and headings |
| Icons | Inline SVG in `src/components/marketplace/icons.tsx`, `icons/pack.tsx`, `icons/categoryPack.tsx` |

**Spec note:** The aligned design system specifies **Manrope** (headings) + **Inter** (body). The storefront currently uses **Outfit** for both via `--font-outfit` / `--font-heading`.

---

## 3. Color tokens

Defined in `src/app/globals.css`.

### Brand

| Token | Hex | Role |
|-------|-----|------|
| `--color-primary` | `#0F3D3E` | Primary brand, trusted surfaces, primary buttons on light BG |
| `--color-primary-hover` | `#0B3031` | Primary hover |
| `--color-primary-active` | `#082829` | Primary pressed |
| `--color-accent` | `#D9A441` | Gold CTA, credit limit display, sign-in submit on forms |
| `--color-accent-hover` | `#C89335` | Accent hover |
| `--color-accent-active` | `#B9842B` | Accent pressed |
| `--color-accent-dark` | `#9B6F1E` | Dark gold (warning alias) |

### Surfaces & text

| Token | Value | Role |
|-------|-------|------|
| `--color-app` | `#F5F3EF` | Page background (`body`, `main`) |
| `--color-muted-bg` | `#EDEAE3` | Secondary panels, search bar fill, hover states |
| `--color-surface` | `#FFFFFF` | Cards, forms, header/footer |
| `--color-foreground` | `#1B1F23` | Primary text |
| `--color-muted` | `rgba(27,31,35,0.62)` | Secondary text, placeholders |
| `--color-border` | `rgba(15,61,62,0.08)` | Light dividers |
| `--color-border-strong` | `rgba(15,61,62,0.18)` | Card borders, dashed empty states |
| `--color-input-border` | `rgba(15,61,62,0.18)` | Input outlines |
| `--color-focus` | `rgba(217,164,65,0.28)` | Focus rings on inputs |

### Status (BNPL / payroll)

| Token | Hex | UI meaning |
|-------|-----|------------|
| `--color-success` | `#2E7D5A` | Approved, eligible, verified |
| `--color-success-bg` | `rgba(46,125,90,0.10)` | Success tint backgrounds |
| `--color-warning` | `#9B6F1E` | Pending, tight fit, attention |
| `--color-warning-bg` | `rgba(217,164,65,0.12)` | Warning tint backgrounds |
| `--color-danger` | `#B85042` | Error, locked, overdue |
| `--color-danger-bg` | `rgba(184,80,66,0.10)` | Error tint backgrounds |

### Storefront aliases

| Token | Maps to | Usage |
|-------|---------|--------|
| `--color-sale` | danger | “Deal” product badge |
| `--color-hot` | accent-dark | Hot deals |
| `--color-stars` | accent | Star ratings |
| `--color-carousel-border` | border | Carousel control outline |
| `--color-carousel-btn` | muted-bg | Carousel button fill |
| `--color-hero-shell` | muted-bg | Hero fallback shell |

### Named palette (reference)

| Name | Hex |
|------|-----|
| Deep Petrol Green | `#0F3D3E` |
| Warm Gold Sand | `#D9A441` |
| Soft Stone | `#F5F3EF` |
| Charcoal | `#1B1F23` |
| Muted Green | `#2E7D5A` |
| Burnt Clay | `#B85042` |

### Logo accent dots (hard-coded)

`PayEasyLogo` uses four 10×10px squares (not CSS tokens): `#e53935`, `#43a047`, `#1e88e5`, `#fbc02d`.

---

## 4. Typography

### Family

```css
--font-sans: var(--font-outfit), ui-sans-serif, system-ui, sans-serif;
--font-heading: var(--font-outfit), ui-sans-serif, system-ui, sans-serif;
```

Apply heading font: `font-[family-name:var(--font-heading)]`.

### Scale (as implemented)

| Role | Classes | Example locations |
|------|---------|-------------------|
| Page eyebrow | `text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-muted)]` | Account, sign-in, wishlist |
| Page title | `text-3xl font-bold` (+ heading font), `sm:text-4xl` on marketing pages | `account/page`, `wishlist/page` |
| Section title | `text-xl font-bold md:text-2xl` + heading font | `SectionHeading` |
| Hero headline | `text-2xl font-extrabold sm:text-3xl md:text-4xl` + heading font | `HeroSpotlight` |
| Body | `text-sm` / `text-base`, `text-[color:var(--color-muted)]` for secondary | Forms, cards, footer |
| UI label | `text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]` | Form labels |
| Micro nav | `text-[10px]`–`text-[11px] font-semibold` | Bottom nav, header icon labels |
| Credit display | `text-2xl font-light` accent on primary strip | `FinancialSummaryStrip` |
| Product title | `text-sm font-semibold md:text-base` + heading font | `ProductCard` |
| Price | `text-base font-bold` | `ProductCard` |

### Principles

- **Extrabold headings** for brand moments (logo, hero, section titles).
- **Uppercase tracked labels** for section eyebrows, form legends, and metadata.
- **Light weight** only for large currency on the credit snapshot strip.
- Prefer `tracking-tight` on display headings; `tracking-[0.18em]`–`0.2em` on eyebrows.

---

## 5. Layout & spacing

| Pattern | Value |
|---------|-------|
| Max content width | `max-w-[1280px]` centered, `px-4 sm:px-6` |
| Main bottom padding (mobile) | `pb-[calc(4.5rem+env(safe-area-inset-bottom))]` — clears fixed bottom nav |
| Footer bottom padding (mobile) | Same safe-area offset |
| Sticky header | `z-40`, `bg-white/95 backdrop-blur` |
| Bottom nav | `z-40`, `md:hidden`, safe-area inset |
| Touch target minimum | `min-h-[44px] min-w-[44px]` on primary actions |

### Breakpoints (Tailwind defaults)

| Prefix | Width | Typical use |
|--------|-------|-------------|
| `sm` | 640px | Two-column forms, larger type |
| `md` | 768px | Desktop header grid, hide bottom nav, category sidebar |
| `lg` | 1024px | Header 3-column layout, footer grids |
| `xl` | 1280px | Header gap tuning |

---

## 6. Radius & elevation

| Element | Radius | Shadow |
|---------|--------|--------|
| Primary / accent CTAs | `rounded-full` | — |
| Secondary / outline CTAs | `rounded-full` or `rounded-xl` | — |
| Cards, forms | `rounded-2xl` | `shadow-sm` |
| Product cards, inputs | `rounded-xl` | `shadow-sm`; hover `shadow-md` + `-translate-y-0.5` |
| Dropdowns, mobile menu | `rounded-xl` | `shadow-lg` |
| Search bar | `rounded-full` | `shadow-inner` on track |
| Badges | `rounded-md` or `rounded-full` | optional `ring-1` |
| Pills / chips | `rounded-full` | `shadow-sm` on category chips |

---

## 7. Buttons

### Primary (green)

```
rounded-full bg-[color:var(--color-primary)] text-white
text-sm font-semibold
hover:bg-[color:var(--color-primary-hover)]
disabled:opacity-60
```

**Use:** Confirm actions, “See plans”, “Browse eligible”, sign-up final step, small pill CTAs.

### Accent (gold)

```
rounded-full bg-[color:var(--color-accent)] text-[color:var(--color-foreground)] OR text-white on dark surfaces
font-bold text-sm
hover:bg-[color:var(--color-accent-hover)]
```

**Use:** Sign-in submit, sign-up OTP step, salary “Check”, CTAs on primary strip.

### Secondary / ghost

```
rounded-full border border-[color:var(--color-border-strong)] bg-white
text-sm font-semibold text-[color:var(--color-foreground)]
hover:bg-[color:var(--color-muted-bg)]
```

**Use:** Sign-in “Create account” pair, outline actions on dark strip (`border-white/20`).

### On dark primary surface

```
rounded-xl bg-[color:var(--color-accent)] text-white  /* solid */
rounded-xl border border-white/20 … hover:bg-white/10  /* ghost */
```

**Use:** `FinancialSummaryStrip` actions.

### Icon / utility

```
rounded-lg px-1 py-1 hover:bg-[color:var(--color-muted-bg)]
min-w-[44px] flex-col items-center  /* header icons */
```

---

## 8. Forms & inputs

### Text field

```
w-full rounded-xl border border-[color:var(--color-input-border)] bg-white
px-4 py-3 text-[color:var(--color-foreground)]
outline-none ring-[color:var(--color-focus)] focus:ring-2
```

### Form container

```
rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 shadow-sm
space-y-5
```

### Labels

```
text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]
```

### Alerts

| Type | Classes |
|------|---------|
| Info / status | `rounded-xl border border-[color:var(--color-border-strong)] bg-white` |
| Error | `border-[color:var(--color-danger)]/25 bg-[color:var(--color-danger-bg)] text-[color:var(--color-danger)]` |

### Search (`SearchBar`)

- Outer: `rounded-full`, `bg-[color:var(--color-muted-bg)]`, `shadow-inner`
- Submit: circular white button with ring border
- Category `<select>`: borderless inside pill

### Salary input (on primary strip)

- `rounded-xl bg-white/10 ring-white/20`, gold focus ring
- `GHS` prefix label inside field

---

## 9. Navigation chrome

### Structure (`layout.tsx`)

1. `SiteTopBar` — promo / quick links (`border-b`, 11–13px type)
2. `SiteHeader` — sticky logo, search, account utilities
3. `main` — app background
4. `SiteFooter`
5. `BottomNav` — mobile only
6. `FixedChrome` — floating helpers

### Header grid (lg+)

Three columns: brand + mobile menu | search | utilities (`SalaryHintChip`, account, wishlist, orders, cart).

### Bottom nav (mobile)

Five tabs: Home, Shop, Eligibility, Orders, Account. Active: foreground; inactive: muted.

### Account menu

Dropdown: `w-52 rounded-xl border shadow-lg`. Destructive: `text-[color:var(--color-danger)]`.

---

## 10. Key components

| Component | Purpose |
|-----------|---------|
| `HomeHero` | Category rail + hero carousel + credit strip + mobile category chips |
| `HeroSpotlight` | Auto-rotating slides (7s), dot indicators, primary CTA |
| `FinancialSummaryStrip` | BNPL credit snapshot (anonymous form vs approved stats) |
| `ProductCard` | Grid/carousel product tile with eligibility badges |
| `SectionHeading` | Eyebrow + title + optional “View all” link |
| `EligibilityBanner` | Catalogue filter messaging (anonymous / match / no match) |
| `SearchBar` | Category-scoped catalog search |
| `HorizontalCarousel` | Scroll-snap product/deal rows with md+ arrow controls |
| `CategoryRail` | Desktop left sidebar category list |
| `PayEasyLogo` | Brand mark with four-color dots |

---

## 11. Eligibility & product states

Driven by `lib/eligibility.ts` — surfaced on cards and banners.

| Status | Badge | Card treatment |
|--------|-------|----------------|
| `approved` | Green “Eligible” | Full opacity |
| `pending` | Gold “Tight fit” | Full opacity, warning reason text |
| `locked` | Red “Locked” + lock overlay | `opacity-70`, danger reason |
| Deal | Red “Deal” | Independent of eligibility |

### Banner variants (`EligibilityBanner`)

1. **Anonymous** — dashed border, CTA to `/eligibility`
2. **Matches found** — primary green bar, white text, accent check icon
3. **No matches** — warning background, reset filters link

---

## 12. Page patterns

### Marketing / account page header

```tsx
<p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-muted)]">Eyebrow</p>
<h1 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-bold …">Title</h1>
<p className="mt-3 text-sm text-[color:var(--color-muted)]">Subtitle</p>
```

### List menu (account hub)

```
rounded-2xl border border-[color:var(--color-border-strong)] bg-white shadow-sm
divide-y divide-[color:var(--color-border)]
```

### Empty state

```
rounded-2xl border border-dashed border-[color:var(--color-border-strong)] bg-white p-8 text-center
```

---

## 13. Accessibility

- **Focus:** `focus:ring-2` with `--color-focus` on inputs; `focus-visible:outline` on search submit
- **Touch targets:** 44×44px minimum on primary links and header icons
- **Screen readers:** `sr-only` labels on search; `aria-label` on icon-only controls; `role="alert"` / `role="status"` on form feedback
- **Safe areas:** `env(safe-area-inset-bottom)` on bottom chrome
- **Motion:** Hero auto-advance 7s; respect `prefers-reduced-motion` if added later

---

## 14. Using tokens in new UI

```tsx
// Prefer CSS variables via Tailwind arbitrary properties
className="bg-[color:var(--color-primary)] text-white hover:bg-[color:var(--color-primary-hover)]"

// Heading font
className="font-[family-name:var(--font-heading)] font-bold tracking-tight"
```

Add new tokens to `:root` in `globals.css` first, then reference them consistently. Avoid hard-coded hex except logo dots or one-off illustrations.

---

## 15. File map

| Path | Responsibility |
|------|----------------|
| `src/app/globals.css` | Design tokens, body defaults |
| `src/app/layout.tsx` | Font loading, global chrome |
| `src/components/SiteHeader.tsx` | Sticky header |
| `src/components/BottomNav.tsx` | Mobile tab bar |
| `src/components/ProductCard.tsx` | Product tile + eligibility UI |
| `src/components/FinancialSummaryStrip.tsx` | Credit snapshot |
| `src/components/HeroSpotlight.tsx` | Home hero carousel |
| `src/lib/eligibility.ts` | Salary / limit business rules |
| `src/lib/format.ts` | GHS currency formatting |

---

## 16. Divergences from aligned spec

| Topic | Aligned spec | Web frontend today |
|-------|--------------|-------------------|
| Fonts | Manrope + Inter | Outfit only |
| Primary button radius | 8px | `rounded-full` (pill) |
| Primary button label font | Inter 14px / 500 | Outfit, `font-semibold` / `font-bold` |
| Amount display | Inter 300, 36–44px | Accent gold on strip, `font-light` at 28px |

When aligning with the canonical spec, update `layout.tsx` font imports and audit pill vs 8px radius per surface (marketing vs dense dashboard).
