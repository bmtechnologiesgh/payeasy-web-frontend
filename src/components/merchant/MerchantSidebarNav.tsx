"use client";

import { MerchantNavIcon } from "@/components/merchant/MerchantNavIcon";
import {
  MERCHANT_NAV_ITEMS,
  isMerchantNavActive,
  normalizeMerchantPath,
} from "@/components/merchant/merchant-nav";
import Link from "next/link";
import { usePathname } from "next/navigation";

function linkClass(active: boolean): string {
  const base =
    "group flex items-start gap-3 rounded-xl px-3 py-2.5 text-sm transition outline-none ring-[color:var(--color-focus)] focus-visible:ring-2";
  if (active) {
    return `${base} bg-[color:var(--color-primary)]/8 font-semibold text-[color:var(--color-primary)] ring-1 ring-[color:var(--color-primary)]/15`;
  }
  return `${base} font-medium text-[color:var(--color-muted)] hover:bg-[color:var(--color-muted-bg)] hover:text-[color:var(--color-foreground)]`;
}

export function MerchantSidebarNav() {
  const pathname = usePathname();
  const current = normalizeMerchantPath(pathname);

  return (
    <nav aria-label="Merchant dashboard" className="space-y-1">
      <p className="mb-4 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-muted)]">
        Menu
      </p>
      <ul className="space-y-0.5">
        {MERCHANT_NAV_ITEMS.map((item) => {
          const active = isMerchantNavActive(current, item);
          return (
            <li key={item.href}>
              <Link href={item.href} className={linkClass(active)} aria-current={active ? "page" : undefined}>
                <span
                  className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg transition ${
                    active
                      ? "bg-[color:var(--color-primary)] text-white"
                      : "bg-[color:var(--color-muted-bg)] text-[color:var(--color-muted)] group-hover:text-[color:var(--color-primary)]"
                  }`}
                >
                  <MerchantNavIcon name={item.icon} className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block">{item.label}</span>
                  {item.description ? (
                    <span className="mt-0.5 block text-xs font-normal text-[color:var(--color-muted)]">
                      {item.description}
                    </span>
                  ) : null}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Compact horizontal strip for small viewports (same routes as sidebar). */
export function MerchantDashboardNavRail() {
  const pathname = usePathname();
  const current = normalizeMerchantPath(pathname);

  return (
    <nav
      aria-label="Merchant dashboard sections"
      className="sticky top-[57px] z-30 flex gap-1 overflow-x-auto border-b border-[color:var(--color-border)] bg-[color:var(--color-app)] px-2 py-2 md:hidden"
    >
      {MERCHANT_NAV_ITEMS.map((item) => {
        const active = isMerchantNavActive(current, item);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold whitespace-nowrap transition ${
              active
                ? "bg-[color:var(--color-primary)] text-white shadow-sm"
                : "bg-white text-[color:var(--color-foreground)] ring-1 ring-[color:var(--color-border-strong)] hover:bg-[color:var(--color-muted-bg)]"
            }`}
            aria-current={active ? "page" : undefined}
          >
            <MerchantNavIcon name={item.icon} className="size-3.5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
