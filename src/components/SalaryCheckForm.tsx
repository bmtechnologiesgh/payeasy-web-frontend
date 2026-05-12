"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";

export const PAYEASY_CREDIT_SNAPSHOT_ID = "payeasy-credit-snapshot";

/** Client navigation from the home salary check into the unlocked catalogue. */
export function SalaryCheckForm() {
  const router = useRouter();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const salaryField = fd.get("salary");
    const raw = typeof salaryField === "string" ? salaryField.trim() : "";
    const params = new URLSearchParams();
    if (raw) {
      params.set("salary", raw);
      params.set("eligible", "1");
    }

    router.push(params.toString() ? `/catalog?${params.toString()}` : "/catalog");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-2 md:w-auto md:shrink-0"
    >
      <div className="flex gap-2">
        <div className="relative flex-1 md:w-44 md:flex-none">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold uppercase tracking-wide text-white/55">
            GHS
          </span>
          <input
            name="salary"
            type="number"
            inputMode="numeric"
            min={0}
            step={100}
            placeholder="6,500"
            aria-label="Monthly salary in GHS"
            className="w-full rounded-xl bg-white/10 py-2.5 pl-12 pr-3 text-sm font-semibold text-white outline-none ring-1 ring-inset ring-white/20 placeholder:text-white/45 focus:ring-2 focus:ring-[color:var(--color-accent)]"
          />
        </div>
        <button
          type="submit"
          className="whitespace-nowrap rounded-xl bg-[color:var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-accent-hover)]"
        >
          Check
        </button>
      </div>
      <Link
        href="/how-it-works"
        className="self-start text-[11px] font-semibold uppercase tracking-wide text-white/65 underline-offset-4 hover:text-white hover:underline"
      >
        How it works
      </Link>
    </form>
  );
}
