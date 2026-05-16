export type PortalId = "merchant" | "employer" | "ops";

/**
 * When `NEXT_PUBLIC_USE_SUBDOMAIN_PORTALS` is `true`, each portal is served on its own
 * subdomain and routes are root-relative (`/login`). Otherwise portals live under
 * `/merchant`, `/employer`, and `/ops` (local dev and single-host previews).
 */
export function portalsUsePathPrefixes(): boolean {
  return process.env.NEXT_PUBLIC_USE_SUBDOMAIN_PORTALS !== "true";
}

/**
 * Build an href or router path for a portal, preserving query strings.
 */
export function portalHref(portal: PortalId, path: string): string {
  const raw = path.startsWith("/") ? path : `/${path}`;
  const q = raw.indexOf("?");
  const pathname = q >= 0 ? raw.slice(0, q) : raw;
  const search = q >= 0 ? raw.slice(q) : "";
  const base = portalsUsePathPrefixes() ? `/${portal}${pathname}` : pathname;
  return `${base}${search}`;
}
