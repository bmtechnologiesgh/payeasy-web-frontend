import Link from "next/link";
import { SiteTopBarAuthLinks } from "@/components/SiteTopBarAuthLinks";
import { merchantRegisterHref } from "@/lib/merchant-portal";

type PromoLink =
  | { href: string; label: string; external?: false }
  | { href: string; label: string; external: true };

const merchantRegister = merchantRegisterHref();
const promoLinks: PromoLink[] = [
  { href: "/eligibility", label: "Check eligibility" },
  { href: "/employers", label: "For employers" },
  {
    href: merchantRegister,
    label: "Sell on PayEasy",
    external: merchantRegister.startsWith("http"),
  },
];

function PromoLinkItem({ item }: { item: PromoLink }) {
  const className = "whitespace-nowrap font-medium text-[color:var(--color-foreground)] hover:underline";

  if (item.external) {
    return (
      <a href={item.href} className={className}>
        {item.label}
      </a>
    );
  }

  return (
    <Link href={item.href} className={className}>
      {item.label}
    </Link>
  );
}

export function SiteTopBar() {
  return (
    <div className="border-b border-[color:var(--color-border)] bg-white text-[13px] text-[color:var(--color-muted)]">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-2 sm:px-6 md:py-2.5">
        {/* Desktop: a few discovery links */}
        <nav
          aria-label="Quick links"
          className="hidden min-w-0 flex-wrap items-center gap-x-4 gap-y-1 md:flex"
        >
          {promoLinks.map((item) => (
            <PromoLinkItem key={item.label} item={item} />
          ))}
        </nav>

        {/* Mobile: trust cue only — account links live in the header / burger menu */}
        <p className="truncate text-[11px] font-medium text-[color:var(--color-muted)] md:hidden">
          Employer-verified marketplace
        </p>

        <SiteTopBarAuthLinks />
      </div>
    </div>
  );
}
