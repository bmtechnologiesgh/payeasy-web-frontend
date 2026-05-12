import productsJson from "@/data/products.json";
import { slugify } from "@/lib/slug";

export type TenureKey = "months3" | "months4" | "months5" | "months6";

export type Product = {
  id: string;
  name: string;
  category: string;
  pricesGhs: Partial<Record<TenureKey, number | null | undefined>>;
  fromPriceGhs: number | null;
  image: string;
  deal: boolean;
};

const products = productsJson as Product[];

export function getProducts(): Product[] {
  return products;
}

export type CategorySummary = {
  name: string;
  slug: string;
  count: number;
};

export function getCategories(): CategorySummary[] {
  const map = new Map<string, number>();
  for (const p of products) {
    map.set(p.category, (map.get(p.category) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, slug: slugify(name), count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getCategoryBySlug(slug: string): CategorySummary | undefined {
  return getCategories().find((c) => c.slug === slug);
}

/**
 * Lowest monthly across the available tenures — used by salary-aware filters.
 * Falls back to `Infinity` when no tenures are present.
 */
export function lowestMonthlyForFilter(p: Product): number {
  const tenures: { key: TenureKey; months: number }[] = [
    { key: "months3", months: 3 },
    { key: "months4", months: 4 },
    { key: "months5", months: 5 },
    { key: "months6", months: 6 },
  ];
  let best = Infinity;
  for (const t of tenures) {
    const total = p.pricesGhs[t.key];
    if (total != null) {
      const monthly = total / t.months;
      if (monthly < best) best = monthly;
    }
  }
  return best;
}

export function filterProducts(input: {
  categorySlug?: string;
  q?: string;
  min?: number;
  max?: number;
}): Product[] {
  let list = [...products];

  if (input.categorySlug) {
    const cat = getCategoryBySlug(input.categorySlug);
    if (!cat) return [];
    list = list.filter((p) => p.category === cat.name);
  }

  const q = input.q?.trim().toLowerCase();
  if (q) {
    list = list.filter((p) => p.name.toLowerCase().includes(q));
  }

  const min = input.min;
  if (min != null && !Number.isNaN(min)) {
    list = list.filter((p) => lowestMonthlyForFilter(p) >= min);
  }
  const max = input.max;
  if (max != null && !Number.isNaN(max)) {
    list = list.filter((p) => lowestMonthlyForFilter(p) <= max);
  }

  return list;
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getDealProducts(limit = 12): Product[] {
  const deals = products.filter((p) => p.deal);
  return deals.slice(0, limit);
}

/** First product in a category — used for category preview imagery on the home page. */
export function getPreviewProductForCategory(categoryName: string): Product | undefined {
  return products.find((p) => p.category === categoryName);
}
