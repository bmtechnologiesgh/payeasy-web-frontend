import {
  getCategories,
  getDealProducts,
  getProductById,
  getProducts,
} from "@/lib/catalog";
import { CategoryTiles } from "@/components/CategoryTiles";
import { HomeFeaturedOffers } from "@/components/HomeFeaturedOffers";
import { HomeFeaturedProducts } from "@/components/HomeFeaturedProducts";
import { HomeHero } from "@/components/HomeHero";
import { HomeTodaysDeals } from "@/components/HomeTodaysDeals";
import type { HeroSlide } from "@/components/HeroSpotlight";
import { PromoBannerStrip } from "@/components/PromoBannerStrip";
import { TrendingBrands } from "@/components/TrendingBrands";
import {
  buildSalaryContext,
  readSalaryFromSearchParams,
} from "@/lib/eligibility";

/**
 * Hero spotlight slides.
 *
 * Each slide carries TWO image references:
 *   - `image`     → product cut-out from `/products/*` (fallback, also used by PDP)
 *   - `heroImage` → curated lifestyle/marketing shot, drop into `public/hero/`
 *                   using the filename below. `HeroSpotlight` renders these
 *                   edge-to-edge (`imageFit: "cover"`) and falls back to `image`
 *                   automatically if the file is missing.
 */
function buildHeroSlides(): HeroSlide[] {
  const slides: HeroSlide[] = [];
  const tv = getProductById("samsung-led-full-hd-smart-tv-32-inch-r143");
  const ultra = getProductById("galaxy-s26-ultra-12-256gb-r15");
  const tablet = getProductById("samsung-tab-s11-ultra-r81");
  const buds = getProducts().find((p) => p.category === "Earbuds");

  if (tv) {
    slides.push({
      productId: tv.id,
      brand: "PAYROLL-BACKED · SAMSUNG",
      title: "Smart TVs paid from your salary",
      subtitle:
        "Pick a 3, 4, 5 or 6-month plan and see the total payable before you commit. No cards, no chasing — repayments come straight from payroll.",
      image: tv.image,
      heroImage: "/hero/smart-tv.png",
      imageFit: "cover",
    });
  }
  if (ultra) {
    slides.push({
      productId: ultra.id,
      brand: "EMPLOYEE PICK · SAMSUNG",
      title: ultra.name,
      subtitle:
        "Flagship photography on Pay-Small-Small. Compare every plan total side by side — fee included.",
      image: ultra.image,
      heroImage: "/hero/galaxy-s26-ultra.jpg",
      imageFit: "cover",
      badge: "Eligible if you earn ≥ ₵5,000/mo",
    });
  }
  if (tablet) {
    slides.push({
      productId: tablet.id,
      brand: "WORK & STUDY · SAMSUNG",
      title: tablet.name,
      subtitle: "A bigger canvas without breaking the month — totals shown per plan, deduction capped at 30% of salary.",
      image: tablet.image,
      heroImage: "/hero/tab-s11-ultra.jpg",
      imageFit: "cover",
    });
  }
  if (buds) {
    slides.push({
      productId: buds.id,
      brand: "EVERYDAY ESSENTIAL",
      title: buds.name,
      subtitle: "Small-ticket Pay-Small-Small. See the per-plan total before you tap continue.",
      image: buds.image,
      heroImage: "/hero/samsung-buds3.png",
      imageFit: "cover",
    });
  }

  return slides;
}

function buildOfferPool() {
  const deals = getDealProducts(24);
  const rest = getProducts();
  const pool = [...deals];
  const seen = new Set(pool.map((p) => p.id));
  for (const p of rest) {
    if (pool.length >= 20) break;
    if (!seen.has(p.id)) {
      pool.push(p);
      seen.add(p.id);
    }
  }
  return pool;
}

type SearchParams = Record<string, string | string[] | undefined>;

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const salaryGhs = readSalaryFromSearchParams(sp.salary);
  const ctx = buildSalaryContext(salaryGhs);

  const categories = getCategories();
  const slides = buildHeroSlides();
  const pool = buildOfferPool();
  const row1 = pool.slice(0, 8);
  const row2 = pool.slice(8, 16);
  const featured = getProducts().slice(0, 10);

  const a = pool[0] ?? getProducts()[0];
  const b = pool[1] ?? getProducts()[1];
  const c = pool[2] ?? getProducts()[2];
  const d = pool[3] ?? getProducts()[3];

  return (
    <>
      <PromoBannerStrip />
      {slides.length ? <HomeHero categories={categories} slides={slides} salaryGhs={salaryGhs} /> : null}
      <HomeFeaturedOffers row1={row1} row2={row2} salaryCtx={ctx} />
      <HomeTodaysDeals heroLeft={a} heroRight={b} compactTop={c} compactBottom={d} salaryCtx={ctx} />
      <CategoryTiles categories={categories} />
      <HomeFeaturedProducts products={featured} salaryCtx={ctx} />
      <TrendingBrands />
    </>
  );
}
