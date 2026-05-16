"use client";

import { isOpsNavActive, normalizeOpsPath, OPS_NAV_ITEMS } from "@/components/ops/ops-nav";
import Link from "next/link";
import { usePathname } from "next/navigation";

function linkClass(active: boolean): string {
  const base =
    "block rounded-xl px-3 py-2.5 text-sm transition outline-none ring-[color:var(--color-focus)] focus-visible:ring-2";
  if (active) {
    return `${base} bg-[color:var(--color-muted-bg)] font-semibold text-[color:var(--color-foreground)]`;
  }
  return `${base} font-medium text-[color:var(--color-muted)] hover:bg-[color:var(--color-muted-bg)] hover:text-[color:var(--color-foreground)]`;
}

export function OpsSidebarNav() {
  const pathname = usePathname();
  const current = normalizeOpsPath(pathname);

  return (
    <nav aria-label="Operations dashboard" className="space-y-1">
      <p className="mb-3 px-3 text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">Menu</p>
      <ul className="space-y-0.5">
        {OPS_NAV_ITEMS.map((item) => {
          const active = isOpsNavActive(current, item);
          return (
            <li key={item.href}>
              <Link href={item.href} className={linkClass(active)} aria-current={active ? "page" : undefined}>
                <span className="block">{item.label}</span>
                {item.description ? (
                  <span className="mt-0.5 block text-xs font-normal text-[color:var(--color-muted)]">
                    {item.description}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function OpsDashboardNavRail() {
  const pathname = usePathname();
  const current = normalizeOpsPath(pathname);

  return (
    <nav
      aria-label="Operations sections"
      className="flex gap-1 overflow-x-auto border-b border-[color:var(--color-border)] bg-[color:var(--color-app)] px-2 py-2 md:hidden"
    >
      {OPS_NAV_ITEMS.map((item) => {
        const active = isOpsNavActive(current, item);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold whitespace-nowrap transition ${
              active
                ? "bg-[color:var(--color-primary)] text-white"
                : "bg-white text-[color:var(--color-foreground)] ring-1 ring-[color:var(--color-border-strong)] hover:bg-[color:var(--color-muted-bg)]"
            }`}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
