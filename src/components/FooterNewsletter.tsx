"use client";

import type { FormEvent } from "react";

export function FooterNewsletter() {
  function onSubmit(e: FormEvent) {
    e.preventDefault();
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-stretch">
      <label className="sr-only" htmlFor="footer-email">
        Email address
      </label>
      <div className="relative flex-1">
        <input
          id="footer-email"
          type="email"
          placeholder="Enter your email address"
          autoComplete="email"
          className="w-full rounded-xl border border-[color:var(--color-input-border)] bg-[color:var(--color-muted-bg)] px-4 py-3 text-sm outline-none ring-[color:var(--color-focus)] placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-border-strong)] focus:ring-4"
        />
      </div>
      <button
        type="submit"
        className="shrink-0 rounded-xl bg-[color:var(--color-primary)] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)]"
      >
        Subscribe
      </button>
    </form>
  );
}
