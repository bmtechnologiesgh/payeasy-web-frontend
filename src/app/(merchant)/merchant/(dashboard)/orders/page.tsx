"use client";

import { PageHeader } from "@/components/PageHeader";
import { portalHref } from "@/lib/portal-path";
import Link from "next/link";

export default function MerchantOrdersPage() {
  return (
    <div className="px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        eyebrow="Merchant"
        title="Orders"
        subtitle="View and fulfil PayEasy orders for your store."
      />

      <div className="mt-8 rounded-2xl border border-dashed border-[color:var(--color-border-strong)] bg-white p-8 text-center shadow-sm">
        <p className="font-[family-name:var(--font-heading)] text-lg font-bold text-[color:var(--color-foreground)]">
          Orders coming soon
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm text-[color:var(--color-muted)]">
          Order list, filters, and shipment updates will appear here when the orders API is connected. For now, manage
          your catalogue and shop profile from the dashboard.
        </p>
        <Link
          href={portalHref("merchant", "/dashboard")}
          className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-full bg-[color:var(--color-primary)] px-5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)]"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
