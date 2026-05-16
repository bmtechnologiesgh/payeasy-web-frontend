"use client";

import Link from "next/link";
import { ProductImage } from "@/components/ProductImage";
import type { CartItem } from "@/lib/cart";
import { formatGhs } from "@/lib/format";
import { TENURE_LABELS, TENURES, withSalaryParam, type SalaryContext } from "@/lib/eligibility";

type Props = {
  item: CartItem;
  salaryCtx: SalaryContext;
  onRemove: (lineId: string) => void;
  onTenureChange: (lineId: string, tenure: CartItem["tenure"]) => void;
};

export function CartLineItem({ item, salaryCtx, onRemove, onTenureChange }: Props) {
  const availableTenures = TENURES.filter((tenure) => item.pricesGhs[tenure] != null);

  return (
    <article className="flex gap-4 rounded-2xl border border-[color:var(--color-border)] bg-white p-4 shadow-sm">
      <Link
        href={withSalaryParam(`/product/${item.productId}`, salaryCtx.salaryGhs)}
        className="product-media relative h-24 w-24 shrink-0 overflow-hidden rounded-xl"
      >
        <ProductImage
          src={item.image}
          alt={item.name}
          category={item.category}
          className="object-contain p-2"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--color-muted)]">
          {item.category}
        </p>
        <Link
          href={withSalaryParam(`/product/${item.productId}`, salaryCtx.salaryGhs)}
          className="mt-1 line-clamp-2 font-[family-name:var(--font-heading)] text-base font-bold text-[color:var(--color-foreground)] hover:underline"
        >
          {item.name}
        </Link>

        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="text-[11px] font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
            Plan
            <select
              value={item.tenure}
              onChange={(e) => onTenureChange(item.lineId, e.target.value as CartItem["tenure"])}
              className="mt-1 block w-full min-w-[9rem] rounded-lg border border-[color:var(--color-input-border)] bg-white px-3 py-2 text-sm font-medium text-[color:var(--color-foreground)]"
            >
              {availableTenures.map((tenure) => (
                <option key={tenure} value={tenure}>
                  {TENURE_LABELS[tenure]}
                </option>
              ))}
            </select>
          </label>

          <div className="text-sm">
            <p className="font-bold text-[color:var(--color-foreground)]">
              {formatGhs(Math.round(item.monthly))}
              <span className="ml-1 text-xs font-medium text-[color:var(--color-muted)]">/ mo</span>
            </p>
            <p className="text-[11px] text-[color:var(--color-muted)]">
              Total {formatGhs(Math.round(item.total))}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onRemove(item.lineId)}
          className="mt-3 text-xs font-semibold text-[color:var(--color-danger)] hover:underline"
        >
          Remove
        </button>
      </div>
    </article>
  );
}
