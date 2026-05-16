"use client";

import { usePathname } from "next/navigation";
import { IconArrowUp } from "@/components/marketplace/icons";

export function FixedChrome() {
  const pathname = usePathname();
  const hasStickyCta =
    pathname.startsWith("/product/") ||
    pathname === "/cart" ||
    pathname === "/checkout";

  return (
    <button
      type="button"
      aria-label="Back to top"
      className={`fixed z-30 flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-white shadow-lg transition hover:bg-[color:var(--color-primary-hover)] md:h-12 md:w-12 ${
        hasStickyCta
          ? "bottom-[calc(9.75rem+env(safe-area-inset-bottom,0px))] left-4 sm:left-6 md:bottom-6 md:left-6"
          : "bottom-24 right-4 sm:right-6 md:bottom-6"
      }`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <IconArrowUp className="h-5 w-5" />
    </button>
  );
}
