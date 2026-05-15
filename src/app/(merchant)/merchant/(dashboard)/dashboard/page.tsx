"use client";

import { MerchantHeader } from "@/components/merchant/MerchantHeader";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/merchant/StatusBadge";
import { clearAccessToken, getAccessToken } from "@/lib/auth-token";
import { me } from "@/lib/merchant-api";
import { portalHref } from "@/lib/portal-path";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type DashboardUser = Awaited<ReturnType<typeof me>>;

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace(portalHref("merchant", "/login"));
      return;
    }

    me(token)
      .then(setUser)
      .catch(() => {
        setError("Unable to load your session. Please sign in again.");
        clearAccessToken();
      });
  }, [router]);

  const merchant = user?.merchant;

  return (
    <div className="min-h-screen bg-[color:var(--color-app)]">
      <MerchantHeader tradingName={merchant?.trading_name} />

      <main className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6">
        {!user && !error ? (
          <p className="text-sm text-[color:var(--color-muted)]">Loading dashboard…</p>
        ) : null}

        {error ? (
          <div className="mx-auto max-w-lg space-y-4">
            <div
              role="alert"
              className="rounded-xl border border-[color:var(--color-danger)]/25 bg-[color:var(--color-danger-bg)] px-4 py-3 text-sm text-[color:var(--color-danger)]"
            >
              {error}
            </div>
            <button
              type="button"
              onClick={() => router.push(portalHref("merchant", "/login"))}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[color:var(--color-primary)] px-5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)]"
            >
              Go to sign in
            </button>
          </div>
        ) : null}

        {user ? (
          <div className="space-y-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <PageHeader
                eyebrow="For businesses"
                title={merchant?.trading_name ?? "Complete your shop profile"}
                subtitle={`Signed in as ${user.full_name}${user.email ? ` (${user.email})` : ""}.`}
              />
              <StatusBadge status={merchant?.status} />
            </div>

            <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <article className="space-y-4 rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[color:var(--color-foreground)]">
                    Onboarding
                  </h2>
                  <StatusBadge status={merchant?.status ?? "not_started"} />
                </div>
                <p className="text-sm text-[color:var(--color-muted)]">
                  You can access the dashboard immediately. We&apos;ll guide you through completing your
                  shop application next.
                </p>
                <button
                  type="button"
                  onClick={() => router.push(portalHref("merchant", "/onboarding"))}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[color:var(--color-primary)] px-5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)]"
                >
                  Continue onboarding
                </button>
              </article>

              <article className="rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 shadow-sm">
                <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[color:var(--color-foreground)]">
                  Account
                </h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-4 border-b border-[color:var(--color-border)] pb-3">
                    <dt className="text-[color:var(--color-muted)]">Roles</dt>
                    <dd className="text-right font-semibold text-[color:var(--color-foreground)]">
                      {user.roles.join(", ") || "none"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-[color:var(--color-border)] pb-3">
                    <dt className="text-[color:var(--color-muted)]">Business linked</dt>
                    <dd className="text-right font-semibold text-[color:var(--color-foreground)]">
                      {merchant ? "Yes" : "No"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[color:var(--color-muted)]">Shop ID</dt>
                    <dd className="truncate text-right font-mono text-xs text-[color:var(--color-foreground)]">
                      {merchant?.uuid ?? "—"}
                    </dd>
                  </div>
                </dl>
              </article>
            </section>

            <section>
              <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[color:var(--color-foreground)] md:text-2xl">
                Quick links
              </h2>
              <ul className="mt-4 divide-y divide-[color:var(--color-border)] rounded-2xl border border-[color:var(--color-border-strong)] bg-white shadow-sm">
                <li>
                  <span className="block px-5 py-4 text-sm font-semibold text-[color:var(--color-muted)]">
                    Orders
                    <span className="mt-0.5 block text-xs font-normal">Coming soon — view PayEasy orders for your store</span>
                  </span>
                </li>
                <li>
                  <span className="block px-5 py-4 text-sm font-semibold text-[color:var(--color-muted)]">
                    Catalogue
                    <span className="mt-0.5 block text-xs font-normal">Coming soon — manage products and pricing</span>
                  </span>
                </li>
                <li>
                  <span className="block px-5 py-4 text-sm font-semibold text-[color:var(--color-muted)]">
                    Payouts
                    <span className="mt-0.5 block text-xs font-normal">Coming soon — settlement and reconciliation</span>
                  </span>
                </li>
              </ul>
            </section>
          </div>
        ) : null}
      </main>
    </div>
  );
}
