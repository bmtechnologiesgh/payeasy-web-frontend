import type { Product, TenureKey } from "@/lib/catalog";
import { TENURE_MONTHS, computePlans } from "@/lib/eligibility";

export const CART_STORAGE_KEY = "payeasy-cart-v1";
export const MAX_CART_ITEMS = 10;

export type CartItem = {
  lineId: string;
  productId: string;
  tenure: TenureKey;
  name: string;
  category: string;
  image: string;
  pricesGhs: Partial<Record<TenureKey, number | null>>;
  months: number;
  monthly: number;
  total: number;
};

export function cartLineId(productId: string, tenure: TenureKey): string {
  return `${productId}:${tenure}`;
}

export function planFromProduct(product: Product, tenure: TenureKey) {
  const plans = computePlans(product);
  return plans.find((p) => p.tenure === tenure) ?? null;
}

export function createCartItem(product: Product, tenure: TenureKey): CartItem | null {
  const plan = planFromProduct(product, tenure);
  if (!plan) {
    return null;
  }

  return {
    lineId: cartLineId(product.id, tenure),
    productId: product.id,
    tenure,
    name: product.name,
    category: product.category,
    image: product.image,
    pricesGhs: { ...product.pricesGhs },
    months: plan.months,
    monthly: plan.monthly,
    total: plan.total,
  };
}

export function updateCartItemTenure(item: CartItem, tenure: TenureKey): CartItem | null {
  const total = item.pricesGhs[tenure];
  if (total == null) {
    return null;
  }

  const months = TENURE_MONTHS[tenure];

  return {
    ...item,
    lineId: cartLineId(item.productId, tenure),
    tenure,
    months,
    monthly: total / months,
    total,
  };
}

export function parseCartItems(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  const items: CartItem[] = [];

  for (const entry of raw) {
    if (!entry || typeof entry !== "object") {
      continue;
    }

    const row = entry as Record<string, unknown>;
    const productId = typeof row.productId === "string" ? row.productId : "";
    const tenure = row.tenure as TenureKey;
    const name = typeof row.name === "string" ? row.name : "";

    if (!productId || !name || !isTenureKey(tenure)) {
      continue;
    }

    const pricesGhs = normalizePrices(row.pricesGhs);
    const months = typeof row.months === "number" ? row.months : TENURE_MONTHS[tenure];
    const total = typeof row.total === "number" ? row.total : pricesGhs[tenure] ?? 0;
    const monthly = typeof row.monthly === "number" ? row.monthly : total / months;

    items.push({
      lineId: cartLineId(productId, tenure),
      productId,
      tenure,
      name,
      category: typeof row.category === "string" ? row.category : "",
      image: typeof row.image === "string" ? row.image : "",
      pricesGhs,
      months,
      monthly,
      total,
    });
  }

  return items.slice(0, MAX_CART_ITEMS);
}

function isTenureKey(value: string): value is TenureKey {
  return value === "months3" || value === "months4" || value === "months5" || value === "months6";
}

function normalizePrices(raw: unknown): Partial<Record<TenureKey, number | null>> {
  if (!raw || typeof raw !== "object") {
    return {};
  }

  const source = raw as Record<string, unknown>;
  const out: Partial<Record<TenureKey, number | null>> = {};

  for (const key of ["months3", "months4", "months5", "months6"] as const) {
    const value = source[key];
    if (value == null) {
      out[key] = null;
    } else if (typeof value === "number" && Number.isFinite(value)) {
      out[key] = value;
    }
  }

  return out;
}

export function loadCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    return parseCartItems(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function saveCartToStorage(items: CartItem[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}
