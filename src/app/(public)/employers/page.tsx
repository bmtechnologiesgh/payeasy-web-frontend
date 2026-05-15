import type { Metadata } from "next";
import Link from "next/link";
import { EmployerLeadForm } from "@/components/EmployerLeadForm";

export const metadata: Metadata = {
  title: "For employers",
};

const PILLARS = [
  {
    title: "Zero balance-sheet exposure",
    body: "PayEasy carries the credit risk. Your company merely deducts authorised amounts at payroll cycle and remits to PayEasy.",
  },
  {
    title: "Authorised mandate",
    body: "Every order generates an employee-signed deduction mandate, scoped to a fixed monthly amount and end date.",
  },
  {
    title: "Salary-aware caps",
    body: "Monthly deductions are capped at 30% of gross salary per employee. PayEasy enforces the cap before checkout.",
  },
  {
    title: "Reconciliation built in",
    body: "Per-employee statements, remittance reports, and exit-employee handoff workflows — included.",
  },
];

const FLOW = [
  { title: "Apply", body: "Submit company details, payroll contact, and verification documents." },
  { title: "Verify", body: "Our compliance team confirms employer status, payroll cycle, and HR signatory." },
  { title: "Configure", body: "Set deduction caps and approved categories. Choose payroll integration or CSV." },
  { title: "Onboard staff", body: "Employees self-onboard with their work email; eligibility is automatic." },
];

export default function EmployersPage() {
  return (
    <div className="mx-auto max-w-[1080px] px-4 py-10 sm:px-6">
      <header className="grid gap-8 rounded-3xl bg-[color:var(--color-primary)] p-8 text-white sm:grid-cols-[1.4fr_1fr] sm:p-12">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-accent)]">For HR & finance</p>
          <h1 className="mt-3 font-[family-name:var(--font-heading)] text-3xl font-bold leading-tight sm:text-4xl">
            Give your employees Pay-Small-Small without writing a credit cheque.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80">
            PayEasy is the payroll-backed BNPL programme built for Ghanaian employers. Your team gets a vetted
            employee benefit; PayEasy carries the underwriting, fulfilment, and reconciliation.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="#employer-lead-form"
              className="inline-flex items-center justify-center rounded-xl bg-[color:var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-accent-hover)]"
            >
              Talk to our team
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center rounded-xl border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              How the employee flow works
            </Link>
          </div>
        </div>
        <ul className="grid gap-2 self-center text-sm text-white/85">
          <li>✓ No company guarantee</li>
          <li>✓ No payroll software change required</li>
          <li>✓ CSV upload available if API is not</li>
          <li>✓ Per-employee, per-cycle reporting</li>
          <li>✓ Branded benefit communications</li>
        </ul>
      </header>

      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[color:var(--color-foreground)]">
          Why employers choose PayEasy
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {PILLARS.map((p) => (
            <article
              key={p.title}
              className="rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-5 shadow-sm"
            >
              <p className="font-[family-name:var(--font-heading)] text-base font-bold text-[color:var(--color-foreground)]">
                {p.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-muted)]">{p.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-muted-bg)] p-6 sm:p-8">
        <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[color:var(--color-foreground)]">
          Employer onboarding flow
        </h2>
        <ol className="mt-5 grid gap-4 sm:grid-cols-4">
          {FLOW.map((f, i) => (
            <li key={f.title} className="rounded-xl border border-[color:var(--color-border)] bg-white p-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">
                Step {i + 1}
              </span>
              <p className="mt-1 font-[family-name:var(--font-heading)] text-base font-bold text-[color:var(--color-foreground)]">
                {f.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[color:var(--color-muted)]">{f.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.85fr] lg:items-start">
        <EmployerLeadForm />
        <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-muted-bg)] p-6">
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[color:var(--color-foreground)]">
            What happens after you submit?
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[color:var(--color-muted)]">
            <li>
              <span className="font-semibold text-[color:var(--color-foreground)]">1. Qualification call:</span>{" "}
              confirm headcount, payroll cycle, and HR signatory.
            </li>
            <li>
              <span className="font-semibold text-[color:var(--color-foreground)]">2. Deduction setup:</span>{" "}
              choose employee caps, reporting cadence, and remittance workflow.
            </li>
            <li>
              <span className="font-semibold text-[color:var(--color-foreground)]">3. Staff launch:</span>{" "}
              employees get a salary-aware catalogue they can use immediately.
            </li>
          </ul>
        </div>
      </section>

      <p className="mt-8 text-center text-xs text-[color:var(--color-muted)]">
        The employer portal launches in Phase 3 of the PayEasy build. This page collects interest from HR &
        finance teams who&apos;d like a walkthrough.
      </p>
    </div>
  );
}
