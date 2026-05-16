"use client";

import { useMerchantDashboard } from "@/components/merchant/merchant-dashboard-context";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/merchant/StatusBadge";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { listMerchantProducts, type MerchantProduct } from "@/lib/merchant-products-api";
import { productDisplayImageUrl } from "@/lib/merchant-product-images";
import { getAccessToken } from "@/lib/auth-token";
import { formatGhs } from "@/lib/format";
import { portalHref } from "@/lib/portal-path";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

const STATUS_FILTERS = [
  { value: "", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
] as const;

function ProductThumb({ product }: { product: MerchantProduct }) {
  const thumbUrl = productDisplayImageUrl(product);
  if (thumbUrl) {
    return (
      <div className="product-media relative size-12 shrink-0 overflow-hidden rounded-lg">
        <Image src={thumbUrl} alt="" fill className="object-cover" unoptimized />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[color:var(--color-muted-bg)] text-xs font-bold text-[color:var(--color-muted)]"
    >
      {product.category.slice(0, 2).toUpperCase()}
    </div>
  );
}

function MerchantProductsPageContent() {
  const { user } = useMerchantDashboard();
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") ?? "";
  const [products, setProducts] = useState<MerchantProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const load = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await listMerchantProducts(token, {
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        page,
        per_page: 20,
      });
      setProducts(result.products);
      setCategories(result.categories);
      setLastPage(result.meta.last_page);
      setTotal(result.meta.count);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load products.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryFilter, page]);

  useEffect(() => {
    if (!user?.merchant) {
      setLoading(false);
      return;
    }
    void load();
  }, [user?.merchant, load]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, categoryFilter]);

  if (!user) {
    return null;
  }

  const hasMerchant = Boolean(user.merchant);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          eyebrow="Merchant"
          title="Products"
          subtitle="Manage catalogue listings for your shop — draft, publish, and set PayEasy plan prices."
        />
        {hasMerchant ? (
          <Link
            href={portalHref("merchant", "/products/new")}
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full bg-[color:var(--color-primary)] px-5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)]"
          >
            Add product
          </Link>
        ) : null}
      </div>

      {!hasMerchant ? (
        <p className="rounded-2xl border border-[color:var(--color-border-strong)] bg-white px-5 py-4 text-sm text-[color:var(--color-muted)] shadow-sm">
          Link a merchant profile before you can manage products.
        </p>
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end">
            <div className="min-w-0 flex-1 sm:min-w-[200px]">
              <label htmlFor="product-search" className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
                Search
              </label>
              <input
                id="product-search"
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Name, brand, model, description, SKU…"
                className="mt-2 w-full rounded-xl border border-[color:var(--color-input-border)] bg-white px-4 py-2.5 text-sm text-[color:var(--color-foreground)] outline-none ring-[color:var(--color-focus)] focus:ring-2"
              />
            </div>
            <div className="w-full sm:w-44">
              <SearchableSelect
                id="status-filter"
                label="Status"
                value={statusFilter}
                onChange={setStatusFilter}
                options={STATUS_FILTERS.map((f) => ({ value: f.value, label: f.label }))}
              />
            </div>
            <div className="w-full sm:w-48">
              <SearchableSelect
                id="category-filter"
                label="Category"
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[
                  { value: "", label: "All categories" },
                  ...categories.map((c) => ({ value: c, label: c })),
                ]}
                placeholder="All categories"
                searchPlaceholder="Search categories…"
              />
            </div>
          </div>

          {error ? (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-[color:var(--color-danger)]/25 bg-[color:var(--color-danger-bg)] px-4 py-3 text-sm text-[color:var(--color-danger)]"
            >
              {error}
            </div>
          ) : null}

          {loading ? (
            <p className="text-sm text-[color:var(--color-muted)]">Loading products…</p>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[color:var(--color-border-strong)] bg-white px-6 py-12 text-center shadow-sm">
              <p className="font-[family-name:var(--font-heading)] text-lg font-bold text-[color:var(--color-foreground)]">
                No products yet
              </p>
              <p className="mt-2 text-sm text-[color:var(--color-muted)]">
                {search || statusFilter || categoryFilter
                  ? "Try adjusting your filters."
                  : "Create your first listing to start selling on PayEasy."}
              </p>
              {!search && !statusFilter && !categoryFilter ? (
                <Link
                  href={portalHref("merchant", "/products/new")}
                  className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-full bg-[color:var(--color-primary)] px-5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)]"
                >
                  Add product
                </Link>
              ) : null}
            </div>
          ) : (
            <>
              <p className="mb-3 text-sm text-[color:var(--color-muted)]">
                {total} {total === 1 ? "product" : "products"}
              </p>
              <div className="overflow-hidden rounded-2xl border border-[color:var(--color-border-strong)] bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[960px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-[color:var(--color-border)] bg-[color:var(--color-muted-bg)]/60 text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
                        <th className="px-4 py-3 font-bold">Product</th>
                        <th className="min-w-[200px] max-w-xs px-4 py-3 font-bold">Details</th>
                        <th className="px-4 py-3 font-bold">Category</th>
                        <th className="px-4 py-3 font-bold">Status</th>
                        <th className="px-4 py-3 font-bold">From price</th>
                        <th className="px-4 py-3 font-bold">Stock</th>
                        <th className="px-4 py-3 font-bold">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[color:var(--color-border)]">
                      {products.map((product) => (
                        <tr key={product.uuid} className="transition hover:bg-[color:var(--color-muted-bg)]/40">
                          <td className="px-4 py-3">
                            <Link
                              href={portalHref("merchant", `/products/${product.uuid}`)}
                              className="flex items-center gap-3 font-semibold text-[color:var(--color-foreground)] hover:text-[color:var(--color-primary)]"
                            >
                              <ProductThumb product={product} />
                              <span className="min-w-0">
                                <span className="line-clamp-2">{product.name}</span>
                                {product.brand || product.model ? (
                                  <span className="mt-0.5 block text-xs font-normal text-[color:var(--color-muted)]">
                                    {[product.brand, product.model].filter(Boolean).join(" · ")}
                                  </span>
                                ) : null}
                                {product.is_deal ? (
                                  <span className="mt-0.5 block text-xs font-normal text-[color:var(--color-sale)]">
                                    Deal
                                  </span>
                                ) : null}
                              </span>
                            </Link>
                          </td>
                          <td className="max-w-xs px-4 py-3 align-top text-[color:var(--color-muted)]">
                            {product.description?.trim() ? (
                              <p className="line-clamp-4 whitespace-pre-wrap text-xs leading-relaxed">
                                {product.description.trim()}
                              </p>
                            ) : (
                              <span className="text-xs">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-[color:var(--color-muted)]">{product.category}</td>
                          <td className="px-4 py-3">
                            <StatusBadge status={product.status} />
                          </td>
                          <td className="px-4 py-3 font-medium text-[color:var(--color-foreground)]">
                            {product.from_price_ghs != null ? formatGhs(product.from_price_ghs) : "—"}
                          </td>
                          <td className="px-4 py-3 text-[color:var(--color-muted)]">
                            {product.stock_quantity ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              href={portalHref("merchant", `/products/${product.uuid}`)}
                              className="text-sm font-semibold text-[color:var(--color-primary)] hover:underline"
                            >
                              Edit
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {lastPage > 1 ? (
                <div className="mt-4 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    disabled={page <= 1 || loading}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-full border border-[color:var(--color-border-strong)] bg-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-[color:var(--color-muted)]">
                    Page {page} of {lastPage}
                  </span>
                  <button
                    type="button"
                    disabled={page >= lastPage || loading}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-full border border-[color:var(--color-border-strong)] bg-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </>
          )}
        </>
      )}
    </main>
  );
}

export default function MerchantProductsPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <p className="text-sm text-[color:var(--color-muted)]">Loading products…</p>
        </main>
      }
    >
      <MerchantProductsPageContent />
    </Suspense>
  );
}
