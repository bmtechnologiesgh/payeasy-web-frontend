"use client";

import { OpsDashboardNavRail, OpsSidebarNav } from "@/components/ops/OpsSidebarNav";
import { OpsDashboardProvider, useOpsDashboard } from "@/components/ops/ops-dashboard-context";
import { PortalHeader } from "@/components/PortalHeader";
import { portalHref } from "@/lib/portal-path";
import Link from "next/link";
import type { ReactNode } from "react";

function OpsDashboardShellInner({ children }: { children: ReactNode }) {
  const { user, loading, error } = useOpsDashboard();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[color:var(--color-app)]">
        <PortalHeader portal="ops" contextLabel={user?.email} />
        <div className="flex flex-1 items-center justify-center px-4">
          <p className="text-sm text-[color:var(--color-muted)]">Loading…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-[color:var(--color-app)]">
        <PortalHeader portal="ops" contextLabel={null} />
        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-10">
          <div
            role="alert"
            className="rounded-xl border border-[color:var(--color-danger)]/25 bg-[color:var(--color-danger-bg)] px-4 py-3 text-sm text-[color:var(--color-danger)]"
          >
            {error}
          </div>
          <Link
            href={portalHref("ops", "/login")}
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
    <div className="min-h-screen bg-[color:var(--color-app)]">
      <PortalHeader portal="ops" contextLabel={user.email} />
      <OpsDashboardNavRail />
      <div className="mx-auto flex w-full max-w-[1400px] flex-1">
        <aside className="hidden w-60 shrink-0 border-r border-[color:var(--color-border)] bg-white/80 px-3 py-8 md:block lg:w-64">
          <OpsSidebarNav />
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

export function OpsDashboardShell({ children }: { children: ReactNode }) {
  return (
    <OpsDashboardProvider>
      <OpsDashboardShellInner>{children}</OpsDashboardShellInner>
    </OpsDashboardProvider>
  );
}
