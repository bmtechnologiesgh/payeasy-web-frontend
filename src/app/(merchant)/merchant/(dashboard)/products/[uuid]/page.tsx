"use client";

import { MerchantProductForm } from "@/components/merchant/MerchantProductForm";
import { PageHeader } from "@/components/PageHeader";
import { getMerchantProduct } from "@/lib/merchant-products-api";
import { getAccessToken } from "@/lib/auth-token";
import { portalHref } from "@/lib/portal-path";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { MerchantProduct } from "@/lib/merchant-products-api";

export default function MerchantEditProductPage() {
  const params = useParams();
  const uuid = typeof params.uuid === "string" ? params.uuid : "";

  const [product, setProduct] = useState<MerchantProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token || !uuid) {
      setLoading(false);
      return;
    }

    getMerchantProduct(token, uuid)
      .then(({ product: p }) => {
        setProduct(p);
        setError(null);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Could not load product.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [uuid]);

  return (
    <main className="px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto mb-8 max-w-6xl">
        <PageHeader eyebrow="Merchant" title="Edit product" subtitle="Update listing details, photos, and plan prices." />
      </div>

      {loading ? <p className="mx-auto max-w-6xl text-sm text-[color:var(--color-muted)]">Loading product…</p> : null}

      {error ? (
        <div className="mx-auto max-w-6xl space-y-4">
          <div
            role="alert"
            className="rounded-xl border border-[color:var(--color-danger)]/25 bg-[color:var(--color-danger-bg)] px-4 py-3 text-sm text-[color:var(--color-danger)]"
          >
            {error}
          </div>
          <Link
            href={portalHref("merchant", "/products")}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[color:var(--color-primary)] px-5 text-sm font-semibold text-white"
          >
            Back to products
          </Link>
        </div>
      ) : null}

      {product && !loading ? <MerchantProductForm product={product} /> : null}
    </main>
  );
}
