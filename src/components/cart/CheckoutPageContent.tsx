"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ProductImage } from "@/components/ProductImage";
import { useCart } from "@/context/CartContext";
import { formatGhs } from "@/lib/format";
import {
  buildSalaryContext,
  evaluateCart,
  readSalaryFromSearchParams,
  TENURE_LABELS,
  withSalaryParam,
} from "@/lib/eligibility";

type Props = {
  salaryParam?: string;
};

function nextMonthLabel(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toLocaleDateString("en-GH", { month: "long", year: "numeric" });
}

export function CheckoutPageContent({ salaryParam }: Props) {
  const { items, isReady } = useCart();
  const salaryGhs = readSalaryFromSearchParams(salaryParam);
  const salaryCtx = buildSalaryContext(salaryGhs);
  const cartEval = useMemo(() => evaluateCart(items, salaryCtx), [items, salaryCtx]);

  const remainingCredit =
    salaryGhs != null ? Math.max(0, salaryCtx.creditLimitGhs - cartEval.totalPayable) : null;
  const utilisationPct =
    salaryCtx.creditLimitGhs > 0
      ? Math.min(100, Math.round((cartEval.totalPayable / salaryCtx.creditLimitGhs) * 100))
      : 0;

  if (!isReady) {
    return (
      <div className="mx-auto max-w-[860px] px-4 py-12 sm:px-6">
        <p className="text-sm text-[color:var(--color-muted)]">Loading checkout…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[860px] px-4 py-12 sm:px-6">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold">Checkout</h1>
        <p className="mt-2 text-sm text-[color:var(--color-muted)]">Your cart is empty.</p>
        <Link
          href={withSalaryParam("/catalog", salaryGhs)}
          className="mt-6 inline-flex rounded-xl bg-[color:var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white"
        >
          Browse catalogue
        </Link>
      </div>
    );
  }

  const canPlace = cartEval.status !== "locked";

  return (
    <div className="mx-auto max-w-[860px] px-4 py-8 pb-24 sm:px-6 md:pb-12">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-muted)]">
            Step 4 of 4 · Order summary
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-bold text-[color:var(--color-foreground)] sm:text-3xl">
            Confirm your order
          </h1>
          <p className="mt-2 text-sm text-[color:var(--color-muted)]">
            {items.length} {items.length === 1 ? "product" : "products"} · review combined payroll deductions.
          </p>
        </div>
        <Link
          href={withSalaryParam("/cart", salaryGhs)}
          className="rounded-full border border-[color:var(--color-border-strong)] px-3 py-1.5 text-xs font-semibold hover:bg-[color:var(--color-muted-bg)]"
        >
          ← Cart
        </Link>
      </header>

      <section className="space-y-3">
        {items.map((item) => (
          <article
            key={item.lineId}
            className="flex items-center gap-4 rounded-2xl border border-[color:var(--color-border)] bg-white p-4 shadow-sm"
          >
            <div className="product-media relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
              <ProductImage
                src={item.image}
                alt={item.name}
                category={item.category}
                className="object-contain p-1.5"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-semibold text-[color:var(--color-foreground)]">{item.name}</p>
              <p className="mt-0.5 text-xs text-[color:var(--color-muted)]">{TENURE_LABELS[item.tenure]} plan</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-bold">{formatGhs(Math.round(item.monthly))}/mo</p>
              <p className="text-[11px] text-[color:var(--color-muted)]">Total {formatGhs(Math.round(item.total))}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 shadow-sm">
        <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold">Order breakdown</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-[color:var(--color-muted)]">Combined total payable</dt>
            <dd className="text-base font-bold">{formatGhs(Math.round(cartEval.totalPayable))}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[color:var(--color-muted)]">Combined monthly deduction</dt>
            <dd className="font-semibold">
              {formatGhs(Math.round(cartEval.totalMonthly))} / mo
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[color:var(--color-muted)]">Deduction start</dt>
            <dd>{nextMonthLabel()}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[color:var(--color-muted)]">Payment method</dt>
            <dd className="font-semibold">Payroll deduction</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[color:var(--color-muted)]">Employer</dt>
            <dd className="text-[color:var(--color-muted)]">{salaryCtx.employer}</dd>
          </div>
        </dl>
      </section>

      {cartEval.reasons.length > 0 ? (
        <section className="mt-4 rounded-xl border border-[color:var(--color-danger)]/30 bg-[color:var(--color-danger-bg)] px-4 py-3 text-sm text-[color:var(--color-danger)]">
          <ul className="space-y-1">
            {cartEval.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {salaryGhs != null ? (
        <section className="mt-4 rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-5 shadow-sm">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">
            Credit after this order
          </h2>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[color:var(--color-muted-bg)]">
            <div
              className="h-full bg-[color:var(--color-primary)]"
              style={{ width: `${utilisationPct}%` }}
              aria-hidden
            />
          </div>
          <div className="mt-3 flex justify-between text-sm">
            <span className="text-[color:var(--color-muted)]">Available now</span>
            <span className="font-bold">
              {formatGhs(salaryCtx.creditLimitGhs)} → {formatGhs(remainingCredit ?? 0)}
            </span>
          </div>
        </section>
      ) : (
        <section className="mt-4 rounded-2xl border border-dashed border-[color:var(--color-border-strong)] bg-white p-5 text-sm text-[color:var(--color-muted)]">
          <Link href="/eligibility" className="font-semibold underline">
            Tell us your salary
          </Link>{" "}
          to preview credit utilisation for this cart.
        </section>
      )}

      <section className="mt-4 rounded-2xl border border-[color:var(--color-border)] bg-white p-5 shadow-sm">
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" defaultChecked disabled className="mt-0.5 h-4 w-4" />
          <span>
            I authorise PayEasy to deduct{" "}
            <strong>{formatGhs(Math.round(cartEval.totalMonthly))}/mo</strong> from my salary for the plans
            listed above, in accordance with PayEasy terms and my employer&apos;s mandate.
          </span>
        </label>
      </section>

      <div className="mt-6">
        <button
          type="button"
          disabled={!canPlace}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-[color:var(--color-accent)] px-6 py-4 text-base font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Place order →
        </button>
        {!canPlace ? (
          <p className="mt-2 text-center text-xs font-semibold text-[color:var(--color-danger)]">
            Adjust your cart or salary band before placing this order.
          </p>
        ) : (
          <p className="mt-2 text-center text-xs text-[color:var(--color-muted)]">
            Order placement will connect to PayEasy when the API is live.
          </p>
        )}
      </div>
    </div>
  );
}
