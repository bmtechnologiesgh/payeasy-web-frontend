import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById, type TenureKey } from "@/lib/catalog";
import { formatGhs } from "@/lib/format";
import {
  buildSalaryContext,
  evaluateProduct,
  readSalaryFromSearchParams,
  TENURE_LABELS,
} from "@/lib/eligibility";

const VALID_TENURES: TenureKey[] = ["months3", "months4", "months5", "months6"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; months: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);
  return {
    title: product ? `Confirm order · ${product.name}` : "Confirm order",
  };
}

type SearchParams = Record<string, string | string[] | undefined>;

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; months: string }>;
  searchParams?: Promise<SearchParams>;
}) {
  const { id, months } = await params;
  const sp = (await searchParams) ?? {};
  const product = getProductById(id);
  if (!product) notFound();

  const tenure = months as TenureKey;
  if (!VALID_TENURES.includes(tenure)) notFound();

  const salaryGhs = readSalaryFromSearchParams(sp.salary);
  const ctx = buildSalaryContext(salaryGhs);
  const evaluation = evaluateProduct(product, ctx);

  const plan = evaluation.plans.find((p) => p.tenure === tenure);
  if (!plan) notFound();

  const monthly = Math.round(plan.monthly);
  const total = Math.round(plan.total);
  const startMonth = nextMonthLabel();
  const eligibility = evaluation.plans.find((p) => p.tenure === tenure);
  const fitsCap = eligibility?.fitsCap ?? true;
  const fitsLimit = eligibility?.fitsLimit ?? true;

  const remainingCredit =
    ctx.salaryGhs != null ? Math.max(0, ctx.creditLimitGhs - total) : null;
  const utilisationPct =
    ctx.creditLimitGhs > 0
      ? Math.min(100, Math.round((total / ctx.creditLimitGhs) * 100))
      : 0;

  return (
    <div className="mx-auto max-w-[860px] px-4 py-8 pb-24 sm:px-6 md:pb-12">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-muted)]">
            Step 4 of 4 · Order summary
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-bold text-[color:var(--color-foreground)] sm:text-3xl">
            Confirm your order
          </h1>
          <p className="mt-2 text-sm text-[color:var(--color-muted)]">
            Review the deduction schedule before you authorise PayEasy to bill your salary.
          </p>
        </div>
        <Link
          href={`/product/${product.id}${salaryGhs != null ? `?salary=${salaryGhs}&plan=${tenure}` : `?plan=${tenure}`}`}
          aria-label="Back to product"
          className="rounded-full border border-[color:var(--color-border-strong)] px-3 py-1.5 text-xs font-semibold text-[color:var(--color-foreground)] hover:bg-[color:var(--color-muted-bg)]"
        >
          ← Back
        </Link>
      </header>

      <article className="flex items-center gap-4 rounded-2xl border border-[color:var(--color-border)] bg-white p-4 shadow-sm">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[color:var(--color-muted-bg)]">
          <Image src={product.image} alt={product.name} fill className="object-contain p-2" unoptimized />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--color-muted)]">
            {product.category}
          </p>
          <p className="mt-1 font-[family-name:var(--font-heading)] text-lg font-bold text-[color:var(--color-foreground)]">
            {product.name}
          </p>
          <p className="mt-1 text-xs text-[color:var(--color-muted)]">{TENURE_LABELS[tenure]} payroll plan</p>
        </div>
      </article>

      <section className="mt-6 rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 shadow-sm">
        <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[color:var(--color-foreground)]">
          Order breakdown
        </h2>
        <dl className="mt-4 space-y-3 text-sm">
          <Row label="Plan total payable" value={formatGhs(total)} bold />
          <Row label="Monthly deduction" value={`${formatGhs(monthly)} × ${plan.months}`} highlight />
          <Row label="Service fee" value="Included in total" muted />
          <DashedDivider />
          <Row label="Deduction start" value={startMonth} />
          <Row label="Payment method" value="Payroll deduction" highlight />
          <Row label="Employer" value={ctx.employer} muted />
        </dl>

        <div className="mt-5 rounded-xl bg-[color:var(--color-muted-bg)] px-4 py-3 text-xs leading-relaxed text-[color:var(--color-muted)]">
          🏢 {formatGhs(monthly)} will be deducted from your {ctx.employer} salary every month for {plan.months}{" "}
          months. You will receive an SMS confirmation each cycle.
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-[color:var(--color-border)] bg-white p-5 shadow-sm">
        <label className="flex items-start gap-3 text-sm text-[color:var(--color-foreground)]">
          <input
            type="checkbox"
            defaultChecked
            disabled
            className="mt-0.5 h-4 w-4 accent-[color:var(--color-foreground)]"
            aria-label="Authorise payroll deduction"
          />
          <span>
            I authorise PayEasy to deduct{" "}
            <strong>{formatGhs(monthly)}/mo</strong> from my salary for{" "}
            <strong>{plan.months} months</strong> in accordance with the PayEasy{" "}
            <Link href="/how-it-works" className="font-semibold underline">
              terms
            </Link>{" "}
            and my employer&apos;s deduction mandate.
          </span>
        </label>
      </section>

      {ctx.salaryGhs != null ? (
        <section
          aria-labelledby="credit-after"
          className="mt-4 rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-5 shadow-sm"
        >
          <h2
            id="credit-after"
            className="text-[11px] font-bold uppercase tracking-[0.14em] text-[color:var(--color-muted)]"
          >
            Credit after this order
          </h2>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[color:var(--color-muted-bg)]">
            <div
              className="h-full bg-[color:var(--color-primary)]"
              style={{ width: `${utilisationPct}%` }}
              aria-hidden
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-[color:var(--color-muted)]">Available now</span>
            <span className="font-bold text-[color:var(--color-foreground)]">
              {formatGhs(ctx.creditLimitGhs)} → {formatGhs(remainingCredit ?? 0)}
            </span>
          </div>
          {!fitsLimit ? (
            <p className="mt-3 text-xs font-semibold text-[color:var(--color-danger)]">
              ⚠ This plan total ({formatGhs(total)}) exceeds your current credit limit ({formatGhs(ctx.creditLimitGhs)}).
            </p>
          ) : null}
          {!fitsCap ? (
            <p className="mt-3 text-xs font-semibold text-[color:var(--color-warning)]">
              ⚠ Monthly deduction ({formatGhs(monthly)}) is above your 30% cap ({formatGhs(ctx.monthlyCapGhs)}).
            </p>
          ) : null}
        </section>
      ) : (
        <section className="mt-4 rounded-2xl border border-dashed border-[color:var(--color-border-strong)] bg-white p-5 text-sm text-[color:var(--color-muted)]">
          <Link href="/eligibility" className="font-semibold text-[color:var(--color-foreground)] underline">
            Tell us your salary
          </Link>{" "}
          to preview how this order affects your remaining credit limit.
        </section>
      )}

      <div className="mt-6">
        <button
          type="button"
          disabled
          className="inline-flex w-full items-center justify-center rounded-2xl bg-[color:var(--color-accent)] px-6 py-4 text-base font-bold text-white shadow-sm transition hover:bg-[color:var(--color-accent-hover)] disabled:cursor-not-allowed"
          aria-disabled
        >
          Place order →
        </button>
        <p className="mt-2 text-center text-[11px] text-[color:var(--color-muted)]">
          🔒 Static demo — no order is placed. Production builds wire this to the PayEasy API.
        </p>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  highlight,
  muted,
}: {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-[color:var(--color-muted)]">{label}</dt>
      <dd
        className={
          bold
            ? "text-base font-bold text-[color:var(--color-foreground)]"
            : highlight
            ? "font-semibold text-[color:var(--color-foreground)]"
            : muted
            ? "text-[color:var(--color-muted)]"
            : "font-medium text-[color:var(--color-foreground)]"
        }
      >
        {value}
      </dd>
    </div>
  );
}

function DashedDivider() {
  return <div className="my-1 border-t border-dashed border-[color:var(--color-border-strong)]" aria-hidden />;
}

function nextMonthLabel(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toLocaleDateString("en-GH", { month: "long", year: "numeric" });
}
