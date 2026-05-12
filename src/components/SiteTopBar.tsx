import Link from "next/link";
import { IconChevronDown } from "@/components/marketplace/icons";

const promoLinks = [
  { href: "/eligibility", label: "Check eligibility", icon: "✓" },
  { href: "/how-it-works", label: "How Pay-Small-Small works", icon: "❓" },
  { href: "/employers", label: "For employers", icon: "🏢" },
  { href: "/orders", label: "Track order", icon: "📦" },
  { href: "/how-it-works", label: "Help", icon: "💬" },
] as const;

export function SiteTopBar() {
  return (
    <div className="border-b border-[color:var(--color-border)] bg-white text-[13px] text-[color:var(--color-muted)]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        {/* Mobile: single slim utility row. Promo links live in the burger menu
            (MobileNav) + the hero CTA — no need to re-surface them here. */}
        <div className="flex items-center justify-between gap-3 py-2 text-[11px] font-medium text-[color:var(--color-foreground)] md:hidden">
          <span className="inline-flex items-center gap-1 text-[color:var(--color-muted)]">
            Employer-verified
            <IconChevronDown className="h-3 w-3" />
          </span>
          <div className="flex items-center gap-x-3">
            <Link href="/orders" className="hover:underline">
              Track order
            </Link>
            <span className="inline-flex items-center gap-1">
              <span aria-hidden>🇬🇭</span>
              EN / GHS
            </span>
          </div>
        </div>

        {/* Desktop: full top row */}
        <div className="hidden flex-wrap items-center justify-between gap-2 py-2.5 md:flex">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {promoLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="inline-flex items-center gap-1.5 font-medium text-[color:var(--color-foreground)] hover:underline"
              >
                <span aria-hidden className="text-[14px] opacity-80">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <span className="inline-flex cursor-default items-center gap-1 font-medium text-[color:var(--color-foreground)]">
              Employer-verified
              <IconChevronDown className="h-3.5 w-3.5 text-[color:var(--color-muted)]" />
            </span>
            <Link className="font-medium text-[color:var(--color-foreground)] hover:underline" href="/orders">
              Track order
            </Link>
            <Link className="font-medium text-[color:var(--color-foreground)] hover:underline" href="/how-it-works">
              Help center
            </Link>
            <span className="inline-flex items-center gap-1.5 font-medium text-[color:var(--color-foreground)]">
              <span aria-hidden className="text-base">
                🇬🇭
              </span>
              EN / GHS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
