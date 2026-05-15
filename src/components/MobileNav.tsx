"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CategorySummary } from "@/lib/catalog";
import { IconMenu } from "@/components/marketplace/icons";

type Props = {
  categories: CategorySummary[];
};

export function MobileNav({ categories }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="relative md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-shop-menu"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-[color:var(--color-border)] bg-white text-[color:var(--color-foreground)]"
      >
        <IconMenu className="h-5 w-5" />
        <span className="sr-only">Open menu</span>
      </button>
      {open ? (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setOpen(false)}
          />
          <div
            id="mobile-shop-menu"
            className="absolute left-0 top-full z-50 mt-2 max-h-[min(70vh,420px)] w-[min(100vw-2rem,320px)] overflow-y-auto rounded-xl border border-[color:var(--color-border)] bg-white py-2 shadow-lg"
          >
            <p className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-wide text-[color:var(--color-muted)]">
              Pay-Small-Small
            </p>
            <ul className="space-y-0.5">
              {[
                { href: "/sign-in", label: "Sign in" },
                { href: "/sign-up", label: "Create account" },
                { href: "/eligibility", label: "Check eligibility" },
                { href: "/how-it-works", label: "How it works" },
                { href: "/wishlist", label: "Wishlist" },
                { href: "/orders", label: "My orders" },
                { href: "/employers", label: "For employers" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="block px-4 py-2.5 text-sm font-semibold text-[color:var(--color-foreground)] hover:bg-[color:var(--color-muted-bg)]"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-3 border-t border-[color:var(--color-border)] px-4 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-wide text-[color:var(--color-muted)]">
              Categories
            </p>
            <ul className="space-y-0.5">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/catalog/${c.slug}`}
                    className="block px-4 py-2.5 text-sm text-[color:var(--color-foreground)] hover:bg-[color:var(--color-muted-bg)]"
                    onClick={() => setOpen(false)}
                  >
                    {c.name}
                    <span className="ml-1 text-[color:var(--color-muted)]">({c.count})</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-2 border-t border-[color:var(--color-border)] px-4 pt-3">
              <Link
                href="/catalog"
                className="text-sm font-semibold text-[color:var(--color-foreground)] underline"
                onClick={() => setOpen(false)}
              >
                Full catalogue
              </Link>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
