"use client";

import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/merchant/StatusBadge";
import { getAccessToken } from "@/lib/auth-token";
import { getMerchant, updateMerchantStatus, type AdminMerchant } from "@/lib/ops-api";
import { portalHref } from "@/lib/portal-path";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

function merchantDisplayName(merchant: AdminMerchant): string {
  return merchant.trading_name || merchant.legal_name || "Unnamed merchant";
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1 border-b border-[color:var(--color-border)] py-3 last:border-0 sm:flex-row sm:justify-between">
      <dt className="text-sm text-[color:var(--color-muted)]">{label}</dt>
      <dd className="text-sm font-medium text-[color:var(--color-foreground)] sm:max-w-[65%] sm:text-right">{value}</dd>
    </div>
  );
}

export default function MerchantDetailPage() {
  const params = useParams<{ uuid: string }>();
  const uuid = params.uuid;
  const [merchant, setMerchant] = useState<AdminMerchant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [acting, setActing] = useState(false);
  const [notes, setNotes] = useState("");

  const load = useCallback(async () => {
    const token = getAccessToken();
    if (!token || !uuid) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const row = await getMerchant(token, uuid);
      setMerchant(row);
    } catch {
      setError("Could not load this merchant.");
      setMerchant(null);
    } finally {
      setLoading(false);
    }
  }, [uuid]);

  useEffect(() => {
    load();
  }, [load]);

  async function runAction(status: "approved" | "rejected" | "suspended") {
    const token = getAccessToken();
    if (!token || !uuid) {
      return;
    }

    setActing(true);
    setActionError(null);

    try {
      const updated = await updateMerchantStatus(token, uuid, {
        status,
        notes: notes.trim() || undefined,
      });
      setMerchant(updated);
      setNotes("");
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Action failed.");
    } finally {
      setActing(false);
    }
  }

  const status = merchant?.status ?? "";

  return (
    <main className="px-4 py-10 sm:px-6">
      <Link
        href={portalHref("ops", "/merchants")}
        className="text-sm font-semibold text-[color:var(--color-primary)] underline-offset-2 hover:underline"
      >
        ← All merchants
      </Link>

      {loading ? (
        <p className="mt-8 text-sm text-[color:var(--color-muted)]">Loading merchant…</p>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="mt-8 rounded-xl border border-[color:var(--color-danger)]/25 bg-[color:var(--color-danger-bg)] px-4 py-3 text-sm text-[color:var(--color-danger)]"
        >
          {error}
        </div>
      ) : null}

      {merchant ? (
        <div className="mt-8 space-y-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <PageHeader
              eyebrow="Merchant"
              title={merchantDisplayName(merchant)}
              subtitle={merchant.legal_name && merchant.trading_name ? merchant.legal_name : undefined}
            />
            <StatusBadge status={merchant.status} className="mt-2" />
          </div>

          {actionError ? (
            <div
              role="alert"
              className="rounded-xl border border-[color:var(--color-danger)]/25 bg-[color:var(--color-danger-bg)] px-4 py-3 text-sm text-[color:var(--color-danger)]"
            >
              {actionError}
            </div>
          ) : null}

          {(status === "submitted" || status === "approved" || status === "suspended") && (
            <section className="rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 shadow-sm">
              <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[color:var(--color-foreground)]">
                Actions
              </h2>
              <label htmlFor="review-notes" className="mt-4 block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
                Internal notes (optional)
              </label>
              <textarea
                id="review-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-2 w-full rounded-xl border border-[color:var(--color-input-border)] bg-white px-4 py-3 text-sm text-[color:var(--color-foreground)] outline-none ring-[color:var(--color-focus)] focus:ring-2"
                placeholder="Reason for approval, rejection, or suspension…"
              />
              <div className="mt-4 flex flex-wrap gap-3">
                {status === "submitted" ? (
                  <>
                    <button
                      type="button"
                      disabled={acting}
                      onClick={() => runAction("approved")}
                      className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[color:var(--color-success)] px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                    >
                      Approve KYB
                    </button>
                    <button
                      type="button"
                      disabled={acting}
                      onClick={() => runAction("rejected")}
                      className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[color:var(--color-danger)] bg-white px-5 text-sm font-semibold text-[color:var(--color-danger)] transition hover:bg-[color:var(--color-danger-bg)] disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </>
                ) : null}
                {status === "approved" ? (
                  <button
                    type="button"
                    disabled={acting}
                    onClick={() => runAction("suspended")}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[color:var(--color-border-strong)] bg-white px-5 text-sm font-semibold text-[color:var(--color-foreground)] transition hover:bg-[color:var(--color-muted-bg)] disabled:opacity-60"
                  >
                    Suspend
                  </button>
                ) : null}
                {status === "suspended" ? (
                  <button
                    type="button"
                    disabled={acting}
                    onClick={() => runAction("approved")}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[color:var(--color-primary)] px-5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)] disabled:opacity-60"
                  >
                    Reinstate
                  </button>
                ) : null}
              </div>
            </section>
          )}

          <section className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 shadow-sm">
              <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[color:var(--color-foreground)]">
                Business
              </h2>
              <dl className="mt-2">
                <DetailRow label="Legal name" value={merchant.legal_name} />
                <DetailRow label="Trading name" value={merchant.trading_name} />
                <DetailRow label="Slug" value={merchant.slug} />
                <DetailRow label="Country" value={merchant.country} />
                <DetailRow label="Registration" value={merchant.registration_number} />
                <DetailRow label="TIN" value={merchant.tin} />
                <DetailRow label="Website" value={merchant.website_url} />
                <DetailRow label="About" value={merchant.about} />
              </dl>
            </article>

            <article className="rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 shadow-sm">
              <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[color:var(--color-foreground)]">
                Contact &amp; logistics
              </h2>
              <dl className="mt-2">
                <DetailRow label="Support email" value={merchant.support_email} />
                <DetailRow label="Support phone" value={merchant.support_phone} />
                <DetailRow label="Returns policy" value={merchant.returns_policy_url} />
                <DetailRow
                  label="Ship from"
                  value={
                    [
                      merchant.ship_from_line1,
                      merchant.ship_from_line2,
                      merchant.ship_from_city,
                      merchant.ship_from_region,
                      merchant.ship_from_postal_code,
                    ]
                      .filter(Boolean)
                      .join(", ") || null
                  }
                />
              </dl>
            </article>

            <article className="rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 shadow-sm">
              <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[color:var(--color-foreground)]">
                Payout
              </h2>
              <dl className="mt-2">
                <DetailRow label="Account holder" value={merchant.payout_account_holder_name} />
                <DetailRow label="Bank" value={merchant.payout_bank_name} />
                <DetailRow label="Account number" value={merchant.payout_account_number} />
                <DetailRow label="Branch code" value={merchant.payout_bank_branch_code} />
                <DetailRow label="Mobile money" value={merchant.payout_mobile_money_number} />
              </dl>
            </article>

            <article className="rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 shadow-sm">
              <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[color:var(--color-foreground)]">
                Account owners
              </h2>
              {merchant.owners?.length ? (
                <ul className="mt-4 divide-y divide-[color:var(--color-border)]">
                  {merchant.owners.map((owner) => (
                    <li key={owner.uuid} className="flex flex-wrap justify-between gap-2 py-3 first:pt-0">
                      <div>
                        <p className="text-sm font-semibold text-[color:var(--color-foreground)]">{owner.full_name}</p>
                        <p className="text-xs text-[color:var(--color-muted)]">{owner.email ?? "No email"}</p>
                      </div>
                      <span className="text-xs font-medium uppercase tracking-wide text-[color:var(--color-muted)]">
                        {owner.role ?? "member"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-[color:var(--color-muted)]">No linked users.</p>
              )}
            </article>
          </section>
        </div>
      ) : null}
    </main>
  );
}
