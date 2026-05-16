"use client";

import { MerchantDashboardNavRail, MerchantSidebarNav } from "@/components/merchant/MerchantSidebarNav";
import { MerchantDashboardProvider, useMerchantDashboard } from "@/components/merchant/merchant-dashboard-context";
import { MerchantHeader } from "@/components/merchant/MerchantHeader";
import { portalHref } from "@/lib/portal-path";
import Link from "next/link";
import type { ReactNode } from "react";

function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <div className="h-40 animate-pulse rounded-3xl bg-[color:var(--color-muted-bg)]" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-[color:var(--color-muted-bg)]" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-2xl bg-[color:var(--color-muted-bg)]" />
        <div className="h-64 animate-pulse rounded-2xl bg-[color:var(--color-muted-bg)]" />
      </div>
    </div>
  );
}

function MerchantDashboardShellInner({ children }: { children: ReactNode }) {
  const { user, loading, error } = useMerchantDashboard();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[color:var(--color-app)]">
        <MerchantHeader />
        <MerchantDashboardNavRail />
        <div className="mx-auto w-full max-w-[1400px] flex-1">
          <div className="flex">
            <aside className="hidden w-64 shrink-0 border-r border-[color:var(--color-border)] bg-white/80 px-3 py-8 md:block" />
            <div className="min-w-0 flex-1">
              <DashboardLoadingSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-[color:var(--color-app)]">
        <MerchantHeader />
        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-10">
          <div
            role="alert"
            className="rounded-xl border border-[color:var(--color-danger)]/25 bg-[color:var(--color-danger-bg)] px-4 py-3 text-sm text-[color:var(--color-danger)]"
          >
            {error}
          </div>
          <Link
            href={portalHref("merchant", "/login")}
            className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-full bg-[color:var(--color-primary)] px-5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)]"
          >
            Go to sign in
          </Link>
        </main>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[color:var(--color-app)]">
      <MerchantHeader
        tradingName={user.merchant?.trading_name}
        userName={user.full_name}
        userEmail={user.email}
      />
      <MerchantDashboardNavRail />
      <div className="mx-auto flex w-full max-w-[1400px] flex-1">
        <aside className="hidden w-64 shrink-0 border-r border-[color:var(--color-border)] bg-white/80 px-3 py-8 md:block">
          <MerchantSidebarNav />
        </aside>
        <div className="min-w-0 flex-1 pb-8">{children}</div>
      </div>
    </div>
  );
}

export function MerchantDashboardShell({ children }: { children: ReactNode }) {
  return (
    <MerchantDashboardProvider>
      <MerchantDashboardShellInner>{children}</MerchantDashboardShellInner>
    </MerchantDashboardProvider>
  );
}
