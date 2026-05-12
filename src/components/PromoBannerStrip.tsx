import Link from "next/link";
import { IconChevronRight } from "@/components/marketplace/icons";

/**
 * Three onboarding-stage tiles under the header — replaces the generic Discover/Gamer/Clearance
 * row with the PayEasy Pay-Small-Small journey: eligibility → plan → payroll consent.
 */
export function PromoBannerStrip() {
  const items = [
    {
      href: "/eligibility",
      label: "Step 1 · Eligibility",
      labelClass: "text-[color:var(--color-foreground)]",
      headline: "Estimate your credit limit in under 30 seconds.",
      icon: (
        <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M5 22V10h22v12" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 14h14M9 18h8" strokeLinecap="round" />
          <path d="M22 22l3 4 4-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      href: "/how-it-works",
      label: "Step 2 · Plan choice",
      labelClass: "text-[color:var(--color-foreground)]",
      headline: "Compare 3 / 4 / 5 / 6-month plans side by side.",
      icon: (
        <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="5" y="9" width="22" height="14" rx="2" />
          <path d="M5 14h22" />
          <path d="M11 19h4" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      href: "/how-it-works",
      label: "Step 3 · Payroll consent",
      labelClass: "text-[color:var(--color-foreground)]",
      headline: "Authorise salary deduction. We handle the rest.",
      icon: (
        <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M6 26V8a2 2 0 012-2h12l6 6v14a2 2 0 01-2 2H8a2 2 0 01-2-2z" strokeLinejoin="round" />
          <path d="M20 6v6h6" strokeLinejoin="round" />
          <path d="M11 19l3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ] as const;

  return (
    <div className="mx-auto grid max-w-[1280px] gap-3 px-4 pt-4 sm:grid-cols-3 sm:px-6">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="group flex items-center gap-3 rounded-2xl border border-[color:var(--color-border-strong)] bg-white px-4 py-3 shadow-sm transition hover:border-[color:var(--color-muted)] hover:shadow-md"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[color:var(--color-muted-bg)] text-[color:var(--color-foreground)]">
            {item.icon}
          </span>
          <div className="min-w-0 flex-1">
            <p className={`text-[10px] font-bold uppercase tracking-[0.12em] ${item.labelClass}`}>{item.label}</p>
            <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-[color:var(--color-foreground)]">
              {item.headline}
            </p>
          </div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-carousel-btn)] text-[color:var(--color-foreground)] transition group-hover:bg-[color:var(--color-muted-bg)]">
            <IconChevronRight className="h-5 w-5" />
          </span>
        </Link>
      ))}
    </div>
  );
}
