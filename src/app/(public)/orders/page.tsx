import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "My orders",
};

export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-[860px] px-4 py-12 sm:px-6">
      <header className="text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-muted)]">
          Your PayEasy orders
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-bold text-[color:var(--color-foreground)] sm:text-4xl">
          No active orders yet
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-[color:var(--color-muted)]">
          Once you confirm your first plan, you&apos;ll see the deduction schedule, paid instalments, and remaining
          balance here. Production builds will sync this with the PayEasy API.
        </p>
      </header>

      <section className="mt-10 rounded-2xl border border-dashed border-[color:var(--color-border-strong)] bg-white p-8 text-center">
        <span aria-hidden className="text-3xl">
          📦
        </span>
        <p className="mt-4 text-sm font-semibold text-[color:var(--color-foreground)]">
          Nothing to track right now.
        </p>
        <p className="mt-1 text-sm text-[color:var(--color-muted)]">
          Browse the catalogue and pick a plan to see what your order summary will look like.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link
            href="/catalog"
            className="inline-flex items-center justify-center rounded-xl bg-[color:var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)]"
          >
            Browse the catalogue
          </Link>
          <Link
            href="/eligibility"
            className="inline-flex items-center justify-center rounded-xl border border-[color:var(--color-border-strong)] bg-white px-5 py-2.5 text-sm font-semibold text-[color:var(--color-foreground)] hover:bg-[color:var(--color-muted-bg)]"
          >
            Check eligibility first
          </Link>
        </div>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        <Card title="Deduction schedule" body="See every upcoming payroll deduction with its date and amount." />
        <Card title="Instalment history" body="Every cleared instalment with date, amount, and reference." />
        <Card title="Live balance" body="How much is left across each active plan, in real time." />
      </section>
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
