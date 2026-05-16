"use client";

import { imageSlotsToPayload } from "@/lib/merchant-product-images";
import { formatGhs } from "@/lib/format";
import type { MerchantProduct } from "@/lib/merchant-products-api";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type Props = {
  name: string;
  brand?: string;
  model?: string;
  description?: string;
  category: string;
  slots: string[];
  displaySlot: number;
  fromPriceGhs?: number | null;
  savedProduct?: MerchantProduct | null;
};

function brandModelLine(brand: string, model: string, saved?: MerchantProduct | null): string | null {
  const b = brand.trim() || saved?.brand?.trim() || "";
  const m = model.trim() || saved?.model?.trim() || "";
  if (b && m) {
    return `${b} · ${m}`;
  }
  return b || m || null;
}

export function MerchantProductDetailPreview({
  name,
  brand = "",
  model = "",
  description = "",
  category,
  slots,
  displaySlot,
  fromPriceGhs,
  savedProduct,
}: Props) {
  const { images, display_image_index } = useMemo(
    () => imageSlotsToPayload(slots, displaySlot),
    [slots, displaySlot],
  );

  const [activeIndex, setActiveIndex] = useState(display_image_index);

  useEffect(() => {
    setActiveIndex(display_image_index);
  }, [display_image_index]);

  const gallery = images.length > 0 ? images : savedProduct?.images?.length ? savedProduct.images : [];

  const displayIdx =
    gallery.length > 0 ? Math.min(Math.max(0, activeIndex), gallery.length - 1) : 0;
  const mainUrl = gallery[displayIdx] ?? null;

  const price =
    fromPriceGhs ??
    savedProduct?.from_price_ghs ??
    null;

  const brandModel = brandModelLine(brand, model, savedProduct);
  const descriptionText = description.trim() || savedProduct?.description?.trim() || "";

  return (
    <aside className="rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-5 shadow-sm lg:sticky lg:top-28">
      <h2 className="font-[family-name:var(--font-heading)] text-sm font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
        Product preview
      </h2>
      <p className="mt-1 text-xs text-[color:var(--color-muted)]">How shoppers will see this listing.</p>

      <div className="product-media mt-4 aspect-square overflow-hidden rounded-xl">
        {mainUrl ? (
          <div className="relative h-full w-full">
            <Image src={mainUrl} alt={name || "Product"} fill className="object-contain p-4" unoptimized />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[color:var(--color-muted)]">
            Add a display image
          </div>
        )}
      </div>

      {gallery.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {gallery.map((url, i) => (
            <button
              key={`${url}-${i}`}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`relative size-14 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === displayIdx
                  ? "border-[color:var(--color-primary)]"
                  : "border-[color:var(--color-border)] opacity-80 hover:opacity-100"
              }`}
            >
              <Image src={url} alt="" fill className="object-contain p-1" unoptimized />
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-4 space-y-1">
        <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--color-primary)]">{category || "Category"}</p>
        <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[color:var(--color-foreground)]">
          {name.trim() || "Product name"}
        </h3>
        {brandModel ? (
          <p className="text-sm text-[color:var(--color-muted)]">{brandModel}</p>
        ) : null}
        {descriptionText ? (
          <p className="line-clamp-4 whitespace-pre-wrap text-sm text-[color:var(--color-muted)]">{descriptionText}</p>
        ) : null}
        {price != null ? (
          <p className="text-base font-bold text-[color:var(--color-foreground)]">From {formatGhs(price)}</p>
        ) : (
          <p className="text-sm text-[color:var(--color-muted)]">Set plan prices to show a from price.</p>
        )}
      </div>
    </aside>
  );
}
