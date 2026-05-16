"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { useCart } from "@/context/CartContext";
import { formatGhs } from "@/lib/format";
import {
  buildSalaryContext,
  evaluateCart,
  readSalaryFromSearchParams,
  withSalaryParam,
} from "@/lib/eligibility";

type Props = {
  salaryParam?: string;
};

export function CartPageContent({ salaryParam }: Props) {
  const { items, isReady, removeLine, updateTenure } = useCart();
  const salaryGhs = readSalaryFromSearchParams(salaryParam);
  const salaryCtx = buildSalaryContext(salaryGhs);
  const cartEval = useMemo(() => evaluateCart(items, salaryCtx), [items, salaryCtx]);

  const checkoutHref = withSalaryParam("/checkout", salaryGhs);
  const canCheckout = items.length > 0 && cartEval.status !== "locked";

  if (!isReady) {
    return (
      <div className="mx-auto max-w-[860px] px-4 py-12 sm:px-6">
        <p className="text-sm text-[color:var(--color-muted)]">Loading your cart…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[860px] px-4 py-12 sm:px-6">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[color:var(--color-foreground)]">
          Your cart
        </h1>
        <p className="mt-2 text-sm text-[color:var(--color-muted)]">No items yet. Browse the catalogue to build a plan.</p>
        <Link
          href={withSalaryParam("/catalog", salaryGhs)}
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-[color:var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[color:var(--color-primary-hover)]"
        >
          Browse catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[860px] px-4 py-8 pb-28 sm:px-6 md:pb-12">
      <header className="mb-6">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[color:var(--color-foreground)]">
          Your cart
        </h1>
        <p className="mt-2 text-sm text-[color:var(--color-muted)]">
          {items.length} {items.length === 1 ? "item" : "items"} · payroll-deducted instalments
        </p>
      </header>

      <div className="space-y-4">
        {items.map((item) => (
          <CartLineItem
            key={item.lineId}
            item={item}
            salaryCtx={salaryCtx}
            onRemove={removeLine}
            onTenureChange={updateTenure}
          />
        ))}
      </div>

      <aside className="mt-8 rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 shadow-sm">
        <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[color:var(--color-foreground)]">
          Cart summary
        </h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-[color:var(--color-muted)]">Combined monthly</dt>
            <dd className="font-bold text-[color:var(--color-foreground)]">
              {formatGhs(Math.round(cartEval.totalMonthly))} / mo
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[color:var(--color-muted)]">Combined total</dt>
            <dd className="font-bold text-[color:var(--color-foreground)]">
              {formatGhs(Math.round(cartEval.totalPayable))}
            </dd>
          </div>
          {salaryGhs != null ? (
            <>
              <div className="flex justify-between gap-4">
                <dt className="text-[color:var(--color-muted)]">30% deduction cap</dt>
                <dd className="font-medium">{formatGhs(salaryCtx.monthlyCapGhs)}/mo</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[color:var(--color-muted)]">Credit limit</dt>
                <dd className="font-medium">{formatGhs(salaryCtx.creditLimitGhs)}</dd>
              </div>
            </>
          ) : null}
        </dl>

        {cartEval.reasons.length > 0 ? (
          <ul className="mt-4 space-y-2 text-xs font-semibold text-[color:var(--color-danger)]">
            {cartEval.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        ) : null}

        {salaryGhs == null ? (
          <p className="mt-4 text-sm text-[color:var(--color-muted)]">
            <Link href="/eligibility" className="font-semibold text-[color:var(--color-primary)] underline">
              Check eligibility
            </Link>{" "}
            to see whether this cart fits your salary cap and credit limit.
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={checkoutHref}
            aria-disabled={!canCheckout}
            className={`inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl px-5 text-sm font-semibold transition ${
              canCheckout
                ? "bg-[color:var(--color-primary)] text-white hover:bg-[color:var(--color-primary-hover)]"
                : "pointer-events-none bg-[color:var(--color-muted-bg)] text-[color:var(--color-muted)]"
            }`}
          >
            Proceed to checkout
          </Link>
          <Link
            href={withSalaryParam("/catalog", salaryGhs)}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[color:var(--color-border-strong)] bg-white px-5 text-sm font-semibold text-[color:var(--color-foreground)] hover:bg-[color:var(--color-muted-bg)]"
          >
            Continue shopping
          </Link>
        </div>
      </aside>
    </div>
  );
}
