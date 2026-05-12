import Link from "next/link";
import type { ReactNode } from "react";
import { Suspense } from "react";
import type { CategorySummary } from "@/lib/catalog";
import { MobileNav } from "@/components/MobileNav";
import {
  IconCart,
  IconHeart,
  IconUser,
} from "@/components/marketplace/icons";
import { SalaryHintChip } from "@/components/SalaryHintChip";
import { SearchBar } from "@/components/SearchBar";

type Props = {
  categories: CategorySummary[];
};

function HeaderIconLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex min-w-[44px] flex-col items-center gap-0.5 rounded-lg px-1 py-1 text-[color:var(--color-foreground)] transition hover:bg-[color:var(--color-muted-bg)] sm:min-w-0 sm:px-2 sm:py-1"
    >
      <span className="flex h-8 w-8 items-center justify-center sm:h-9 sm:w-9">{children}</span>
      <span className="hidden text-[10px] font-medium leading-none sm:block sm:text-[11px]">{label}</span>
    </Link>
  );
}

export function SiteHeader({ categories }: Props) {
  const searchCategories = categories.map((c) => ({ slug: c.slug, name: c.name }));

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--color-border)] bg-white/95 backdrop-blur">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4 lg:grid-cols-[minmax(0,auto)_minmax(0,1fr)_minmax(0,auto)] lg:items-center lg:gap-x-4 lg:gap-y-0 xl:gap-x-6">
        {/* Row 1 mobile / Col 1 desktop: menu + brand */}
        <div className="flex min-w-0 items-center justify-between gap-2 lg:justify-start lg:gap-3">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <MobileNav categories={categories} />
            <Link href="/" className="flex min-w-0 items-center gap-2 text-left">
              <span className="flex shrink-0 gap-0.5" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-sm bg-[#e53935]" />
                <span className="h-2.5 w-2.5 rounded-sm bg-[#43a047]" />
                <span className="h-2.5 w-2.5 rounded-sm bg-[#1e88e5]" />
                <span className="h-2.5 w-2.5 rounded-sm bg-[#fbc02d]" />
              </span>
              <span className="min-w-0">
                <span className="font-[family-name:var(--font-heading)] text-lg font-extrabold tracking-tight text-[color:var(--color-foreground)] sm:text-xl">
                  PayEasy
                </span>
                <span className="mt-0.5 block text-[10px] font-semibold leading-none text-[color:var(--color-muted)] sm:text-[11px]">
                  Payroll-backed BNPL
                </span>
              </span>
            </Link>
          </div>

          {/* Mobile / tablet: utilities on same row as logo */}
          <nav
            aria-label="Account and cart"
            className="flex shrink-0 items-center gap-0 sm:gap-0.5 lg:hidden"
          >
            <HeaderIconLink href="/eligibility" label="Account">
              <IconUser className="h-5 w-5 sm:h-6 sm:w-6" />
            </HeaderIconLink>
            <HeaderIconLink href="/orders" label="Orders">
              <IconHeart className="h-5 w-5 sm:h-6 sm:w-6" />
            </HeaderIconLink>
            <HeaderIconLink href="/catalog" label="Cart">
              <IconCart className="h-5 w-5 sm:h-6 sm:w-6" />
            </HeaderIconLink>
          </nav>
        </div>

        {/* Search: fills space between logo and utilities on large screens */}
        <div className="min-w-0 w-full lg:min-w-0">
          <Suspense
            fallback={
              <div className="h-11 w-full animate-pulse rounded-full bg-[color:var(--color-muted-bg)]" />
            }
          >
            <SearchBar categories={searchCategories} />
          </Suspense>
        </div>

        {/* Desktop-only: utilities in third column (avoids duplicate search) */}
        <nav
          aria-label="Account, eligibility and cart"
          className="hidden shrink-0 items-center justify-end gap-0.5 sm:gap-1 lg:flex"
        >
          <span className="mr-1 inline-flex">
            <SalaryHintChip />
          </span>
          <HeaderIconLink href="/eligibility" label="Account">
            <IconUser className="h-6 w-6" />
          </HeaderIconLink>
          <HeaderIconLink href="/orders" label="Orders">
            <IconHeart className="h-6 w-6" />
          </HeaderIconLink>
          <HeaderIconLink href="/catalog" label="Cart">
            <IconCart className="h-6 w-6" />
          </HeaderIconLink>
        </nav>
      </div>
    </header>
  );
}
