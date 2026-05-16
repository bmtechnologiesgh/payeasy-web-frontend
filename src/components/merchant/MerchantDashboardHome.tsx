"use client";

import { MerchantStatCard } from "@/components/merchant/MerchantStatCard";
import { useMerchantDashboard } from "@/components/merchant/merchant-dashboard-context";
import { MERCHANT_QUICK_ACTIONS } from "@/components/merchant/merchant-nav";
import { StatusBadge, formatMerchantStatus } from "@/components/merchant/StatusBadge";
import { getAccessToken } from "@/lib/auth-token";
import {
  fetchMerchantProductStats,
  merchantProfileCompletionPercent,
  type MerchantProductStats,
} from "@/lib/merchant-dashboard-stats";
import { listMerchantProducts, type MerchantProduct } from "@/lib/merchant-products-api";
import { productDisplayImageUrl } from "@/lib/merchant-product-images";
import { formatGhs } from "@/lib/format";
import { portalHref } from "@/lib/portal-path";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) {
    return "Good morning";
  }
  if (hour < 17) {
    return "Good afternoon";
  }
  return "Good evening";
}

function ProductRow({ product }: { product: MerchantProduct }) {
  const thumb = productDisplayImageUrl(product);

  return (
    <Link
      href={portalHref("merchant", `/products/${product.uuid}`)}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-[color:var(--color-muted-bg)]"
    >
      <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-[color:var(--color-muted-bg)]">
        {thumb ? (
          <Image src={thumb} alt="" fill className="object-cover" unoptimized sizes="44px" />
        ) : (
          <span className="flex size-full items-center justify-center text-[10px] font-bold text-[color:var(--color-muted)]">
            {product.category.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[color:var(--color-foreground)]">{product.name}</p>
        <p className="text-xs text-[color:var(--color-muted)]">
          {[
            [product.brand, product.model].filter(Boolean).join(" · "),
            product.category,
            formatMerchantStatus(product.status),
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      <div className="shrink-0 text-right">
        {product.from_price_ghs != null ? (
          <p className="text-sm font-bold text-[color:var(--color-foreground)]">
            From {formatGhs(product.from_price_ghs)}
          </p>
        ) : (
          <p className="text-xs text-[color:var(--color-muted)]">No price</p>
        )}
      </div>
    </Link>
  );
}

export function MerchantDashboardHome() {
  const { user } = useMerchantDashboard();
  const [stats, setStats] = useState<MerchantProductStats | null>(null);
  const [recent, setRecent] = useState<MerchantProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const merchant = user?.merchant;
  const profilePct = merchantProfileCompletionPercent(merchant ?? null);
  const shopName = merchant?.trading_name?.trim() || "your shop";

  useEffect(() => {
    const token = getAccessToken();
    if (!token || !merchant) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    Promise.all([fetchMerchantProductStats(token), listMerchantProducts(token, { per_page: 5 })])
      .then(([productStats, list]) => {
        setStats(productStats);
        setRecent(list.products);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Could not load dashboard data.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [merchant]);

  if (!user) {
    return null;
  }

  const showProfileCta = !merchant || profilePct < 100 || merchant.status === "draft";

  return (
    <div className="space-y-8 px-4 py-8 sm:px-6 sm:py-10">
      <section className="relative overflow-hidden rounded-3xl border border-[color:var(--color-border-strong)] bg-[color:var(--color-primary)] px-6 py-8 text-white shadow-md sm:px-8 sm:py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-white/5"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 right-1/4 size-72 rounded-full bg-[color:var(--color-accent)]/10"
        />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">Merchant portal</p>
            <h1 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-bold sm:text-4xl">
              {greeting()}, {user.full_name.split(" ")[0] || "there"}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/80">
              {merchant
                ? `Manage ${shopName} on PayEasy — products, orders, and your shop profile in one place.`
                : "Link your business profile to start listing products on PayEasy."}
            </p>
          </div>
          {merchant ? <StatusBadge status={merchant.status} className="shrink-0 ring-white/20" /> : null}
        </div>
        <div className="relative mt-6 flex flex-wrap gap-3">
          {merchant ? (
            <>
              <Link
                href={portalHref("merchant", "/products/new")}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[color:var(--color-accent)] px-5 text-sm font-semibold text-[color:var(--color-foreground)] transition hover:bg-[color:var(--color-accent-hover)]"
              >
                Add product
              </Link>
              <Link
                href={portalHref("merchant", "/products")}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/30 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                View catalogue
              </Link>
            </>
          ) : (
            <Link
              href={portalHref("merchant", "/profile")}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[color:var(--color-accent)] px-5 text-sm font-semibold text-[color:var(--color-foreground)] transition hover:bg-[color:var(--color-accent-hover)]"
            >
              Set up shop profile
            </Link>
          )}
        </div>
      </section>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-[color:var(--color-danger)]/25 bg-[color:var(--color-danger-bg)] px-4 py-3 text-sm text-[color:var(--color-danger)]"
        >
          {error}
        </div>
      ) : null}

      {merchant ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MerchantStatCard
            label="Total products"
            value={loading ? "—" : (stats?.total ?? 0)}
            hint="All listings"
            href={portalHref("merchant", "/products")}
          />
          <MerchantStatCard
            label="Published"
            value={loading ? "—" : (stats?.published ?? 0)}
            hint="Live on PayEasy"
            tone="success"
            href={portalHref("merchant", "/products?status=published")}
          />
          <MerchantStatCard
            label="Drafts"
            value={loading ? "—" : (stats?.draft ?? 0)}
            hint="Not yet live"
            tone="warning"
            href={portalHref("merchant", "/products?status=draft")}
          />
          <MerchantStatCard
            label="Archived"
            value={loading ? "—" : (stats?.archived ?? 0)}
            hint="Off catalogue"
            tone="muted"
            href={portalHref("merchant", "/products?status=archived")}
          />
        </section>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <article className="rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 shadow-sm">
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[color:var(--color-foreground)]">
            Workspace
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {MERCHANT_QUICK_ACTIONS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex h-full flex-col rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-app)]/50 p-4 transition hover:border-[color:var(--color-primary)]/30 hover:bg-white hover:shadow-sm"
                >
                  <span className="font-[family-name:var(--font-heading)] font-bold text-[color:var(--color-foreground)]">
                    {item.label}
                  </span>
                  {item.description ? (
                    <span className="mt-1 text-xs text-[color:var(--color-muted)]">{item.description}</span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </article>

        <aside className="space-y-6">
          {showProfileCta ? (
            <article className="rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 shadow-sm">
              <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[color:var(--color-foreground)]">
                Shop profile
              </h2>
              <p className="mt-2 text-sm text-[color:var(--color-muted)]">
                {merchant
                  ? "Complete verification, shipping, and payout details so buyers can trust your store."
                  : "Add your trading name, country, and fulfilment details to go live."}
              </p>
              {merchant ? (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-[color:var(--color-muted)]">
                    <span>Profile completeness</span>
                    <span>{profilePct}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[color:var(--color-muted-bg)]">
                    <div
                      className="h-full rounded-full bg-[color:var(--color-primary)] transition-all"
                      style={{ width: `${profilePct}%` }}
                    />
                  </div>
                </div>
              ) : null}
              <Link
                href={portalHref("merchant", "/profile")}
                className="mt-5 inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-[color:var(--color-primary)] px-5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)]"
              >
                {merchant ? "Continue profile" : "Open shop profile"}
              </Link>
            </article>
          ) : null}

          <article className="rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 shadow-sm">
            <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[color:var(--color-foreground)]">
              Account
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-[color:var(--color-border)] pb-3">
                <dt className="text-[color:var(--color-muted)]">Signed in</dt>
                <dd className="truncate text-right font-medium text-[color:var(--color-foreground)]">{user.email}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-[color:var(--color-border)] pb-3">
                <dt className="text-[color:var(--color-muted)]">Roles</dt>
                <dd className="text-right font-semibold text-[color:var(--color-foreground)]">
                  {user.roles.join(", ") || "—"}
                </dd>
              </div>
              {merchant ? (
                <>
                  <div className="flex justify-between gap-4 border-b border-[color:var(--color-border)] pb-3">
                    <dt className="text-[color:var(--color-muted)]">Merchant ID</dt>
                    <dd className="font-mono text-sm font-semibold text-[color:var(--color-foreground)]">
                      {merchant.merchant_code}
                    </dd>
                  </div>
                  {merchant.slug ? (
                    <div className="flex justify-between gap-4">
                      <dt className="text-[color:var(--color-muted)]">Shop URL</dt>
                      <dd className="max-w-[160px] truncate font-mono text-xs text-[color:var(--color-foreground)]">
                        {merchant.slug}
                      </dd>
                    </div>
                  ) : null}
                </>
              ) : null}
            </dl>
          </article>
        </aside>
      </section>

      {merchant ? (
        <section className="rounded-2xl border border-[color:var(--color-border-strong)] bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--color-border)] px-6 py-4">
            <div>
              <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[color:var(--color-foreground)]">
                Recently updated
              </h2>
              <p className="text-xs text-[color:var(--color-muted)]">Latest changes in your catalogue</p>
            </div>
            <Link
              href={portalHref("merchant", "/products")}
              className="text-sm font-semibold text-[color:var(--color-primary)] hover:underline"
            >
              View all
            </Link>
          </div>
          {loading ? (
            <p className="px-6 py-8 text-sm text-[color:var(--color-muted)]">Loading products…</p>
          ) : recent.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm text-[color:var(--color-muted)]">No products yet.</p>
              <Link
                href={portalHref("merchant", "/products/new")}
                className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-full bg-[color:var(--color-primary)] px-5 text-sm font-semibold text-white"
              >
                Add your first product
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-[color:var(--color-border)] px-3 py-2">
              {recent.map((product) => (
                <li key={product.uuid}>
                  <ProductRow product={product} />
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}
