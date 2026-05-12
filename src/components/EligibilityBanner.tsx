import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { evaluateProduct, type SalaryContext } from "@/lib/eligibility";
import { formatGhs } from "@/lib/format";

type Props = {
  products: Product[];
  ctx: SalaryContext;
};

/**
 * Renders one of three banners above a catalogue grid:
 *  1. Anonymous → CTA to set a salary hint via /eligibility
 *  2. Salary set, some eligible → green "X products match your limit"
 *  3. Salary set, none eligible → muted "Try a lower band" prompt
 */
export function EligibilityBanner({ products, ctx }: Props) {
  if (ctx.salaryGhs == null) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-[color:var(--color-border-strong)] bg-white px-4 py-3 text-sm text-[color:var(--color-muted)]">
        <span>
          Want to see which items fit your salary?{" "}
          <Link href="/eligibility" className="font-bold text-[color:var(--color-foreground)] underline">
            Estimate your credit limit
          </Link>{" "}
          to filter the catalogue automatically.
        </span>
        <Link
          href="/eligibility"
          className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)]"
        >
          Estimate now
        </Link>
      </div>
    );
  }

  const eligibleCount = products.filter(
    (p) => evaluateProduct(p, ctx).status === "approved",
  ).length;

  if (eligibleCount > 0) {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[color:var(--color-primary)] bg-[color:var(--color-primary)] px-4 py-3 text-sm text-white">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--color-accent)] text-[color:var(--color-primary)]" aria-hidden>
          ✓
        </span>
        <span className="flex-1">
          <strong>{eligibleCount} of {products.length}</strong> match your{" "}
          {formatGhs(ctx.creditLimitGhs)} credit limit and 30% deduction cap.
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-white/70">
          Eligible items shown first
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[color:var(--color-warning)] bg-[color:var(--color-warning-bg)] px-4 py-3 text-sm text-[color:var(--color-foreground)]">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--color-warning)] text-white" aria-hidden>
        !
      </span>
      <span className="flex-1">
        Nothing in this filter fits a {formatGhs(ctx.salaryGhs)} salary right now. Try a lower salary band, a
        different category, or browse our entry-level picks.
      </span>
      <Link
        href="/catalog"
        className="inline-flex items-center justify-center rounded-full border border-[color:var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-[color:var(--color-primary)] hover:bg-white"
      >
        Reset filters
      </Link>
    </div>
  );
}
