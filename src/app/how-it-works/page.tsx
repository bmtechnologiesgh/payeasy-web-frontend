import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How Pay-Small-Small works",
};

const STEPS = [
  {
    step: "01",
    title: "Check eligibility",
    body: "Tell us your monthly gross salary. We compute your credit limit (50% of salary) and your deduction cap (30% of salary).",
  },
  {
    step: "02",
    title: "Pick a product",
    body: "Browse the catalogue. Each card shows the lowest monthly across plans plus the minimum salary the longest plan needs.",
  },
  {
    step: "03",
    title: "Compare plans",
    body: "Review 3, 4, 5 and 6-month options side by side. The PayEasy service fee is already baked into every total.",
  },
  {
    step: "04",
    title: "Authorise payroll",
    body: "Confirm the order. Your employer deducts the agreed monthly amount from your salary, on the agreed cycle, until the plan ends.",
  },
];

const FAQ = [
  {
    q: "Are there hidden fees?",
    a: "No. Each plan total includes the PayEasy service fee. We don't add late fees, account fees, or insurance fees.",
  },
  {
    q: "What if I leave my employer?",
    a: "Outstanding instalments become due. You can settle in full or arrange a transfer plan with PayEasy support before your last payroll cycle.",
  },
  {
    q: "Can I choose any product?",
    a: "Anything in the catalogue, as long as the longest plan's monthly fits inside your 30% deduction cap and the total fits inside your credit limit.",
  },
  {
    q: "What if my deduction fails?",
    a: "PayEasy reconciles every cycle with your employer's payroll. If a deduction fails, we contact you within 24 hours to arrange a make-up.",
  },
  {
    q: "Do you check my credit history?",
    a: "No. PayEasy is payroll-backed, not credit-backed. Your eligibility comes from your salary and your employer's status, not a credit bureau.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-[960px] px-4 py-10 sm:px-6">
      <header className="text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-muted)]">
          For employees
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-bold text-[color:var(--color-foreground)] sm:text-4xl">
          How Pay-Small-Small works
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-[color:var(--color-muted)]">
          Buy now, pay from your salary. PayEasy turns your monthly gross income into an employer-approved
          credit line for phones, appliances, and more.
        </p>
      </header>

      <ol className="mt-10 grid gap-4 sm:grid-cols-2">
        {STEPS.map((s) => (
          <li
            key={s.step}
            className="flex gap-4 rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-5 shadow-sm"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-sm font-bold text-white">
              {s.step}
            </span>
            <div>
              <p className="font-[family-name:var(--font-heading)] text-base font-bold text-[color:var(--color-foreground)]">
                {s.title}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-[color:var(--color-muted)]">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <section className="mt-10 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-muted-bg)] p-6">
        <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[color:var(--color-foreground)]">
          Frequently asked
        </h2>
        <dl className="mt-4 divide-y divide-[color:var(--color-border-strong)]">
          {FAQ.map((item) => (
            <div key={item.q} className="py-4">
              <dt className="text-sm font-bold text-[color:var(--color-foreground)]">{item.q}</dt>
              <dd className="mt-1 text-sm text-[color:var(--color-muted)]">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link
          href="/eligibility"
          className="inline-flex items-center justify-center rounded-xl bg-[color:var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)]"
        >
          Check my eligibility
        </Link>
        <Link
          href="/catalog"
          className="inline-flex items-center justify-center rounded-xl border border-[color:var(--color-border-strong)] bg-white px-6 py-3 text-sm font-semibold text-[color:var(--color-foreground)] hover:bg-[color:var(--color-muted-bg)]"
        >
          Browse the catalogue
        </Link>
      </div>
    </div>
  );
}
