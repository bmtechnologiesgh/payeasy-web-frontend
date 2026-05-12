import Link from "next/link";
import type { CategorySummary } from "@/lib/catalog";
import { CategoryRail } from "@/components/CategoryRail";
import { FinancialSummaryStrip } from "@/components/FinancialSummaryStrip";
import { HeroSpotlight, type HeroSlide } from "@/components/HeroSpotlight";
import { withSalaryParam } from "@/lib/eligibility";

type Props = {
  categories: CategorySummary[];
  slides: HeroSlide[];
  salaryGhs: number | null;
};

export function HomeHero({ categories, slides, salaryGhs }: Props) {
  const chips = categories.slice(0, 10);

  return (
    <section className="pb-6 pt-2 md:pb-8">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        {/* Hero row: Motta-style category sidebar (left, md+) + image spotlight (right). */}
        <div className="flex flex-col gap-4 md:flex-row md:items-stretch md:gap-5">
          <CategoryRail categories={categories} salaryGhs={salaryGhs} />
          <HeroSpotlight slides={slides} />
        </div>

        {/* BNPL anchor — slim horizontal strip directly under the hero row. */}
        <div className="mt-4">
          <FinancialSummaryStrip salaryGhs={salaryGhs} />
        </div>

        {/* Mobile-only category chips — replaces sidebar above the fold */}
        <div className="mt-5 md:hidden">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[color:var(--color-muted)]">
            Shop by category
          </p>
          <div className="flex gap-2 overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-pan-x">
            {chips.map((c) => (
              <Link
                key={c.slug}
                href={withSalaryParam(`/catalog/${c.slug}`, salaryGhs)}
                className="inline-flex shrink-0 rounded-full border border-[color:var(--color-border)] bg-white px-4 py-2.5 text-xs font-semibold text-[color:var(--color-foreground)] shadow-sm"
              >
                <span className="max-w-[10rem] truncate font-[family-name:var(--font-heading)]">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
