import Link from "next/link";
import type { ReactNode } from "react";
import { Suspense } from "react";
import type { CategorySummary } from "@/lib/catalog";
import { CartIconLink } from "@/components/cart/CartIconLink";
import { HeaderAccountNav } from "@/components/HeaderAccountNav";
import { MobileNav } from "@/components/MobileNav";
import {
  IconHeart,
  IconPackage,
} from "@/components/marketplace/icons";
import { SalaryHintChip } from "@/components/SalaryHintChip";
import { SearchBar } from "@/components/SearchBar";
import { PayEasyLogo } from "@/components/PayEasyLogo";
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
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden sm:gap-3 lg:flex-none">
            <MobileNav categories={categories} />
            <PayEasyLogo />
          </div>

          {/* Mobile / tablet: utilities on same row as logo */}
          <nav
            aria-label="Account, wishlist, orders and cart"
            className="flex shrink-0 items-center gap-0 sm:gap-0.5 lg:hidden"
          >
            <HeaderAccountNav compact />
            <HeaderIconLink href="/wishlist" label="Wishlist">
              <IconHeart className="h-5 w-5 sm:h-6 sm:w-6" />
            </HeaderIconLink>
            <HeaderIconLink href="/orders" label="Orders">
              <IconPackage className="h-5 w-5 sm:h-6 sm:w-6" />
            </HeaderIconLink>
            <CartIconLink compact />
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
          aria-label="Account, wishlist, orders and cart"
          className="hidden shrink-0 items-center justify-end gap-0.5 sm:gap-1 lg:flex"
        >
          <span className="mr-1 inline-flex">
            <SalaryHintChip />
          </span>
          <HeaderAccountNav />
          <HeaderIconLink href="/wishlist" label="Wishlist">
            <IconHeart className="h-6 w-6" />
          </HeaderIconLink>
          <HeaderIconLink href="/orders" label="Orders">
            <IconPackage className="h-6 w-6" />
          </HeaderIconLink>
          <CartIconLink />
        </nav>
      </div>
    </header>
  );
}
