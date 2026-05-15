import { portalHref } from "@/lib/portal-path";

/**
 * Absolute origin for the merchant surface when it is served on another host
 * (e.g. `https://merchant.payeasy.com`). When unset, use in-app paths from {@link portalHref}.
 */
function merchantSiteOrigin(): string | null {
  const raw = process.env.NEXT_PUBLIC_MERCHANT_SITE_ORIGIN?.trim();
  if (!raw) {
    return null;
  }
  return raw.replace(/\/$/, "");
}

/** Path or same-origin URL to merchant registration. */
export function merchantRegisterHref(): string {
  const origin = merchantSiteOrigin();
  if (origin) {
    return `${origin}/register`;
  }
  return portalHref("merchant", "/register");
}

/** Path or same-origin URL to merchant sign-in. */
export function merchantLoginHref(): string {
  const origin = merchantSiteOrigin();
  if (origin) {
    return `${origin}/login`;
  }
  return portalHref("merchant", "/login");
}

/** Path or same-origin URL to the signed-in merchant area. */
export function merchantPortalHref(): string {
  const origin = merchantSiteOrigin();
  if (origin) {
    return `${origin}/dashboard`;
  }
  return portalHref("merchant", "/dashboard");
}
