import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { HorizontalCarousel } from "@/components/HorizontalCarousel";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";
import type { SalaryContext } from "@/lib/eligibility";

type Props = {
  row1: Product[];
  row2: Product[];
  salaryCtx?: SalaryContext;
};

function PromoEmployee() {
  return (
    <div className="flex min-w-[260px] max-w-[280px] shrink-0 flex-col justify-between rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-primary)] p-6 text-white shadow-sm">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/65">
          For salaried employees
        </p>
        <p className="mt-3 font-[family-name:var(--font-heading)] text-2xl font-extrabold leading-tight text-white">
          Pay-Small-Small from your salary.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-white/75">
          Browse phones, appliances, and more on instalment — every total includes the PayEasy service fee.
        </p>
      </div>
      <Link
        href="/eligibility"
        className="mt-6 inline-flex w-fit items-center justify-center rounded-xl bg-[color:var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-accent-hover)]"
      >
        Check eligibility
      </Link>
    </div>
  );
}

function PromoEmployer() {
  return (
    <div className="flex min-w-[260px] max-w-[280px] shrink-0 flex-col justify-between rounded-xl border border-[color:var(--color-border)] bg-white p-0 shadow-sm">
      <div className="rounded-t-xl bg-[color:var(--color-muted-bg)] px-6 py-8 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-muted)]">
          For HR & finance
        </p>
        <p className="mt-2 font-[family-name:var(--font-heading)] text-xl font-extrabold uppercase tracking-wide text-[color:var(--color-foreground)]">
          Employee benefit
        </p>
      </div>
      <div className="flex flex-1 flex-col justify-between px-6 pb-6 pt-4">
        <p className="text-sm leading-relaxed text-[color:var(--color-muted)]">
          Offer payroll-backed BNPL with zero balance-sheet exposure. Reconciliation, mandate, and reporting handled.
        </p>
        <Link
          href="/employers"
          className="mt-4 inline-flex w-fit items-center justify-center rounded-xl bg-[color:var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)]"
        >
          Onboard your company
        </Link>
      </div>
    </div>
  );
}

export function HomeFeaturedOffers({ row1, row2, salaryCtx }: Props) {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6">
      <SectionHeading title="Featured on PayEasy" actionHref="/catalog" actionLabel="See full catalogue" />

      <div className="mb-8 rounded-2xl">
        <HorizontalCarousel ariaLabel="Featured offers row one">
          <PromoEmployee />
          {row1.map((p) => (
            <ProductCard key={p.id} product={p} variant="carousel" salaryCtx={salaryCtx} />
          ))}
        </HorizontalCarousel>
      </div>

      <div className="rounded-2xl border border-[color:var(--color-border)] bg-white p-4 shadow-sm">
        <HorizontalCarousel ariaLabel="Featured offers row two">
          <PromoEmployer />
          {row2.map((p) => (
            <ProductCard key={p.id} product={p} variant="carousel" salaryCtx={salaryCtx} />
          ))}
        </HorizontalCarousel>
      </div>
    </section>
  );
}
