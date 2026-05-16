import Link from "next/link";
import { ProductImage } from "@/components/ProductImage";
import type { Product } from "@/lib/catalog";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import {
  IconEye,
  IconHeart,
} from "@/components/marketplace/icons";
import { formatGhs } from "@/lib/format";
import { slugify } from "@/lib/slug";
import {
  buildSalaryContext,
  evaluateProduct,
  type SalaryContext,
  withSalaryParam,
} from "@/lib/eligibility";

type Props = {
  product: Product;
  variant?: "grid" | "carousel";
  /** When provided, the card renders eligibility badge + locked overlay. */
  salaryCtx?: SalaryContext;
};

export function ProductCard({ product, variant = "grid", salaryCtx }: Props) {
  const ctx = salaryCtx ?? buildSalaryContext(null);
  const evaluation = evaluateProduct(product, ctx);
  const catSlug = slugify(product.category);

  const monthly = evaluation.bestPlan?.monthly ?? null;
  const months = evaluation.bestPlan?.months ?? null;
  const total = evaluation.bestPlan?.total ?? product.fromPriceGhs ?? null;

  const hrefBase = `/product/${product.id}`;
  const href = withSalaryParam(hrefBase, ctx.salaryGhs);

  const widthClass =
    variant === "carousel"
      ? "w-[min(100%,240px)] shrink-0 snap-start sm:w-[240px]"
      : "w-full";

  const isLocked = evaluation.status === "locked";
  const isPending = evaluation.status === "pending";
  const cartTenure =
    evaluation.bestPlan?.tenure ??
    evaluation.plans[evaluation.plans.length - 1]?.tenure ??
    "months6";

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-xl border border-[color:var(--color-border)] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${widthClass} ${
        isLocked ? "opacity-70" : ""
      }`}
    >
      <Link href={href} className="product-media relative block aspect-square">
        {product.deal ? (
          <span className="absolute left-2 top-2 z-[1] rounded-md bg-[color:var(--color-sale)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Deal
          </span>
        ) : null}
        {evaluation.status === "approved" ? (
          <span className="absolute right-2 top-2 z-[1] rounded-md bg-[color:var(--color-success)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm ring-1 ring-inset ring-white/25">
            Eligible
          </span>
        ) : null}
        {isPending ? (
          <span className="absolute right-2 top-2 z-[1] rounded-full bg-[color:var(--color-warning-bg)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[color:var(--color-warning)]">
            Tight fit
          </span>
        ) : null}
        {isLocked ? (
          <>
            <span className="absolute right-2 top-2 z-[1] rounded-full bg-[color:var(--color-danger-bg)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[color:var(--color-danger)]">
              Locked
            </span>
            <span className="absolute inset-0 z-[1] flex items-center justify-center text-2xl text-[color:var(--color-muted)]" aria-hidden>
              🔒
            </span>
          </>
        ) : null}
        <ProductImage
          src={product.image}
          alt={product.name}
          category={product.category}
          sizes="(max-width:768px) 50vw, 25vw"
          className="object-contain p-2 transition group-hover:scale-[1.02] sm:p-3"
        />
      </Link>
      {variant === "carousel" ? (
        <div className="flex items-center justify-between border-t border-[color:var(--color-border)] px-3 py-2">
          <AddToCartButton product={product} tenure={cartTenure} salaryCtx={ctx} />
          <Link
            href={href}
            className="rounded-md p-2 text-[color:var(--color-muted)] hover:bg-[color:var(--color-muted-bg)] hover:text-[color:var(--color-foreground)]"
            aria-label="Quick view"
          >
            <IconEye className="h-5 w-5" />
          </Link>
          <Link
            href={href}
            className="rounded-md p-2 text-[color:var(--color-muted)] hover:bg-[color:var(--color-muted-bg)] hover:text-[color:var(--color-foreground)]"
            aria-label="Wishlist"
          >
            <IconHeart className="h-5 w-5" />
          </Link>
          {evaluation.minSalaryGhs != null ? (
            <span className="rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[color:var(--color-muted)]">
              Min {formatGhs(evaluation.minSalaryGhs)}
            </span>
          ) : null}
        </div>
      ) : null}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <Link
          href={`/catalog/${catSlug}`}
          className="text-[11px] font-medium uppercase tracking-wide text-[color:var(--color-muted)] hover:underline"
        >
          {product.category}
        </Link>
        <Link href={href} className="block min-h-[2.75rem]">
          <h3
            className="line-clamp-2 font-[family-name:var(--font-heading)] text-sm font-semibold leading-snug text-[color:var(--color-foreground)] group-hover:underline md:text-base"
            title={product.name}
          >
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto flex flex-col gap-1 pt-1">
          {monthly != null && months != null ? (
            <p className="text-base font-bold text-[color:var(--color-foreground)]">
              {formatGhs(Math.round(monthly))}
              <span className="ml-1 text-xs font-medium text-[color:var(--color-muted)]">
                / mo × {months}
              </span>
            </p>
          ) : (
            <p className="text-base font-bold text-[color:var(--color-foreground)]">
              {formatGhs(total ?? undefined)}
            </p>
          )}
          {total != null ? (
            <p className="text-[11px] text-[color:var(--color-muted)]">
              Total {formatGhs(Math.round(total))} · fee included
            </p>
          ) : null}
          {evaluation.minSalaryGhs != null && variant !== "carousel" ? (
            <p className="text-[11px] text-[color:var(--color-muted)]">
              Min. salary {formatGhs(evaluation.minSalaryGhs)}
            </p>
          ) : null}
          {isLocked && evaluation.reason ? (
            <p className="text-[11px] font-semibold text-[color:var(--color-danger)]">
              {evaluation.reason}
            </p>
          ) : null}
          {isPending && evaluation.reason ? (
            <p className="text-[11px] font-semibold text-[color:var(--color-warning)]">
              {evaluation.reason}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
