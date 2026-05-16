"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import type { Product, TenureKey } from "@/lib/catalog";
import { formatGhs } from "@/lib/format";
import { buildSalaryContext, withSalaryParam } from "@/lib/eligibility";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

type Props = {
  product: Product;
  tenure: TenureKey;
  monthly: number;
  months: number;
  total: number;
  salaryGhs: number | null;
  locked: boolean;
};

export function ProductStickyPurchaseBar({
  product,
  tenure,
  monthly,
  months,
  total,
  salaryGhs,
  locked,
}: Props) {
  const router = useRouter();
  const { addProduct } = useCart();

  function goToCheckout() {
    addProduct(product, tenure);
    router.push(withSalaryParam("/checkout", salaryGhs));
  }

  return (
    <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] z-40 border-t border-[color:var(--color-border)] bg-white/95 px-4 py-3 backdrop-blur md:bottom-6 md:left-auto md:right-6 md:w-[min(100%,24rem)] md:rounded-2xl md:border md:border-[color:var(--color-border-strong)] md:px-4 md:py-4 md:shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-lg font-bold text-[color:var(--color-foreground)]">
            {formatGhs(Math.round(monthly))} / mo
          </p>
          <p className="text-[11px] text-[color:var(--color-muted)]">
            × {months} months · total {formatGhs(Math.round(total))}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <AddToCartButton
            product={product}
            tenure={tenure}
            salaryCtx={buildSalaryContext(salaryGhs)}
            variant="button"
            label="Add"
            className="!min-h-10 !px-3 !py-2 text-xs"
          />
          <button
            type="button"
            disabled={locked}
            onClick={goToCheckout}
            className={`inline-flex h-12 items-center justify-center rounded-xl px-4 text-sm font-semibold transition ${
              locked
                ? "bg-[color:var(--color-muted-bg)] text-[color:var(--color-muted)]"
                : "bg-[color:var(--color-primary)] text-white hover:bg-[color:var(--color-primary-hover)]"
            }`}
          >
            {locked ? "Not eligible" : "Checkout →"}
          </button>
        </div>
      </div>
    </div>
  );
}
