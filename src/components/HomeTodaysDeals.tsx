import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { SectionHeading } from "@/components/SectionHeading";
import {
  buildSalaryContext,
  evaluateProduct,
  type SalaryContext,
  withSalaryParam,
} from "@/lib/eligibility";
import { formatGhs } from "@/lib/format";

type Props = {
  heroLeft: Product;
  heroRight: Product;
  compactTop: Product;
  compactBottom: Product;
  salaryCtx?: SalaryContext;
};

function planLabel(product: Product, ctx: SalaryContext): string {
  const evalResult = evaluateProduct(product, ctx);
  if (evalResult.bestPlan) {
    return `From ${formatGhs(Math.round(evalResult.bestPlan.monthly))}/mo × ${evalResult.bestPlan.months}`;
  }
  if (product.fromPriceGhs != null) {
    return `From ${formatGhs(Math.round(product.fromPriceGhs))}`;
  }
  return "See plans";
}

export function HomeTodaysDeals({
  heroLeft,
  heroRight,
  compactTop,
  compactBottom,
  salaryCtx,
}: Props) {
  const ctx = salaryCtx ?? buildSalaryContext(null);

  return (
    <section className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6">
      <div className="rounded-2xl bg-[color:var(--color-muted-bg)] p-6 md:p-8">
        <SectionHeading
          title="Pay-Small-Small picks this week"
          actionHref="/catalog"
          actionLabel="See all"
        />

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <article className="flex flex-col rounded-2xl border border-[color:var(--color-border)] bg-white p-6 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
              Lower monthly
            </p>
            <h3 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-bold text-[color:var(--color-foreground)]">
              {heroLeft.name}
            </h3>
            <p className="mt-2 text-sm text-[color:var(--color-muted)]">
              {planLabel(heroLeft, ctx)} — fee included. Spread it across 3, 4, 5 or 6 payroll cycles.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href={withSalaryParam(`/product/${heroLeft.id}`, ctx.salaryGhs)}
                className="inline-flex rounded-xl bg-[color:var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)]"
              >
                See plans
              </Link>
              <Link
                href={withSalaryParam(`/product/${heroLeft.id}`, ctx.salaryGhs)}
                className="self-center text-sm font-medium underline underline-offset-4"
              >
                Compare totals
              </Link>
            </div>
            <div className="relative mt-8 aspect-[4/3] w-full">
              <Image
                src={heroLeft.image}
                alt=""
                fill
                className="object-contain"
                sizes="(max-width:1024px) 100vw, 33vw"
                unoptimized
              />
            </div>
          </article>

          <article className="flex flex-col rounded-2xl border border-[color:var(--color-border)] bg-white p-6 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
              Limited stock
            </p>
            <h3 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-bold text-[color:var(--color-foreground)]">
              {heroRight.name}
            </h3>
            <p className="mt-2 text-sm text-[color:var(--color-muted)]">
              {planLabel(heroRight, ctx)} — payroll-deducted, no card needed at checkout.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href={withSalaryParam(`/product/${heroRight.id}`, ctx.salaryGhs)}
                className="inline-flex rounded-xl bg-[color:var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)]"
              >
                See plans
              </Link>
              <Link
                href={withSalaryParam(`/product/${heroRight.id}`, ctx.salaryGhs)}
                className="self-center text-sm font-medium underline underline-offset-4"
              >
                Compare totals
              </Link>
            </div>
            <div className="relative mt-8 aspect-[4/3] w-full">
              <Image
                src={heroRight.image}
                alt=""
                fill
                className="object-contain"
                sizes="(max-width:1024px) 100vw, 33vw"
                unoptimized
              />
            </div>
          </article>

          <div className="flex flex-col gap-4">
            <article className="flex flex-1 flex-row items-center gap-4 rounded-2xl border border-[color:var(--color-border)] bg-white p-5 shadow-sm">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
                  New on PayEasy
                </p>
                <h3 className="mt-1 font-[family-name:var(--font-heading)] text-lg font-bold leading-snug">
                  {compactTop.name}
                </h3>
                <p className="mt-1 text-sm text-[color:var(--color-muted)]">{planLabel(compactTop, ctx)}</p>
                <Link
                  href={withSalaryParam(`/product/${compactTop.id}`, ctx.salaryGhs)}
                  className="mt-3 inline-block text-sm font-semibold underline"
                >
                  See plans
                </Link>
              </div>
              <div className="relative h-28 w-28 shrink-0">
                <Image
                  src={compactTop.image}
                  alt=""
                  fill
                  className="object-contain"
                  sizes="112px"
                  unoptimized
                />
              </div>
            </article>

            <article className="flex flex-1 flex-row items-center gap-4 rounded-2xl border border-[color:var(--color-border)] bg-white p-5 shadow-sm">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
                  Popular this week
                </p>
                <h3 className="mt-1 font-[family-name:var(--font-heading)] text-lg font-bold leading-snug">
                  {compactBottom.name}
                </h3>
                <p className="mt-1 text-sm text-[color:var(--color-muted)]">{planLabel(compactBottom, ctx)}</p>
                <Link
                  href={withSalaryParam(`/product/${compactBottom.id}`, ctx.salaryGhs)}
                  className="mt-3 inline-block text-sm font-semibold underline"
                >
                  See plans
                </Link>
              </div>
              <div className="relative h-28 w-28 shrink-0">
                <Image
                  src={compactBottom.image}
                  alt=""
                  fill
                  className="object-contain"
                  sizes="112px"
                  unoptimized
                />
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
