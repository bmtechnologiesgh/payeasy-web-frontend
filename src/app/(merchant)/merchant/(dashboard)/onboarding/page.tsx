"use client";

import { MerchantHeader } from "@/components/merchant/MerchantHeader";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/merchant/StatusBadge";
import {
  me,
  submitMerchantApplication,
  updateMerchantProfile,
  type LoginResponse,
  type MerchantProfile,
} from "@/lib/merchant-api";
import { clearAccessToken, getAccessToken } from "@/lib/auth-token";
import { portalHref } from "@/lib/portal-path";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

function nullIfEmpty(s: string): string | null {
  const t = s.trim();
  return t === "" ? null : t;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<LoginResponse["user"] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const [tradingName, setTradingName] = useState("");
  const [slug, setSlug] = useState("");
  const [legalName, setLegalName] = useState("");
  const [country, setCountry] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [tin, setTin] = useState("");

  const merchant = user?.merchant;
  const isDraft = merchant?.status === "draft";

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace(portalHref("merchant", "/login"));
      return;
    }

    me(token)
      .then((u) => setUser(u))
      .catch(() => {
        setLoadError("Unable to load your session. Please sign in again.");
        clearAccessToken();
      });
  }, [router]);

  useEffect(() => {
    if (!merchant) {
      return;
    }
    setTradingName(merchant.trading_name ?? "");
    setSlug(merchant.slug ?? "");
    setLegalName(merchant.legal_name ?? "");
    setCountry(merchant.country ?? "");
    setRegistrationNumber(merchant.registration_number ?? "");
    setTin(merchant.tin ?? "");
  }, [merchant]);

  function applyMerchant(m: MerchantProfile) {
    setUser((prev) =>
      prev
        ? {
            ...prev,
            merchant: m,
          }
        : prev,
    );
  }

  async function saveDraft(event: FormEvent) {
    event.preventDefault();
    const token = getAccessToken();
    if (!token || !isDraft) {
      return;
    }
    setFormError(null);
    setFormMessage(null);
    setBusy(true);
    try {
      const { merchant: updated } = await updateMerchantProfile(token, {
        trading_name: nullIfEmpty(tradingName),
        slug: nullIfEmpty(slug),
        legal_name: nullIfEmpty(legalName),
        country: nullIfEmpty(country)?.toUpperCase() ?? null,
        registration_number: nullIfEmpty(registrationNumber),
        tin: nullIfEmpty(tin),
      });
      applyMerchant(updated);
      setFormMessage("Saved your progress.");
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  async function submitApplication(event: FormEvent) {
    event.preventDefault();
    const token = getAccessToken();
    if (!token || !isDraft) {
      return;
    }
    setFormError(null);
    setFormMessage(null);

    if (!nullIfEmpty(tradingName)) {
      setFormError("Trading / shop name is required before you can submit.");
      return;
    }
    if (!nullIfEmpty(country) || country.trim().length !== 2) {
      setFormError("Please enter a 2-letter ISO country code (for example GH or NG) before submitting.");
      return;
    }

    setBusy(true);
    try {
      await updateMerchantProfile(token, {
        trading_name: nullIfEmpty(tradingName),
        slug: nullIfEmpty(slug),
        legal_name: nullIfEmpty(legalName),
        country: country.trim().toUpperCase(),
        registration_number: nullIfEmpty(registrationNumber),
        tin: nullIfEmpty(tin),
      });
      const { merchant: submitted } = await submitMerchantApplication(token);
      applyMerchant(submitted);
      setFormMessage("Application submitted. We will review your shop details next.");
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Could not submit.");
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-[color:var(--color-input-border)] bg-white px-4 py-3 text-[color:var(--color-foreground)] outline-none ring-[color:var(--color-focus)] focus:ring-2 disabled:opacity-60";

  return (
    <div className="min-h-screen bg-[color:var(--color-app)]">
      <MerchantHeader tradingName={merchant?.trading_name} />

      <main className="mx-auto max-w-[720px] px-4 py-10 sm:px-6">
        {!user && !loadError ? (
          <p className="text-sm text-[color:var(--color-muted)]">Loading…</p>
        ) : null}

        {loadError ? (
          <div className="space-y-4">
            <div
              role="alert"
              className="rounded-xl border border-[color:var(--color-danger)]/25 bg-[color:var(--color-danger-bg)] px-4 py-3 text-sm text-[color:var(--color-danger)]"
            >
              {loadError}
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
          <div className="space-y-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <PageHeader
                eyebrow="Phase 1"
                title="Shop onboarding"
                subtitle="Save a draft anytime. When you are ready, submit for review — we only require a public shop name and country code for now."
              />
              {merchant ? <StatusBadge status={merchant.status} /> : null}
            </div>

            <p className="text-sm">
              <Link
                href={portalHref("merchant", "/dashboard")}
                className="font-semibold text-[color:var(--color-primary)] underline-offset-2 hover:underline"
              >
                ← Back to dashboard
              </Link>
            </p>

            {!merchant ? (
              <div
                role="status"
                className="rounded-xl border border-[color:var(--color-border-strong)] bg-white px-4 py-3 text-sm text-[color:var(--color-foreground)]"
              >
                No merchant profile is linked to this account yet. If you registered as a business, contact support.
              </div>
            ) : (
              <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                {formMessage ? (
                  <p
                    role="status"
                    className="rounded-xl border border-[color:var(--color-border-strong)] bg-white px-4 py-3 text-sm text-[color:var(--color-foreground)]"
                  >
                    {formMessage}
                  </p>
                ) : null}
                {formError ? (
                  <div
                    role="alert"
                    className="rounded-xl border border-[color:var(--color-danger)]/25 bg-[color:var(--color-danger-bg)] px-4 py-3 text-sm text-[color:var(--color-danger)]"
                  >
                    {formError}
                  </div>
                ) : null}

                {!isDraft ? (
                  <p className="rounded-xl border border-[color:var(--color-border-strong)] bg-[color:var(--color-muted-bg)] px-4 py-3 text-sm text-[color:var(--color-muted)]">
                    This application is no longer editable from the portal. If you need changes, contact PayEasy
                    support.
                  </p>
                ) : null}

                <fieldset disabled={!isDraft || busy} className="space-y-4 rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 shadow-sm">
                  <legend className="px-1 font-[family-name:var(--font-heading)] text-lg font-bold text-[color:var(--color-foreground)]">
                    Shop information
                  </legend>
                  <div>
                    <label
                      htmlFor="trading-name"
                      className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]"
                    >
                      Trading / shop name
                      <span className="ml-1 font-normal normal-case text-[color:var(--color-danger)]">*</span>
                    </label>
                    <input
                      id="trading-name"
                      required={isDraft}
                      value={tradingName}
                      onChange={(e) => setTradingName(e.target.value)}
                      className={inputClass}
                      autoComplete="organization"
                    />
                    <p className="mt-1 text-xs text-[color:var(--color-muted)]">Shown to customers. Required before submit.</p>
                  </div>
                  <div>
                    <label
                      htmlFor="slug"
                      className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]"
                    >
                      Shop URL slug <span className="font-normal normal-case">(optional)</span>
                    </label>
                    <input
                      id="slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className={inputClass}
                      placeholder="my-shop-name"
                    />
                    <p className="mt-1 text-xs text-[color:var(--color-muted)]">
                      Lowercase letters, numbers, and hyphens only. Leave blank to decide later.
                    </p>
                  </div>
                </fieldset>

                <fieldset disabled={!isDraft || busy} className="space-y-4 rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 shadow-sm">
                  <legend className="px-1 font-[family-name:var(--font-heading)] text-lg font-bold text-[color:var(--color-foreground)]">
                    Business information
                  </legend>
                  <div>
                    <label
                      htmlFor="legal-name"
                      className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]"
                    >
                      Legal business name <span className="font-normal normal-case">(optional)</span>
                    </label>
                    <input id="legal-name" value={legalName} onChange={(e) => setLegalName(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label
                      htmlFor="country"
                      className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]"
                    >
                      Country (ISO code)
                      <span className="ml-1 font-normal normal-case text-[color:var(--color-danger)]">*</span>
                    </label>
                    <input
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value.toUpperCase())}
                      maxLength={2}
                      className={inputClass}
                      placeholder="GH"
                    />
                    <p className="mt-1 text-xs text-[color:var(--color-muted)]">Two letters, e.g. GH, NG, KE. Required before submit.</p>
                  </div>
                  <div>
                    <label
                      htmlFor="reg-no"
                      className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]"
                    >
                      Business registration number <span className="font-normal normal-case">(optional)</span>
                    </label>
                    <input id="reg-no" value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="tin" className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
                      Tax ID (TIN) <span className="font-normal normal-case">(optional)</span>
                    </label>
                    <input id="tin" value={tin} onChange={(e) => setTin(e.target.value)} className={inputClass} />
                  </div>
                </fieldset>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-muted-bg)] p-5 sm:col-span-3">
                    <h3 className="font-[family-name:var(--font-heading)] text-sm font-bold text-[color:var(--color-foreground)]">
                      Shipping, payouts &amp; extras
                    </h3>
                    <p className="mt-2 text-sm text-[color:var(--color-muted)]">
                      Ship-from address, carrier defaults, bank / payout details, and policy links are planned for the
                      next phase — nothing to fill in here yet.
                    </p>
                  </div>
                </div>

                {isDraft ? (
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={saveDraft}
                      className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[color:var(--color-border-strong)] bg-white px-5 text-sm font-semibold text-[color:var(--color-foreground)] transition hover:bg-[color:var(--color-muted-bg)] disabled:opacity-60"
                    >
                      Save draft
                    </button>
                    <button
                      type="button"
                      onClick={submitApplication}
                      className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[color:var(--color-primary)] px-5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)] disabled:opacity-60"
                    >
                      Submit for review
                    </button>
                  </div>
                ) : null}
              </form>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}
