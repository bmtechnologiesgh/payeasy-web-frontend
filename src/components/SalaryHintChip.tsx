"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { formatGhs } from "@/lib/format";

const CREDIT_LIMIT_RATE = 0.5;

function SalaryHintChipInner({ compact = false }: { compact?: boolean }) {
  const sp = useSearchParams();
  const raw = sp.get("salary");
  const salary = raw && Number.isFinite(Number(raw)) ? Math.round(Number(raw)) : null;

  if (salary == null) {
    return (
      <Link
        href="/eligibility"
        className={`inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-border-strong)] bg-white text-[color:var(--color-foreground)] transition hover:bg-[color:var(--color-muted-bg)] ${
          compact ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"
        } font-semibold`}
      >
        <span aria-hidden>•</span>
        Check eligibility
      </Link>
    );
  }

  const limit = Math.round(salary * CREDIT_LIMIT_RATE);
  return (
    <Link
      href="/eligibility"
      className={`inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-white transition hover:bg-[color:var(--color-primary-hover)] ${
        compact ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"
      } font-semibold`}
      title={`Salary hint: ${formatGhs(salary)} · Credit limit ${formatGhs(limit)}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent)]" aria-hidden />
      <span className="hidden sm:inline">Limit</span>
      <span>{formatGhs(limit)}</span>
    </Link>
  );
}

export function SalaryHintChip({ compact = false }: { compact?: boolean }) {
  return (
    <Suspense
      fallback={
        <span
          className={`inline-block rounded-full bg-[color:var(--color-muted-bg)] ${
            compact ? "h-6 w-24" : "h-7 w-28"
          }`}
        />
      }
    >
      <SalaryHintChipInner compact={compact} />
    </Suspense>
  );
}
