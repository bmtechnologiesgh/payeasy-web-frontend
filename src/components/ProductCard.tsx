import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/catalog";
import {
  IconCart,
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

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function ratingFor(id: string): { stars: number; reviews: number } {
  const h = hashId(id);
  const stars = 4 + (h % 2);
  const reviews = (h % 180) + 1;
  return { stars, reviews };
}

type Props = {
  product: Product;
  variant?: "grid" | "carousel";
  showRating?: boolean;
  /** When provided, the card renders eligibility badge + locked overlay. */
  salaryCtx?: SalaryContext;
};

export function ProductCard({
  product,
  variant = "grid",
  showRating = false,
  salaryCtx,
}: Props) {
  const ctx = salaryCtx ?? buildSalaryContext(null);
  const evaluation = evaluateProduct(product, ctx);
  const catSlug = slugify(product.category);
  const { stars, reviews } = ratingFor(product.id);

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

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-xl border border-[color:var(--color-border)] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${widthClass} ${
        isLocked ? "opacity-70" : ""
      }`}
    >
      <Link href={href} className="relative block aspect-square bg-[color:var(--color-muted-bg)]">
        {product.deal ? (
          <span className="absolute left-2 top-2 z-[1] rounded-md bg-[color:var(--color-sale)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Deal
          </span>
        ) : null}
        {evaluation.status === "approved" ? (
          <span className="absolute right-2 top-2 z-[1] rounded-full bg-[color:var(--color-success-bg)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[color:var(--color-success)]">
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
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width:768px) 50vw, 25vw"
          className="object-contain p-4 transition group-hover:scale-[1.02]"
          unoptimized
        />
      </Link>
      {variant === "carousel" ? (
        <div className="flex items-center justify-between border-t border-[color:var(--color-border)] px-3 py-2">
          <Link
            href={href}
            className="rounded-md p-2 text-[color:var(--color-muted)] hover:bg-[color:var(--color-muted-bg)] hover:text-[color:var(--color-foreground)]"
            aria-label="Add to cart"
          >
            <IconCart className="h-5 w-5" />
          </Link>
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
        <Link href={href}>
          <h3 className="font-[family-name:var(--font-heading)] text-sm font-semibold leading-snug text-[color:var(--color-foreground)] group-hover:underline md:text-base">
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
        {showRating ? (
          <p className="flex items-center gap-1 text-xs text-[color:var(--color-muted)]">
            <span className="text-[color:var(--color-stars)]" aria-hidden>
              {"★".repeat(stars)}
              {"☆".repeat(5 - stars)}
            </span>
            <span>({reviews})</span>
          </p>
        ) : null}
      </div>
    </article>
  );
}
