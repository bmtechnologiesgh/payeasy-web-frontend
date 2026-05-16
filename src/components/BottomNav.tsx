"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  IconCart,
  IconHome,
  IconShop,
  IconUser,
} from "@/components/marketplace/icons";

function NavItem({
  href,
  label,
  active,
  children,
}: {
  href: string;
  label: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-semibold transition ${
        active
          ? "text-[color:var(--color-foreground)]"
          : "text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)]"
      }`}
    >
      <span className="flex h-8 w-8 items-center justify-center">{children}</span>
      {label}
    </Link>
  );
}

/**
 * Pay-Small-Small badge icon — outline circle with a tiny tick to suggest
 * "eligibility approved". Sits in the centre of the bottom nav.
 */
function IconEligibility({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="16" cy="16" r="10" />
      <path d="M11 16.5l3.2 3 6.3-6.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Fixed app-style tab bar — visible on small screens only. Mirrors the mobile app tabs. */
export function BottomNav() {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isShop = pathname.startsWith("/catalog") || pathname.startsWith("/product");
  const isEligibility = pathname.startsWith("/eligibility");
  const isOrders = pathname.startsWith("/orders") || pathname.startsWith("/checkout");
  const isAccount = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");

  return (
    <nav
      aria-label="Primary mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--color-border)] bg-white/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-md md:hidden"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        <NavItem href="/" label="Home" active={isHome}>
          <IconHome className="h-6 w-6" />
        </NavItem>
        <NavItem href="/catalog" label="Shop" active={isShop}>
          <IconShop className="h-6 w-6" />
        </NavItem>
        <NavItem href="/eligibility" label="Eligibility" active={isEligibility}>
          <IconEligibility className="h-6 w-6" />
        </NavItem>
        <NavItem href="/orders" label="Orders" active={isOrders}>
          <IconCart className="h-6 w-6" />
        </NavItem>
        <NavItem href="/sign-in" label="Account" active={isAccount}>
          <IconUser className="h-6 w-6" />
        </NavItem>
      </div>
    </nav>
  );
}
