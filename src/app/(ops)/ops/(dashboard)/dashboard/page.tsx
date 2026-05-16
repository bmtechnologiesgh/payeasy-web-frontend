"use client";

import { PageHeader } from "@/components/PageHeader";
import { OPS_NAV_ITEMS } from "@/components/ops/ops-nav";
import { useOpsDashboard } from "@/components/ops/ops-dashboard-context";
import { portalHref } from "@/lib/portal-path";
import Link from "next/link";

const QUICK_LINKS = OPS_NAV_ITEMS.filter((item) => !item.href.endsWith("/dashboard"));

export default function DashboardPage() {
  const { user } = useOpsDashboard();

  if (!user) {
    return null;
  }

  return (
    <main className="px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Operations"
        title="Platform dashboard"
        subtitle={`Signed in as ${user.full_name}${user.email ? ` (${user.email})` : ""}.`}
      />

      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[color:var(--color-foreground)] md:text-2xl">
          Workspace
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_LINKS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex h-full flex-col rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-5 shadow-sm transition hover:border-[color:var(--color-primary)]/30 hover:shadow-md"
              >
                <span className="font-[family-name:var(--font-heading)] text-lg font-bold text-[color:var(--color-foreground)]">
                  {item.label}
                </span>
                {item.description ? (
                  <span className="mt-1 text-sm text-[color:var(--color-muted)]">{item.description}</span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <article className="rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 shadow-sm">
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold">Priority queues</h2>
          <ul className="mt-4 divide-y divide-[color:var(--color-border)]">
            <li>
              <Link
                href={portalHref("ops", "/merchants?status=submitted")}
                className="block py-3 text-sm font-semibold text-[color:var(--color-foreground)] hover:text-[color:var(--color-primary)]"
              >
                Pending KYB reviews
              </Link>
            </li>
            <li>
              <Link
                href={portalHref("ops", "/users?status=pending")}
                className="block py-3 text-sm font-semibold text-[color:var(--color-foreground)] hover:text-[color:var(--color-primary)]"
              >
                Users pending verification
              </Link>
            </li>
            <li>
              <Link
                href={portalHref("ops", "/audit-logs?event_category=security")}
                className="block py-3 text-sm font-semibold text-[color:var(--color-foreground)] hover:text-[color:var(--color-primary)]"
              >
                Security audit events
              </Link>
            </li>
          </ul>
        </article>

        <article className="rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 shadow-sm">
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold">Your access</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-[color:var(--color-border)] pb-3">
              <dt className="text-[color:var(--color-muted)]">Roles</dt>
              <dd className="text-right font-semibold">{user.roles.join(", ") || "none"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[color:var(--color-muted)]">User ID</dt>
              <dd className="truncate font-mono text-xs">{user.uuid}</dd>
            </div>
          </dl>
        </article>
      </section>
    </main>
  );
}
