import {
  getPayeasyApiBaseUrl,
  getPayeasyJson,
  paginatedMetaFromEnvelope,
  type ApiEnvelope,
  type PaginatedMeta,
} from "@/lib/payeasy-api";
import type { Product, TenureKey } from "@/lib/catalog";

export type PublicCatalogProduct = {
  uuid: string;
  slug: string;
  name: string;
  brand: string | null;
  model: string | null;
  description: string | null;
  category: string;
  images?: string[];
  display_image_index?: number;
  image_url: string | null;
  prices_ghs: {
    months3: number | null;
    months4: number | null;
    months5: number | null;
    months6: number | null;
  };
  from_price_ghs: number | null;
  is_deal: boolean;
};

export type CatalogCategorySummary = {
  name: string;
  slug: string;
  count: number;
};

export type CatalogProductListResult = {
  products: Product[];
  categories: CatalogCategorySummary[];
  meta: PaginatedMeta;
};

function catalogImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl?.trim()) {
    return "";
  }

  const trimmed = imageUrl.trim();

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  if (trimmed.startsWith("/storage/")) {
    const apiOrigin = getPayeasyApiBaseUrl().replace(/\/api\/?$/, "");
    return `${apiOrigin}${trimmed}`;
  }

  return trimmed;
}

export function mapPublicProductToCatalogProduct(api: PublicCatalogProduct): Product {
  const pricesGhs: Partial<Record<TenureKey, number | null>> = {
    months3: api.prices_ghs.months3,
    months4: api.prices_ghs.months4,
    months5: api.prices_ghs.months5,
    months6: api.prices_ghs.months6,
  };

  return {
    id: api.slug,
    uuid: api.uuid,
    name: api.name,
    brand: api.brand,
    model: api.model,
    description: api.description,
    category: api.category,
    pricesGhs,
    fromPriceGhs: api.from_price_ghs,
    image: catalogImageUrl(api.image_url),
    images: api.images?.map((url) => catalogImageUrl(url)).filter((url) => url !== "") ?? [],
    deal: api.is_deal,
  };
}

function throwApiError(json: ApiEnvelope<unknown>, fallback: string): never {
  throw new Error(json.message || fallback);
}

export async function listCatalogProducts(params?: {
  search?: string;
  category?: string;
  deal?: boolean;
  page?: number;
  per_page?: number;
}): Promise<CatalogProductListResult> {
  const query = new URLSearchParams();

  if (params?.search) {
    query.set("search", params.search);
  }
  if (params?.category) {
    query.set("category", params.category);
  }
  if (params?.deal) {
    query.set("deal", "1");
  }
  if (params?.page) {
    query.set("page", String(params.page));
  }
  if (params?.per_page) {
    query.set("per_page", String(params.per_page));
  }

  const path = `/catalog/products${query.toString() ? `?${query}` : ""}`;
  const result = await getPayeasyJson<{
    products: PublicCatalogProduct[];
    categories: CatalogCategorySummary[];
  }>(path);

  if (!result.ok) {
    throw new Error(result.text || "Could not load catalogue products");
  }

  const { json, status } = result;

  if (!json.success || !json.data?.products) {
    throwApiError(json, "Could not load catalogue products");
  }

  if (status === 404) {
    return { products: [], categories: [], meta: { count: 0, current_page: 1, last_page: 1, per_page: 24 } };
  }

  return {
    products: json.data.products.map(mapPublicProductToCatalogProduct),
    categories: json.data.categories ?? [],
    meta: paginatedMetaFromEnvelope(json),
  };
}

export async function fetchCatalogProduct(slugOrUuid: string): Promise<Product | null> {
  const encoded = encodeURIComponent(slugOrUuid);
  const result = await getPayeasyJson<{ product: PublicCatalogProduct }>(`/catalog/products/${encoded}`);

  if (!result.ok) {
    if (result.status === 404) {
      return null;
    }
    throw new Error(result.text || "Could not load product");
  }

  const { json } = result;

  if (!json.success || !json.data?.product) {
    return null;
  }

  return mapPublicProductToCatalogProduct(json.data.product);
}

export async function fetchCatalogCategories(): Promise<CatalogCategorySummary[]> {
  const result = await getPayeasyJson<{
    categories: Array<{
      name: string;
      slug: string;
      product_count: number;
    }>;
  }>("/catalog/categories");

  if (!result.ok) {
    throw new Error(result.text || "Could not load catalogue categories");
  }

  const { json } = result;

  if (!json.success || !json.data?.categories) {
    throwApiError(json, "Could not load catalogue categories");
  }

  return json.data.categories.map((c) => ({
    name: c.name,
    slug: c.slug,
    count: c.product_count,
  }));
}

/** Load all published catalogue products (paginates API). */
export async function fetchAllCatalogProducts(): Promise<Product[]> {
  const all: Product[] = [];
  let page = 1;
  let lastPage = 1;

  do {
    const batch = await listCatalogProducts({ page, per_page: 100 });
    all.push(...batch.products);
    lastPage = batch.meta.last_page;
    page += 1;
  } while (page <= lastPage);

  return all;
}
