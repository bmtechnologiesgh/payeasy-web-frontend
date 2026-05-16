"use client";

import { useMerchantDashboard } from "@/components/merchant/merchant-dashboard-context";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/merchant/StatusBadge";
import {
  submitMerchantApplication,
  updateMerchantProfile,
  type MerchantProfile,
  type MerchantProfilePatch,
} from "@/lib/merchant-api";
import { getAccessToken } from "@/lib/auth-token";
import { FormEvent, useEffect, useState, type ReactNode } from "react";

function nullIfEmpty(s: string): string | null {
  const t = s.trim();
  return t === "" ? null : t;
}

const sectionNav = [
  { id: "profile-shop", label: "Shop" },
  { id: "profile-business", label: "Business" },
  { id: "profile-shipping", label: "Shipping" },
  { id: "profile-payout", label: "Payouts" },
  { id: "profile-public", label: "Storefront" },
] as const;

function ProfileSection({
  id,
  title,
  hint,
  children,
}: {
  id: string;
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28 overflow-hidden rounded-2xl border border-[color:var(--color-border-strong)] bg-white shadow-sm"
    >
      <header className="border-b border-[color:var(--color-border)] bg-[color:var(--color-muted-bg)]/50 px-5 py-4 sm:px-6">
        <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[color:var(--color-foreground)]">
          {title}
        </h2>
        {hint ? <p className="mt-1 text-sm leading-relaxed text-[color:var(--color-muted)]">{hint}</p> : null}
      </header>
      <div className="space-y-4 p-5 sm:p-6">{children}</div>
    </section>
  );
}

function labelClass(): string {
  return "block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]";
}

