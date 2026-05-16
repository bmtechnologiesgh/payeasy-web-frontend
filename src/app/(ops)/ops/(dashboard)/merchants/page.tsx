"use client";

import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/merchant/StatusBadge";
import { getAccessToken } from "@/lib/auth-token";
import { listMerchants, type AdminMerchant } from "@/lib/ops-api";
import { portalHref } from "@/lib/portal-path";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";

const STATUS_FILTERS = [
  { value: "", label: "All statuses" },
  { value: "submitted", label: "Submitted" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "suspended", label: "Suspended" },
  { value: "draft", label: "Draft" },
] as const;

function merchantDisplayName(merchant: AdminMerchant): string {
  return merchant.trading_name || merchant.legal_name || "Unnamed merchant";
}

export default function MerchantsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [merchants, setMerchants] = useState<AdminMerchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
  const statusFilter = searchParams.get("status") ?? "";

  const loadMerchants = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { merchants: rows } = await listMerchants(token, {
        search: searchParams.get("search") ?? undefined,
        status: searchParams.get("status") ?? undefined,
        per_page: 50,
      });
      setMerchants(rows);
    } catch {
      setError("Could not load merchants. You may need the approve-kyb permission.");
      setMerchants([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadMerchants();
  }, [loadMerchants]);

  function applyFilters(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchInput.trim()) {
      params.set("search", searchInput.trim());
    }
    if (statusFilter) {
      params.set("status", statusFilter);
    }
    const qs = params.toString();
    router.push(portalHref("ops", `/merchants${qs ? `?${qs}` : ""}`));
  }

  function onStatusChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("status", value);
    } else {
      params.delete("status");
    }
    const qs = params.toString();
    router.push(portalHref("ops", `/merchants${qs ? `?${qs}` : ""}`));
  }

  return (
    <main className="px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Operations"
        title="Merchants"
        subtitle="Review submitted shop applications, approve KYB, and manage merchant status."
      />

      <form onSubmit={applyFilters} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="merchant-search" className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
            Search
          </label>
          <input
            id="merchant-search"
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Shop name, slug, registration…"
            className="mt-2 w-full rounded-xl border border-[color:var(--color-input-border)] bg-white px-4 py-3 text-sm text-[color:var(--color-foreground)] outline-none ring-[color:var(--color-focus)] focus:ring-2"
          />
        </div>
        <div className="w-full sm:w-48">
          <label htmlFor="merchant-status" className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
            Status
          </label>
          <select
            id="merchant-status"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[color:var(--color-input-border)] bg-white px-4 py-3 text-sm text-[color:var(--color-foreground)] outline-none ring-[color:var(--color-focus)] focus:ring-2"
          >
            {STATUS_FILTERS.map((opt) => (
              <option key={opt.value || "all"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="inline-flex min-h-[48px] shrink-0 items-center justify-center rounded-full bg-[color:var(--color-primary)] px-6 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)]"
        >
          Search
        </button>
      </form>

      {error ? (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-[color:var(--color-danger)]/25 bg-[color:var(--color-danger-bg)] px-4 py-3 text-sm text-[color:var(--color-danger)]"
        >
          {error}
        </div>
      ) : null}

      <div className="mt-8 overflow-hidden rounded-2xl border border-[color:var(--color-border-strong)] bg-white shadow-sm">
        {loading ? (
          <p className="px-5 py-8 text-sm text-[color:var(--color-muted)]">Loading merchants…</p>
        ) : merchants.length === 0 ? (
          <p className="px-5 py-8 text-sm text-[color:var(--color-muted)]">No merchants match your filters.</p>
        ) : (
          <ul className="divide-y divide-[color:var(--color-border)]">
            {merchants.map((merchant) => (
              <li key={merchant.uuid}>
                <Link
                  href={portalHref("ops", `/merchants/${merchant.uuid}`)}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-[color:var(--color-muted-bg)]/60"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-[color:var(--color-foreground)]">{merchantDisplayName(merchant)}</p>
                    <p className="mt-0.5 text-xs text-[color:var(--color-muted)]">
                      {[merchant.country, merchant.slug, merchant.support_email].filter(Boolean).join(" · ") ||
                        "No details yet"}
                    </p>
                  </div>
                  <StatusBadge status={merchant.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
