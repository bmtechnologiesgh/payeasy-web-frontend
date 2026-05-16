import { getPayeasyJson } from "@/lib/payeasy-api";

export type BrandOption = {
  uuid: string;
  name: string;
  slug: string;
};

export type ProductModelOption = {
  uuid: string;
  name: string;
  slug: string;
  brand?: string;
};

export async function listBrands(search?: string): Promise<BrandOption[]> {
  const query = search?.trim() ? `?q=${encodeURIComponent(search.trim())}` : "";
  const result = await getPayeasyJson<{ brands: BrandOption[] }>(`/brands${query}`);

  if (!result.ok) {
    throw new Error(result.text || "Could not load brands");
  }

  const { json } = result;

  if (json.success && json.data?.brands) {
    return json.data.brands;
  }

  throw new Error(json.message || "Could not load brands");
}

export async function listProductModels(brand: string, search?: string): Promise<ProductModelOption[]> {
  const brandName = brand.trim();
  if (brandName === "") {
    return [];
  }

  const params = new URLSearchParams({ brand: brandName });
  if (search?.trim()) {
    params.set("q", search.trim());
  }

  const result = await getPayeasyJson<{ models: ProductModelOption[] }>(`/product-models?${params.toString()}`);

  if (!result.ok) {
    throw new Error(result.text || "Could not load models");
  }

  const { json } = result;

  if (json.success && json.data?.models) {
    return json.data.models;
  }

  throw new Error(json.message || "Could not load models");
}
