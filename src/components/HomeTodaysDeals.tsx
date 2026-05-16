import Link from "next/link";
import { ProductImage } from "@/components/ProductImage";
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
  products: Product[];
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

function monthlyFromSixMonth(product: Product): number {
  const total = product.pricesGhs.months6;
  if (total == null) {
    return product.fromPriceGhs ?? Number.POSITIVE_INFINITY;
  }
  return total / 6;
}

/** Pick up to four distinct products for the deals grid (prefers lower 6-mo monthly for hero left). */
function pickDealSlots(products: Product[]) {
  if (products.length === 0) {
    return null;
  }

  const sorted = [...products].sort((a, b) => monthlyFromSixMonth(a) - monthlyFromSixMonth(b));
  const heroLeft = sorted[0];
  const heroRight = sorted.find((p) => p.id !== heroLeft.id) ?? heroLeft;
  const rest = sorted.filter((p) => p.id !== heroLeft.id && p.id !== heroRight.id);
  const compactTop = rest[0] ?? heroRight;
  const compactBottom = rest[1] ?? compactTop;

  return { heroLeft, heroRight, compactTop, compactBottom };
}

export function HomeTodaysDeals({ products, salaryCtx }: Props) {
  const slots = pickDealSlots(products);
  if (!slots) {
    return null;
  }

  const { heroLeft, heroRight, compactTop, compactBottom } = slots;
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
          <DealHeroCard
            label="Lower monthly"
            product={heroLeft}
            ctx={ctx}
            blurb="— fee included. Spread it across 3, 4, 5 or 6 payroll cycles."
          />
          <DealHeroCard
            label="Limited stock"
            product={heroRight}
            ctx={ctx}
            blurb="— payroll-deducted, no card needed at checkout."
          />

          <div className="flex flex-col gap-4">
            <DealCompactCard label="New on PayEasy" product={compactTop} ctx={ctx} />
            <DealCompactCard label="Popular this week" product={compactBottom} ctx={ctx} />
          </div>
        </div>
      </div>
    </section>
  );
}

function DealHeroCard({
  label,
  product,
  ctx,
  blurb,
}: {
  label: string;
  product: Product;
  ctx: SalaryContext;
  blurb: string;
}) {
  return (
    <article className="flex flex-col rounded-2xl border border-[color:var(--color-border)] bg-white p-6 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-wide text-[color:var(--color-muted)]">{label}</p>
      <h3 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-bold text-[color:var(--color-foreground)]">
        {product.name}
      </h3>
      <p className="mt-2 text-sm text-[color:var(--color-muted)]">
        {planLabel(product, ctx)} {blurb}
      </p>
      <div className="mt-6 flex flex-wrap gap-4">
        <Link
          href={withSalaryParam(`/product/${product.id}`, ctx.salaryGhs)}
          className="inline-flex rounded-xl bg-[color:var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)]"
        >
          See plans
        </Link>
        <Link
          href={withSalaryParam(`/product/${product.id}`, ctx.salaryGhs)}
          className="self-center text-sm font-medium underline underline-offset-4"
        >
          Compare totals
        </Link>
      </div>
      <div className="product-media relative mt-8 aspect-[4/3] w-full">
        <ProductImage src={product.image} alt={product.name} category={product.category} sizes="(max-width:1024px) 100vw, 33vw" />
      </div>
    </article>
  );
}

function DealCompactCard({
  label,
  product,
  ctx,
}: {
  label: string;
  product: Product;
  ctx: SalaryContext;
}) {
  return (
    <article className="flex flex-1 flex-row items-center gap-4 rounded-2xl border border-[color:var(--color-border)] bg-white p-5 shadow-sm">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[color:var(--color-muted)]">{label}</p>
        <h3 className="mt-1 font-[family-name:var(--font-heading)] text-lg font-bold leading-snug">{product.name}</h3>
        <p className="mt-1 text-sm text-[color:var(--color-muted)]">{planLabel(product, ctx)}</p>
        <Link
          href={withSalaryParam(`/product/${product.id}`, ctx.salaryGhs)}
          className="mt-3 inline-block text-sm font-semibold underline"
        >
          See plans
        </Link>
      </div>
      <div className="product-media relative h-28 w-28 shrink-0">
        <ProductImage src={product.image} alt={product.name} category={product.category} sizes="112px" />
      </div>
    </article>
  );
}
