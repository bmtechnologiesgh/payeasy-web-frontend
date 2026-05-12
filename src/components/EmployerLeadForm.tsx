"use client";

import { useState, type FormEvent } from "react";
import {
  PAYEASY_EMPLOYER_EMAIL,
  PAYEASY_SUPPORT_PHONE_DISPLAY,
  PAYEASY_WHATSAPP_URL,
} from "@/lib/contact";

function fieldValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function EmployerLeadForm() {
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const company = fieldValue(formData, "company");
    const headcount = fieldValue(formData, "headcount");
    const contactName = fieldValue(formData, "contactName");
    const contactNumber = fieldValue(formData, "contactNumber");
    const email = fieldValue(formData, "email");
    const notes = fieldValue(formData, "notes");

    const body = [
      "Employer onboarding request",
      "",
      `Company: ${company}`,
      `Headcount: ${headcount}`,
      `Contact name: ${contactName}`,
      `Contact number: ${contactNumber}`,
      `Work email: ${email}`,
      notes ? `Notes: ${notes}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const mailto = new URL(`mailto:${PAYEASY_EMPLOYER_EMAIL}`);
    mailto.searchParams.set("subject", `Employer walkthrough request - ${company}`);
    mailto.searchParams.set("body", body);

    setSubmitted(true);
    window.location.href = mailto.toString();
  }

  return (
    <form
      id="employer-lead-form"
      onSubmit={onSubmit}
      className="scroll-mt-28 rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-5 shadow-sm sm:p-6"
    >
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[color:var(--color-primary)]">
          Book an employer walkthrough
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-bold text-[color:var(--color-foreground)]">
          Tell us about your company
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-muted)]">
          Share the basics and the PayEasy partnerships desk will follow up with payroll onboarding next steps.
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-[color:var(--color-foreground)]">
          Company name
          <input
            name="company"
            required
            autoComplete="organization"
            className="mt-1 w-full rounded-lg border border-[color:var(--color-input-border)] px-3 py-2 text-sm font-normal outline-none focus:border-[color:var(--color-primary)] focus:ring-4 focus:ring-[color:var(--color-focus)]"
            placeholder="Acme Ghana Ltd"
          />
        </label>

        <label className="text-sm font-semibold text-[color:var(--color-foreground)]">
          Employee headcount
          <input
            name="headcount"
            required
            type="number"
            inputMode="numeric"
            min={1}
            className="mt-1 w-full rounded-lg border border-[color:var(--color-input-border)] px-3 py-2 text-sm font-normal outline-none focus:border-[color:var(--color-primary)] focus:ring-4 focus:ring-[color:var(--color-focus)]"
            placeholder="250"
          />
        </label>

        <label className="text-sm font-semibold text-[color:var(--color-foreground)]">
          Contact name
          <input
            name="contactName"
            required
            autoComplete="name"
            className="mt-1 w-full rounded-lg border border-[color:var(--color-input-border)] px-3 py-2 text-sm font-normal outline-none focus:border-[color:var(--color-primary)] focus:ring-4 focus:ring-[color:var(--color-focus)]"
            placeholder="Ama Mensah"
          />
        </label>

        <label className="text-sm font-semibold text-[color:var(--color-foreground)]">
          Contact number
          <input
            name="contactNumber"
            required
            type="tel"
            autoComplete="tel"
            className="mt-1 w-full rounded-lg border border-[color:var(--color-input-border)] px-3 py-2 text-sm font-normal outline-none focus:border-[color:var(--color-primary)] focus:ring-4 focus:ring-[color:var(--color-focus)]"
            placeholder="Your preferred business line"
          />
        </label>

        <label className="text-sm font-semibold text-[color:var(--color-foreground)] sm:col-span-2">
          Work email
          <input
            name="email"
            required
            type="email"
            autoComplete="email"
            className="mt-1 w-full rounded-lg border border-[color:var(--color-input-border)] px-3 py-2 text-sm font-normal outline-none focus:border-[color:var(--color-primary)] focus:ring-4 focus:ring-[color:var(--color-focus)]"
            placeholder="hr@company.com"
          />
        </label>

        <label className="text-sm font-semibold text-[color:var(--color-foreground)] sm:col-span-2">
          What would you like to discuss?
          <textarea
            name="notes"
            rows={4}
            className="mt-1 w-full rounded-lg border border-[color:var(--color-input-border)] px-3 py-2 text-sm font-normal outline-none focus:border-[color:var(--color-primary)] focus:ring-4 focus:ring-[color:var(--color-focus)]"
            placeholder="Payroll cycle, deduction cap, approved categories, or portal access"
          />
        </label>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-xl bg-[color:var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)]"
        >
          Request a callback
        </button>
        <a
          href={PAYEASY_WHATSAPP_URL}
          className="inline-flex items-center justify-center rounded-xl border border-[color:var(--color-border-strong)] px-5 py-2.5 text-sm font-semibold text-[color:var(--color-primary)] transition hover:bg-[color:var(--color-muted-bg)]"
        >
          WhatsApp {PAYEASY_SUPPORT_PHONE_DISPLAY}
        </a>
      </div>

      {submitted ? (
        <p className="mt-3 text-xs font-semibold text-[color:var(--color-success)]">
          Opening your email client with the lead details. You can send it as-is or add more context.
        </p>
      ) : null}
    </form>
  );
}