export function MerchantProfileForm() {
  const { user, setUser } = useMerchantDashboard();
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const [tradingName, setTradingName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [country, setCountry] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [tin, setTin] = useState("");

  const [shipFromLine1, setShipFromLine1] = useState("");
  const [shipFromLine2, setShipFromLine2] = useState("");
  const [shipFromCity, setShipFromCity] = useState("");
  const [shipFromRegion, setShipFromRegion] = useState("");
  const [shipFromPostalCode, setShipFromPostalCode] = useState("");

  const [payoutAccountHolderName, setPayoutAccountHolderName] = useState("");
  const [payoutBankName, setPayoutBankName] = useState("");
  const [payoutAccountNumber, setPayoutAccountNumber] = useState("");
  const [payoutBankBranchCode, setPayoutBankBranchCode] = useState("");
  const [payoutMobileMoneyNumber, setPayoutMobileMoneyNumber] = useState("");

  const [websiteUrl, setWebsiteUrl] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [returnsPolicyUrl, setReturnsPolicyUrl] = useState("");
  const [about, setAbout] = useState("");

  const merchant = user?.merchant;
  const isDraft = merchant?.status === "draft";

  useEffect(() => {
    if (!merchant) {
      return;
    }
    setTradingName(merchant.trading_name ?? "");
    setLegalName(merchant.legal_name ?? "");
    setCountry(merchant.country ?? "");
    setRegistrationNumber(merchant.registration_number ?? "");
    setTin(merchant.tin ?? "");
    setShipFromLine1(merchant.ship_from_line1 ?? "");
    setShipFromLine2(merchant.ship_from_line2 ?? "");
    setShipFromCity(merchant.ship_from_city ?? "");
    setShipFromRegion(merchant.ship_from_region ?? "");
    setShipFromPostalCode(merchant.ship_from_postal_code ?? "");
    setPayoutAccountHolderName(merchant.payout_account_holder_name ?? "");
    setPayoutBankName(merchant.payout_bank_name ?? "");
    setPayoutAccountNumber(merchant.payout_account_number ?? "");
    setPayoutBankBranchCode(merchant.payout_bank_branch_code ?? "");
    setPayoutMobileMoneyNumber(merchant.payout_mobile_money_number ?? "");
    setWebsiteUrl(merchant.website_url ?? "");
    setSupportEmail(merchant.support_email ?? "");
    setSupportPhone(merchant.support_phone ?? "");
    setReturnsPolicyUrl(merchant.returns_policy_url ?? "");
    setAbout(merchant.about ?? "");
  }, [merchant]);

  function buildMerchantPatch(): MerchantProfilePatch {
    return {
      trading_name: nullIfEmpty(tradingName),
      legal_name: nullIfEmpty(legalName),
      country: nullIfEmpty(country)?.toUpperCase() ?? null,
      registration_number: nullIfEmpty(registrationNumber),
      tin: nullIfEmpty(tin),
      ship_from_line1: nullIfEmpty(shipFromLine1),
      ship_from_line2: nullIfEmpty(shipFromLine2),
      ship_from_city: nullIfEmpty(shipFromCity),
      ship_from_region: nullIfEmpty(shipFromRegion),
      ship_from_postal_code: nullIfEmpty(shipFromPostalCode),
      payout_account_holder_name: nullIfEmpty(payoutAccountHolderName),
      payout_bank_name: nullIfEmpty(payoutBankName),
      payout_account_number: nullIfEmpty(payoutAccountNumber),
      payout_bank_branch_code: nullIfEmpty(payoutBankBranchCode),
      payout_mobile_money_number: nullIfEmpty(payoutMobileMoneyNumber),
      website_url: nullIfEmpty(websiteUrl),
      support_email: nullIfEmpty(supportEmail)?.toLowerCase() ?? null,
      support_phone: nullIfEmpty(supportPhone),
      returns_policy_url: nullIfEmpty(returnsPolicyUrl),
      about: nullIfEmpty(about),
    };
  }

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

  async function saveChanges(event: FormEvent) {
    event.preventDefault();
    const token = getAccessToken();
    if (!token || !isDraft) {
      return;
    }
    setFormError(null);
    setFormMessage(null);
    setBusy(true);
    try {
      const { merchant: updated } = await updateMerchantProfile(token, buildMerchantPatch());
      applyMerchant(updated);
      setFormMessage("Profile saved.");
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
        ...buildMerchantPatch(),
        country: country.trim().toUpperCase(),
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

  function scrollToSection(hash: string) {
    const el = document.querySelector(hash);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-[color:var(--color-input-border)] bg-white px-4 py-3 text-[color:var(--color-foreground)] outline-none ring-[color:var(--color-focus)] focus:ring-2 disabled:opacity-60";

  const textareaClass =
    "mt-2 min-h-[120px] w-full resize-y rounded-xl border border-[color:var(--color-input-border)] bg-white px-4 py-3 text-[color:var(--color-foreground)] outline-none ring-[color:var(--color-focus)] focus:ring-2 disabled:opacity-60";

  if (!user) {
    return null;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8 flex flex-col gap-6 border-b border-[color:var(--color-border)] pb-8 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          eyebrow="Merchant"
          title="Shop profile"
          subtitle="Everything buyers and PayEasy need to verify your business: identity, fulfilment, payouts, and public storefront details. Save as you go while your application is in draft, then submit for review."
        />
        {merchant ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <StatusBadge status={merchant.status} />
            {isDraft ? (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={saveChanges}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[color:var(--color-border-strong)] bg-white px-5 text-sm font-semibold text-[color:var(--color-foreground)] transition hover:bg-[color:var(--color-muted-bg)] disabled:opacity-60"
                >
                  Save changes
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={submitApplication}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[color:var(--color-primary)] px-5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)] disabled:opacity-60"
                >
                  Submit for review
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {!merchant ? (
        <div
          role="status"
          className="rounded-2xl border border-[color:var(--color-border-strong)] bg-white px-5 py-4 text-sm text-[color:var(--color-foreground)] shadow-sm"
        >
          No merchant profile is linked to this account yet. If you registered as a business, contact support.
        </div>
      ) : (
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          <div className="lg:w-52 lg:shrink-0">
            <label htmlFor="profile-section-jump" className="sr-only">
              Jump to section
            </label>
            <select
              id="profile-section-jump"
              defaultValue=""
              onChange={(e) => {
                const v = e.target.value;
                if (v) {
                  scrollToSection(v);
                }
                e.target.selectedIndex = 0;
              }}
              className="w-full rounded-xl border border-[color:var(--color-border-strong)] bg-white px-4 py-3 text-sm font-medium text-[color:var(--color-foreground)] lg:hidden"
            >
              <option value="">Jump to section…</option>
              {sectionNav.map((s) => (
                <option key={s.id} value={`#${s.id}`}>
                  {s.label}
                </option>
              ))}
            </select>
            <nav
              aria-label="Profile sections"
              className="mt-2 hidden flex-col gap-1 border border-[color:var(--color-border-strong)] bg-white p-2 lg:sticky lg:top-28 lg:flex lg:rounded-2xl lg:shadow-sm"
            >
              {sectionNav.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => scrollToSection(`#${s.id}`)}
                  className="rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[color:var(--color-muted)] transition hover:bg-[color:var(--color-muted-bg)] hover:text-[color:var(--color-foreground)]"
                >
                  {s.label}
                </button>
              ))}
            </nav>
          </div>

          <form id="merchant-profile-form" className="min-w-0 flex-1 space-y-6" onSubmit={(e) => e.preventDefault()}>
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
                This profile is read-only after submission. Contact PayEasy support if you need changes.
              </p>
            ) : null}

            <fieldset disabled={!isDraft || busy} className="contents min-w-0">
              <ProfileSection
                id="profile-shop"
                title="Shop"
                hint="How your store appears publicly. Trading name and country are required before you submit for review."
              >
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="lg:col-span-2">
                    <label htmlFor="trading-name" className={labelClass()}>
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
                    <p className="mt-1 text-xs text-[color:var(--color-muted)]">Shown to customers.</p>
                  </div>
                  <div className="lg:col-span-2">
                    <p className={labelClass()}>Merchant ID</p>
                    <p className="mt-2 font-mono text-sm font-semibold text-[color:var(--color-foreground)]">
                      {merchant?.merchant_code ?? "—"}
                    </p>
                    <p className="mt-1 text-xs text-[color:var(--color-muted)]">
                      Assigned by PayEasy. Shop URL slug is generated from your trading name
                      {merchant?.slug ? `: ${merchant.slug}` : " when you save."}
                    </p>
                  </div>
                </div>
              </ProfileSection>

              <ProfileSection
                id="profile-business"
                title="Business"
                hint="Legal identity and tax identifiers used for verification."
              >
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="legal-name" className={labelClass()}>
                      Legal business name <span className="font-normal normal-case">(optional)</span>
                    </label>
                    <input
                      id="legal-name"
                      value={legalName}
                      onChange={(e) => setLegalName(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="country" className={labelClass()}>
                      Country (ISO)
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
                    <p className="mt-1 text-xs text-[color:var(--color-muted)]">Two letters, e.g. GH, NG, KE.</p>
                  </div>
                  <div>
                    <label htmlFor="reg-no" className={labelClass()}>
                      Registration number <span className="font-normal normal-case">(optional)</span>
                    </label>
                    <input
                      id="reg-no"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="tin" className={labelClass()}>
                      Tax ID (TIN) <span className="font-normal normal-case">(optional)</span>
                    </label>
                    <input id="tin" value={tin} onChange={(e) => setTin(e.target.value)} className={inputClass} />
                  </div>
                </div>
              </ProfileSection>

              <ProfileSection
                id="profile-shipping"
                title="Shipping"
                hint="Default ship-from location for fulfilment and returns routing."
              >
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="ship-line1" className={labelClass()}>
                      Address line 1 <span className="font-normal normal-case">(optional)</span>
                    </label>
                    <input
                      id="ship-line1"
                      value={shipFromLine1}
                      onChange={(e) => setShipFromLine1(e.target.value)}
                      className={inputClass}
                      autoComplete="address-line1"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="ship-line2" className={labelClass()}>
                      Address line 2 <span className="font-normal normal-case">(optional)</span>
                    </label>
                    <input
                      id="ship-line2"
                      value={shipFromLine2}
                      onChange={(e) => setShipFromLine2(e.target.value)}
                      className={inputClass}
                      autoComplete="address-line2"
                    />
                  </div>
                  <div>
                    <label htmlFor="ship-city" className={labelClass()}>
                      City <span className="font-normal normal-case">(optional)</span>
                    </label>
                    <input
                      id="ship-city"
                      value={shipFromCity}
                      onChange={(e) => setShipFromCity(e.target.value)}
                      className={inputClass}
                      autoComplete="address-level2"
                    />
                  </div>
                  <div>
                    <label htmlFor="ship-region" className={labelClass()}>
                      Region / state <span className="font-normal normal-case">(optional)</span>
                    </label>
                    <input
                      id="ship-region"
                      value={shipFromRegion}
                      onChange={(e) => setShipFromRegion(e.target.value)}
                      className={inputClass}
                      autoComplete="address-level1"
                    />
                  </div>
                  <div className="sm:col-span-2 sm:max-w-md">
                    <label htmlFor="ship-postal" className={labelClass()}>
                      Postal code <span className="font-normal normal-case">(optional)</span>
                    </label>
                    <input
                      id="ship-postal"
                      value={shipFromPostalCode}
                      onChange={(e) => setShipFromPostalCode(e.target.value)}
                      className={inputClass}
                      autoComplete="postal-code"
                    />
                  </div>
                </div>
              </ProfileSection>

              <ProfileSection
                id="profile-payout"
                title="Payouts"
                hint="Where we send settled funds. Prefer an account that matches your legal business name."
              >
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="payout-holder" className={labelClass()}>
                      Account holder name <span className="font-normal normal-case">(optional)</span>
                    </label>
                    <input
                      id="payout-holder"
                      value={payoutAccountHolderName}
                      onChange={(e) => setPayoutAccountHolderName(e.target.value)}
                      className={inputClass}
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <label htmlFor="payout-bank" className={labelClass()}>
                      Bank name <span className="font-normal normal-case">(optional)</span>
                    </label>
                    <input
                      id="payout-bank"
                      value={payoutBankName}
                      onChange={(e) => setPayoutBankName(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="payout-branch" className={labelClass()}>
                      Branch / sort code <span className="font-normal normal-case">(optional)</span>
                    </label>
                    <input
                      id="payout-branch"
                      value={payoutBankBranchCode}
                      onChange={(e) => setPayoutBankBranchCode(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2 sm:max-w-md">
                    <label htmlFor="payout-account" className={labelClass()}>
                      Bank account number <span className="font-normal normal-case">(optional)</span>
                    </label>
                    <input
                      id="payout-account"
                      value={payoutAccountNumber}
                      onChange={(e) => setPayoutAccountNumber(e.target.value)}
                      className={inputClass}
                      autoComplete="off"
                      inputMode="numeric"
                    />
                  </div>
                  <div className="sm:col-span-2 sm:max-w-md">
                    <label htmlFor="payout-momo" className={labelClass()}>
                      Mobile money number <span className="font-normal normal-case">(optional)</span>
                    </label>
                    <input
                      id="payout-momo"
                      value={payoutMobileMoneyNumber}
                      onChange={(e) => setPayoutMobileMoneyNumber(e.target.value)}
                      className={inputClass}
                      autoComplete="tel"
                    />
                    <p className="mt-1 text-xs text-[color:var(--color-muted)]">
                      Optional alternative to bank transfer for supported wallets.
                    </p>
                  </div>
                </div>
              </ProfileSection>

              <ProfileSection
                id="profile-public"
                title="Storefront"
                hint="Links and copy shown or shared with customers and reviewers."
              >
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="website-url" className={labelClass()}>
                      Shop website <span className="font-normal normal-case">(optional)</span>
                    </label>
                    <input
                      id="website-url"
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      className={inputClass}
                      placeholder="https://"
                    />
                  </div>
                  <div>
                    <label htmlFor="support-email" className={labelClass()}>
                      Support email <span className="font-normal normal-case">(optional)</span>
                    </label>
                    <input
                      id="support-email"
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className={inputClass}
                      autoComplete="email"
                    />
                  </div>
                  <div>
                    <label htmlFor="support-phone" className={labelClass()}>
                      Support phone <span className="font-normal normal-case">(optional)</span>
                    </label>
                    <input
                      id="support-phone"
                      type="tel"
                      value={supportPhone}
                      onChange={(e) => setSupportPhone(e.target.value)}
                      className={inputClass}
                      autoComplete="tel"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="returns-url" className={labelClass()}>
                      Returns policy URL <span className="font-normal normal-case">(optional)</span>
                    </label>
                    <input
                      id="returns-url"
                      type="url"
                      value={returnsPolicyUrl}
                      onChange={(e) => setReturnsPolicyUrl(e.target.value)}
                      className={inputClass}
                      placeholder="https://"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="about" className={labelClass()}>
                      About your shop <span className="font-normal normal-case">(optional)</span>
                    </label>
                    <textarea
                      id="about"
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      className={textareaClass}
                      rows={4}
                      maxLength={5000}
                    />
                  </div>
                </div>
              </ProfileSection>
            </fieldset>

            {isDraft ? (
              <div className="flex flex-col gap-3 border-t border-[color:var(--color-border)] pt-6 sm:flex-row sm:flex-wrap sm:items-center">
                <button
                  type="button"
                  disabled={busy}
                  onClick={saveChanges}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[color:var(--color-border-strong)] bg-white px-5 text-sm font-semibold text-[color:var(--color-foreground)] transition hover:bg-[color:var(--color-muted-bg)] disabled:opacity-60"
                >
                  Save changes
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={submitApplication}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[color:var(--color-primary)] px-5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)] disabled:opacity-60"
                >
                  Submit for review
                </button>
                <p className="text-xs text-[color:var(--color-muted)] sm:ml-auto sm:max-w-xs sm:text-right">
                  Submitting locks edits until support approves or reopens your application.
                </p>
              </div>
            ) : null}
          </form>
        </div>
      )}
    </main>
  );
}
