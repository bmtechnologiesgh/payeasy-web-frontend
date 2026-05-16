import { getPayeasyJson } from "@/lib/payeasy-api";

export type ProductCategory = {
  uuid: string;
  name: string;
  slug: string;
  sort_order: number;
};

export async function listProductCategories(): Promise<ProductCategory[]> {
  const result = await getPayeasyJson<{ categories: ProductCategory[] }>("/product-categories");

  if (!result.ok) {
    throw new Error(result.text || "Could not load categories");
  }

  const { json } = result;

  if (json.success && json.data?.categories) {
    return json.data.categories;
  }

  throw new Error(json.message || "Could not load categories");
}
