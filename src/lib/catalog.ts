import { slugify } from "@/lib/slug";
import {
  fetchAllCatalogProducts,
  fetchCatalogCategories,
  fetchCatalogProduct,
  listCatalogProducts,
} from "@/lib/catalog-api";

export type TenureKey = "months3" | "months4" | "months5" | "months6";

export type Product = {
  /** Public URL key (product slug). */
  id: string;
  uuid: string;
  name: string;
  brand: string | null;
  model: string | null;
  description: string | null;
  category: string;
  pricesGhs: Partial<Record<TenureKey, number | null>>;
  fromPriceGhs: number | null;
  image: string;
  images: string[];
  deal: boolean;
};

export type CategorySummary = {
  name: string;
  slug: string;
  count: number;
};

export async function getProducts(): Promise<Product[]> {
  return fetchAllCatalogProducts();
}

export async function getCategories(): Promise<CategorySummary[]> {
  return fetchCatalogCategories();
}

export async function getCategoryBySlug(slug: string): Promise<CategorySummary | undefined> {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug);
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
      if (monthly < best) {
        best = monthly;
      }
    }
  }
  return best;
}

export function filterProducts(
  products: Product[],
  input: {
    categorySlug?: string;
    q?: string;
    min?: number;
    max?: number;
  },
): Product[] {
  let list = [...products];

  if (input.categorySlug) {
    const slug = input.categorySlug;
    list = list.filter((p) => slugify(p.category) === slug || p.category.toLowerCase().includes(slug.replace(/-/g, " ")));
  }

  const q = input.q?.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.brand?.toLowerCase().includes(q) ?? false) ||
        (p.model?.toLowerCase().includes(q) ?? false),
    );
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

export async function getProductById(id: string): Promise<Product | undefined> {
  const product = await fetchCatalogProduct(id);
  return product ?? undefined;
}

export async function getDealProducts(limit = 12): Promise<Product[]> {
  const result = await listCatalogProducts({ deal: true, per_page: Math.min(limit, 100) });
  return result.products.slice(0, limit);
}

/** First product in a category — used for category preview imagery on the home page. */
export function getPreviewProductForCategory(products: Product[], categoryName: string): Product | undefined {
  return products.find((p) => p.category === categoryName);
}
