"use client";

import Link from "next/link";
import { IconCart } from "@/components/marketplace/icons";
import { useCart } from "@/context/CartContext";

type Props = {
  compact?: boolean;
};

export function CartIconLink({ compact = false }: Props) {
  const { count, isReady } = useCart();

  const iconClass = compact ? "h-5 w-5 sm:h-6 sm:w-6" : "h-6 w-6";

  return (
    <Link
      href="/cart"
      className="relative flex min-w-[44px] flex-col items-center gap-0.5 rounded-lg px-1 py-1 text-[color:var(--color-foreground)] transition hover:bg-[color:var(--color-muted-bg)] sm:min-w-0 sm:px-2 sm:py-1"
    >
      <span className="relative flex h-8 w-8 items-center justify-center sm:h-9 sm:w-9">
        <IconCart className={iconClass} />
        {isReady && count > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--color-accent)] px-1 text-[10px] font-bold text-white">
            {count > 9 ? "9+" : count}
          </span>
        ) : null}
      </span>
      <span className="hidden text-[10px] font-medium leading-none sm:block sm:text-[11px]">Cart</span>
    </Link>
  );
}
