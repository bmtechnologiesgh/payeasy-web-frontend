"use client";

import { PageHeader } from "@/components/PageHeader";
import { portalHref } from "@/lib/portal-path";
import Link from "next/link";

export default function MerchantSettingsPage() {
  return (
    <div className="px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        eyebrow="Merchant"
        title="Settings"
        subtitle="Portal preferences, notifications, and team access will live here."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 shadow-sm">
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[color:var(--color-foreground)]">
            Shop & compliance
          </h2>
          <p className="mt-2 text-sm text-[color:var(--color-muted)]">
            Your shop name, tax IDs, ship-from address, payouts, and public storefront links are managed under Profile.
          </p>
          <Link
            href={portalHref("merchant", "/profile")}
            className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-full bg-[color:var(--color-primary)] px-5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)]"
          >
            Open shop profile
          </Link>
        </article>

        <article className="rounded-2xl border border-dashed border-[color:var(--color-border-strong)] bg-[color:var(--color-muted-bg)]/40 p-6">
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[color:var(--color-foreground)]">
            Coming soon
          </h2>
          <p className="mt-2 text-sm text-[color:var(--color-muted)]">
            Notification preferences, API keys, and team member access for your merchant workspace.
          </p>
        </article>
      </div>
    </div>
  );
}
