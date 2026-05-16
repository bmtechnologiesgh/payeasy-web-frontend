import { portalHref } from "@/lib/portal-path";

export type MerchantNavItem = {
  href: string;
  label: string;
  description?: string;
  icon: "dashboard" | "orders" | "products" | "profile" | "settings";
  nested?: boolean;
};

export const MERCHANT_NAV_ITEMS: MerchantNavItem[] = [
  { href: portalHref("merchant", "/dashboard"), label: "Dashboard", description: "Overview & insights", icon: "dashboard" },
  { href: portalHref("merchant", "/orders"), label: "Orders", description: "Fulfil PayEasy orders", icon: "orders" },
  {
    href: portalHref("merchant", "/products"),
    label: "Products",
    description: "Catalogue & pricing",
    icon: "products",
    nested: true,
  },
  { href: portalHref("merchant", "/profile"), label: "Profile", description: "Shop & verification", icon: "profile" },
  { href: portalHref("merchant", "/settings"), label: "Settings", description: "Portal preferences", icon: "settings" },
];

export function normalizeMerchantPath(path: string): string {
  const q = path.indexOf("?");
  return q >= 0 ? path.slice(0, q) : path;
}

export function isMerchantNavActive(current: string, item: MerchantNavItem): boolean {
  const itemPath = normalizeMerchantPath(item.href);
  if (current === itemPath) {
    return true;
  }
  if (item.nested && current.startsWith(`${itemPath}/`)) {
    return true;
  }
  return false;
}

export const MERCHANT_QUICK_ACTIONS = MERCHANT_NAV_ITEMS.filter(
  (item) => !item.href.endsWith("/dashboard"),
);
