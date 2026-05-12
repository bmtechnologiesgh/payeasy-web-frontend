import type { Metadata } from "next";
import Link from "next/link";
import {
  buildSalaryContext,
  CREDIT_LIMIT_RATE,
  DEDUCTION_CAP_RATE,
  readSalaryFromSearchParams,
} from "@/lib/eligibility";
import { formatGhs } from "@/lib/format";

export const metadata: Metadata = {
  title: "Check eligibility",
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function EligibilityPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const salaryGhs = readSalaryFromSearchParams(sp.salary);
  const ctx = buildSalaryContext(salaryGhs);

  return (
    <div className="mx-auto max-w-[860px] px-4 py-10 sm:px-6">
      <header className="text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-muted)]">
          Step 1 · Eligibility
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-bold text-[color:var(--color-foreground)] sm:text-4xl">
          Estimate your PayEasy limit
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-[color:var(--color-muted)]">
          PayEasy gives salaried employees a credit limit equal to{" "}
          <strong>{Math.round(CREDIT_LIMIT_RATE * 100)}% of monthly gross salary</strong> and caps the monthly
          deduction at <strong>{Math.round(DEDUCTION_CAP_RATE * 100)}%</strong>. Tell us your salary to see what
          you&apos;d qualify for in this catalogue.
        </p>
      </header>

      <form
        method="get"
        action="/eligibility"
        className="mt-8 rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 shadow-sm"
      >
        <label
          htmlFor="salary"
          className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]"
        >
          Monthly gross salary (GHS)
        </label>
        <div className="mt-2 flex flex-wrap gap-3">
          <input
            id="salary"
            name="salary"
            type="number"
            inputMode="numeric"
            min={0}
            step={100}
            defaultValue={salaryGhs ?? ""}
            placeholder="e.g. 6500"
            className="flex-1 rounded-xl border border-[color:var(--color-input-border)] px-4 py-3 text-base outline-none focus:border-[color:var(--color-primary)] focus:ring-4 focus:ring-[color:var(--color-focus)]"
          />
          <button
            type="submit"
            className="rounded-xl bg-[color:var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)]"
          >
            Estimate
          </button>
        </div>
        <p className="mt-2 text-[11px] text-[color:var(--color-muted)]">
          Static demo — your salary stays in the URL only. Production verifies via your employer&apos;s payroll.
        </p>
      </form>

      {salaryGhs != null ? (
        <section className="mt-8 rounded-2xl border border-[color:var(--color-primary)] bg-[color:var(--color-primary)] p-6 text-white shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-accent)]">Your estimate</p>
          <h2 className="mt-3 font-[family-name:var(--font-heading)] text-2xl font-bold text-[color:var(--color-accent)]">
            {formatGhs(ctx.creditLimitGhs)} credit limit
          </h2>
          <p className="mt-1 text-sm text-white/75">
            Based on a {formatGhs(ctx.salaryGhs ?? 0)} monthly salary.
          </p>

          <dl className="mt-5 grid grid-cols-1 gap-4 border-t border-white/15 pt-5 sm:grid-cols-3">
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-white/60">Credit limit</dt>
              <dd className="mt-1 text-lg font-bold">{formatGhs(ctx.creditLimitGhs)}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-white/60">Monthly cap</dt>
              <dd className="mt-1 text-lg font-bold">{formatGhs(ctx.monthlyCapGhs)}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-white/60">Employer</dt>
              <dd className="mt-1 text-lg font-bold">{ctx.employer}</dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/catalog?salary=${ctx.salaryGhs}`}
              className="inline-flex items-center justify-center rounded-xl bg-[color:var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-accent-hover)]"
            >
              Browse eligible products
            </Link>
            <Link
              href={`/catalog?salary=${ctx.salaryGhs}&payroll=1`}
              className="inline-flex items-center justify-center rounded-xl border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Payroll-backed only
            </Link>
            <Link
              href="/eligibility"
              className="inline-flex items-center justify-center rounded-xl border border-transparent px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-white/70 hover:underline"
            >
              Reset
            </Link>
          </div>
        </section>
      ) : null}

      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        <Card title="Salary band" body="Your monthly gross salary determines the size of your credit line." />
        <Card title="Credit limit" body={`${Math.round(CREDIT_LIMIT_RATE * 100)}% of gross salary, by employer policy.`} />
        <Card title="Deduction cap" body={`Monthly instalments are capped at ${Math.round(DEDUCTION_CAP_RATE * 100)}% of gross salary, so payroll never bites.`} />
      </section>

      <p className="mt-8 text-center text-xs text-[color:var(--color-muted)]">
        This is a static estimator. The production flow verifies salary via your employer&apos;s payroll record.
      </p>
    </div>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-2xl border border-[color:var(--color-border)] bg-white p-5 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">
        {title}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-foreground)]">{body}</p>
    </article>
  );
}
