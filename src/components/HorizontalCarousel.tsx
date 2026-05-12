"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { IconChevronLeft, IconChevronRight } from "@/components/marketplace/icons";

type Props = {
  children: ReactNode;
  className?: string;
  trackClassName?: string;
  ariaLabel?: string;
};

export function HorizontalCarousel({
  children,
  className = "",
  trackClassName = "",
  ariaLabel = "Scrollable list",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  function scroll(dir: -1 | 1) {
    const el = ref.current;
    if (!el) return;
    const delta = Math.max(280, Math.floor(el.clientWidth * 0.75));
    el.scrollBy({ left: dir * delta, behavior: "smooth" });
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scroll(-1)}
        className="absolute left-1 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[color:var(--color-carousel-border)] bg-[color:var(--color-carousel-btn)] text-[color:var(--color-foreground)] shadow-sm transition hover:bg-[color:var(--color-muted-bg)] md:flex"
      >
        <IconChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scroll(1)}
        className="absolute right-1 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[color:var(--color-carousel-border)] bg-[color:var(--color-carousel-btn)] text-[color:var(--color-foreground)] shadow-sm transition hover:bg-[color:var(--color-muted-bg)] md:flex"
      >
        <IconChevronRight className="h-5 w-5" />
      </button>
      <div
        ref={ref}
        role="region"
        aria-label={ariaLabel}
        className={`flex gap-4 overflow-x-auto overscroll-x-contain scroll-smooth pb-1 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-md:snap-x max-md:snap-mandatory touch-pan-x ${trackClassName}`}
      >
        {children}
      </div>
    </div>
  );
}
