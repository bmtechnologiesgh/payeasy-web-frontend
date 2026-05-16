import { portalHref } from "@/lib/portal-path";

export type OpsNavItem = {
  href: string;
  label: string;
  description?: string;
  /** Match child paths (e.g. /users/abc for /users). */
  nested?: boolean;
};

export const OPS_NAV_ITEMS: OpsNavItem[] = [
  { href: portalHref("ops", "/dashboard"), label: "Dashboard", description: "Overview" },
  { href: portalHref("ops", "/users"), label: "Users", description: "Accounts & roles", nested: true },
  { href: portalHref("ops", "/merchants"), label: "Merchants", description: "KYB review", nested: true },
  { href: portalHref("ops", "/employers"), label: "Employers", description: "Onboard & roster" },
  { href: portalHref("ops", "/audit-logs"), label: "Audit log", description: "Compliance trail", nested: true },
  { href: portalHref("ops", "/settings"), label: "Settings", description: "Platform config" },
];

export function normalizeOpsPath(path: string): string {
  const q = path.indexOf("?");
  return q >= 0 ? path.slice(0, q) : path;
}

export function isOpsNavActive(current: string, item: OpsNavItem): boolean {
  const itemPath = normalizeOpsPath(item.href);
  if (current === itemPath) {
    return true;
  }
  if (item.nested && current.startsWith(`${itemPath}/`)) {
    return true;
  }
  return false;
}
