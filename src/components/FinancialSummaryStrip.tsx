import Link from "next/link";
import { formatGhs } from "@/lib/format";
import {
  buildSalaryContext,
  CREDIT_LIMIT_RATE,
  DEDUCTION_CAP_RATE,
} from "@/lib/eligibility";

type Props = {
  salaryGhs: number | null;
};

/**
 * Slim horizontal credit-snapshot banner. Sits directly under the hero row so the
 * BNPL value-prop (estimate limit / show approved limit) stays above the fold
 * without competing with the Motta-style category sidebar.
 */
export function FinancialSummaryStrip({ salaryGhs }: Props) {
  const ctx = buildSalaryContext(salaryGhs);
  const isAnonymous = ctx.salaryGhs == null;

  return (
    <aside
      aria-label="Your PayEasy credit snapshot"
      className="flex flex-col gap-4 rounded-2xl border border-[color:var(--color-primary)] bg-[color:var(--color-primary)] p-4 text-white shadow-sm sm:p-5 md:flex-row md:items-center md:gap-6 md:py-4"
    >
      {isAnonymous ? (
        <>
          <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-[color:var(--color-accent)] md:flex">
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
              <path
                d="M3 7h18v10H3zM3 10h18M7 14h4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </span>

          <div className="min-w-0 md:flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-accent)]">
              Pay-Small-Small
            </p>
            <p className="mt-1 font-[family-name:var(--font-heading)] text-lg font-extrabold leading-tight text-white sm:text-xl">
              See what you qualify for in seconds.
            </p>
            <p className="mt-1.5 text-[12px] leading-snug text-white/75 md:text-[13px]">
              Tell us your monthly salary — we&apos;ll estimate your credit limit and which catalogue items fit your{" "}
              {Math.round(DEDUCTION_CAP_RATE * 100)}% deduction cap. No credit check, no signup.
            </p>
          </div>

          <div className="flex items-center gap-3 md:shrink-0">
            <Link
              href="/eligibility"
              className="inline-flex items-center justify-center rounded-xl bg-[color:var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-accent-hover)]"
            >
              Estimate my limit
            </Link>
            <Link
              href="/how-it-works"
              className="hidden text-[12px] font-semibold uppercase tracking-wide text-white/80 underline-offset-4 hover:underline sm:inline"
            >
              How it works
            </Link>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-4 md:flex-1">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-accent)]">
                Available credit
              </p>
              <p className="mt-1 font-[family-name:var(--font-heading)] text-2xl font-light leading-none tracking-tight text-[color:var(--color-accent)] sm:text-[28px]">
                {formatGhs(ctx.creditLimitGhs)}
              </p>
              <p className="mt-1 text-[11px] text-white/65">
                {Math.round(CREDIT_LIMIT_RATE * 100)}% of {formatGhs(ctx.salaryGhs)} salary · {ctx.employer}
              </p>
            </div>
          </div>

          <dl className="grid flex-1 grid-cols-3 gap-3 border-t border-white/15 pt-3 md:border-l md:border-t-0 md:pl-6 md:pt-0">
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-white/55">
                Monthly cap
              </dt>
              <dd className="mt-1 text-sm font-semibold text-white">{formatGhs(ctx.monthlyCapGhs)}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-white/55">
                Active orders
              </dt>
              <dd className="mt-1 text-sm font-semibold text-white">0</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-white/55">
                Next deduction
              </dt>
              <dd className="mt-1 text-sm font-semibold text-white">—</dd>
            </div>
          </dl>

          <div className="flex items-center gap-2 md:shrink-0">
            <Link
              href={`/catalog?salary=${ctx.salaryGhs}`}
              className="inline-flex items-center justify-center rounded-xl bg-[color:var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-accent-hover)]"
            >
              Browse eligible
            </Link>
            <Link
              href="/eligibility"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-white/85 transition hover:bg-white/10"
            >
              Edit
            </Link>
          </div>
        </>
      )}
    </aside>
  );
}
