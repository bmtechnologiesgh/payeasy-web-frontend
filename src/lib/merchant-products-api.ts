import {
  deletePayeasyJsonAuth,
  firstValidationError,
  getPayeasyJson,
  paginatedMetaFromEnvelope,
  patchPayeasyJson,
  postPayeasyJsonAuth,
  postPayeasyMultipartAuth,
  type ApiEnvelope,
  type PaginatedMeta,
} from "@/lib/payeasy-api";

export type MerchantProductPricesGhs = {
  months3: number | null;
  months4: number | null;
  months5: number | null;
  months6: number | null;
};

export type MerchantProduct = {
  uuid: string;
  name: string;
  brand: string | null;
  model: string | null;
  description: string | null;
  slug: string;
  category: string;
  status: "draft" | "published" | "archived" | string;
  images?: string[];
  display_image_index?: number;
  image_url: string | null;
  prices_ghs: MerchantProductPricesGhs;
  from_price_ghs: number | null;
  is_deal: boolean;
  sku: string | null;
  stock_quantity: number | null;
  updated_at: string | null;
  created_at: string | null;
};

export type MerchantProductPayload = {
  name?: string;
  brand?: string | null;
  model?: string | null;
  description?: string | null;
  category?: string;
  status?: string;
  images?: string[];
  display_image_index?: number;
  image_url?: string | null;
  prices_ghs?: Partial<MerchantProductPricesGhs>;
  is_deal?: boolean;
  sku?: string | null;
  stock_quantity?: number | null;
};

export type MerchantProductListResult = {
  products: MerchantProduct[];
  categories: string[];
  meta: PaginatedMeta;
};

export type MerchantProductImageSettings = {
  max_count: number;
  max_upload_kb: number;
  max_upload_mb: number;
  max_dimension: number;
  allowed_types: string[];
};

function throwApiError(json: ApiEnvelope<unknown>, status: number, fallback: string): never {
  const msg = firstValidationError(json) || json.message || fallback;
  throw new Error(status === 422 ? msg : json.message || fallback);
}

export async function listMerchantProducts(
  token: string,
  params?: { search?: string; status?: string; category?: string; page?: number; per_page?: number },
): Promise<MerchantProductListResult> {
  const query = new URLSearchParams();
  if (params?.search) {
    query.set("search", params.search);
  }
  if (params?.status) {
    query.set("status", params.status);
  }
  if (params?.category) {
    query.set("category", params.category);
  }
  if (params?.page) {
    query.set("page", String(params.page));
  }
  if (params?.per_page) {
    query.set("per_page", String(params.per_page));
  }

  const path = `/me/merchant/products${query.toString() ? `?${query}` : ""}`;
  const result = await getPayeasyJson<{ products: MerchantProduct[]; categories: string[] }>(path, token);

  if (!result.ok) {
    throw new Error(result.text || "Could not load products");
  }

  const { json, status } = result;

  if (json.success && json.data?.products) {
    return {
      products: json.data.products,
      categories: json.data.categories ?? [],
      meta: paginatedMetaFromEnvelope(json, json.data.products.length),
    };
  }

  throwApiError(json, status, "Could not load products");
}

export async function getMerchantProduct(token: string, uuid: string): Promise<{ product: MerchantProduct }> {
  const result = await getPayeasyJson<{ product: MerchantProduct }>(`/me/merchant/products/${uuid}`, token);

  if (!result.ok) {
    throw new Error(result.text || "Could not load product");
  }

  const { json, status } = result;

  if (json.success && json.data?.product) {
    return { product: json.data.product };
  }

  throwApiError(json, status, "Could not load product");
}

export async function createMerchantProduct(
  token: string,
  payload: MerchantProductPayload,
): Promise<{ product: MerchantProduct }> {
  const result = await postPayeasyJsonAuth<MerchantProductPayload, { product: MerchantProduct }>(
    "/me/merchant/products",
    token,
    payload,
  );

  if (!result.ok) {
    throw new Error(result.text || "Could not create product");
  }

  const { json, status } = result;

  if (json.success && json.data?.product) {
    return { product: json.data.product };
  }

  throwApiError(json, status, "Could not create product");
}

export async function updateMerchantProduct(
  token: string,
  uuid: string,
  payload: MerchantProductPayload,
): Promise<{ product: MerchantProduct }> {
  const result = await patchPayeasyJson<MerchantProductPayload, { product: MerchantProduct }>(
    `/me/merchant/products/${uuid}`,
    payload,
    token,
  );

  if (!result.ok) {
    throw new Error(result.text || "Could not update product");
  }

  const { json, status } = result;

  if (json.success && json.data?.product) {
    return { product: json.data.product };
  }

  throwApiError(json, status, "Could not update product");
}

export async function getMerchantProductImageSettings(token: string): Promise<MerchantProductImageSettings> {
  const result = await getPayeasyJson<MerchantProductImageSettings>("/me/merchant/product-image-settings", token);

  if (!result.ok) {
    throw new Error(result.text || "Could not load image settings");
  }

  const { json, status } = result;

  if (json.success && json.data) {
    return json.data;
  }

  throwApiError(json, status, "Could not load image settings");
}

export async function uploadMerchantProductImage(
  token: string,
  productUuid: string,
  file: File,
  slot?: number,
): Promise<{ product: MerchantProduct }> {
  const formData = new FormData();
  formData.append("image", file);
  if (slot !== undefined) {
    formData.append("slot", String(slot));
  }

  const result = await postPayeasyMultipartAuth<{ product: MerchantProduct }>(
    `/me/merchant/products/${productUuid}/images`,
    token,
    formData,
  );

  if (!result.ok) {
    throw new Error(result.text || "Could not upload image");
  }

  const { json, status } = result;

  if (json.success && json.data?.product) {
    return { product: json.data.product };
  }

  throwApiError(json, status, "Could not upload image");
}

export async function deleteMerchantProductImage(
  token: string,
  productUuid: string,
  slot: number,
): Promise<{ product: MerchantProduct }> {
  const result = await deletePayeasyJsonAuth<{ product: MerchantProduct }>(
    `/me/merchant/products/${productUuid}/images/${slot}`,
    token,
  );

  if (!result.ok) {
    throw new Error(result.text || "Could not remove image");
  }

  const { json, status } = result;

  if (json.success && json.data?.product) {
    return { product: json.data.product };
  }

  throwApiError(json, status, "Could not remove image");
}
