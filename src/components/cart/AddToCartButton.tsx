"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconCart } from "@/components/marketplace/icons";
import { useCart } from "@/context/CartContext";
import type { Product, TenureKey } from "@/lib/catalog";
import { withSalaryParam, type SalaryContext } from "@/lib/eligibility";

type Props = {
  product: Product;
  tenure: TenureKey;
  salaryCtx?: SalaryContext;
  variant?: "icon" | "button";
  goToCart?: boolean;
  className?: string;
  label?: string;
};

export function AddToCartButton({
  product,
  tenure,
  salaryCtx,
  variant = "icon",
  goToCart = false,
  className = "",
  label = "Add to cart",
}: Props) {
  const router = useRouter();
  const { addProduct } = useCart();
  const [feedback, setFeedback] = useState<string | null>(null);

  function handleClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const result = addProduct(product, tenure);
    if (result === "full") {
      setFeedback("Cart full");
      window.setTimeout(() => setFeedback(null), 2000);
      return;
    }

    if (goToCart) {
      router.push(withSalaryParam("/cart", salaryCtx?.salaryGhs ?? null));
      return;
    }

    setFeedback(result === "updated" ? "Updated" : "Added");
    window.setTimeout(() => setFeedback(null), 1500);
  }

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[color:var(--color-border-strong)] bg-white px-4 text-sm font-semibold text-[color:var(--color-foreground)] transition hover:bg-[color:var(--color-muted-bg)] ${className}`}
      >
        <IconCart className="h-4 w-4" />
        {feedback ?? label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={feedback ?? label}
      title={feedback ?? label}
      className={`relative rounded-md p-2 text-[color:var(--color-muted)] transition hover:bg-[color:var(--color-muted-bg)] hover:text-[color:var(--color-foreground)] ${className}`}
    >
      <IconCart className="h-5 w-5 sm:h-6 sm:w-6" />
      {feedback ? (
        <span className="absolute -top-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-[color:var(--color-foreground)] px-1.5 py-0.5 text-[9px] font-bold text-white">
          {feedback}
        </span>
      ) : null}
    </button>
  );
}
