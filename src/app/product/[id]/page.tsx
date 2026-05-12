import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById, getProducts, type TenureKey } from "@/lib/catalog";
import { formatGhs } from "@/lib/format";
import { slugify } from "@/lib/slug";
import {
  buildSalaryContext,
  evaluateProduct,
  readSalaryFromSearchParams,
  TENURE_LABELS,
  TENURE_MONTHS,
  withSalaryParam,
} from "@/lib/eligibility";

export async function generateStaticParams() {
  return getProducts().map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) return { title: "Product" };
  return { title: product.name };
}

type SearchParams = Record<string, string | string[] | undefined>;

function pickStringParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<SearchParams>;
}) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const product = getProductById(id);
  if (!product) notFound();

  const salaryGhs = readSalaryFromSearchParams(sp.salary);
  const ctx = buildSalaryContext(salaryGhs);
  const evaluation = evaluateProduct(product, ctx);

  const planParam = pickStringParam(sp.plan) as TenureKey | undefined;
  const validTenures = evaluation.plans.map((p) => p.tenure);
  const selectedTenure: TenureKey =
    planParam && validTenures.includes(planParam)
      ? planParam
      : evaluation.bestPlan?.tenure ?? validTenures[validTenures.length - 1];
  const selectedPlan =
    evaluation.plans.find((p) => p.tenure === selectedTenure) ?? evaluation.plans[0];

  const catSlug = slugify(product.category);
  const related = getProducts()
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const planHref = (tenure: TenureKey) => {
    const params = new URLSearchParams();
    if (salaryGhs != null) params.set("salary", String(salaryGhs));
    params.set("plan", tenure);
    return `/product/${product.id}?${params.toString()}`;
  };

  const checkoutHref = `/checkout/${product.id}/${selectedTenure}${
    salaryGhs != null ? `?salary=${salaryGhs}` : ""
  }`;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 pb-32 sm:px-6 md:pb-8">
      <nav className="mb-6 text-sm text-[color:var(--color-muted)]">
        <Link href={withSalaryParam("/", salaryGhs)} className="hover:text-[color:var(--color-primary)]">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href={withSalaryParam("/catalog", salaryGhs)} className="hover:text-[color:var(--color-primary)]">
          Catalogue
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={withSalaryParam(`/catalog/${catSlug}`, salaryGhs)}
          className="hover:text-[color:var(--color-primary)]"
        >
          {product.category}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[color:var(--color-foreground)]">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div className="rounded-2xl border border-[color:var(--color-border)] bg-white p-6 shadow-sm">
          <div className="relative mx-auto aspect-square max-w-[480px] bg-[color:var(--color-app)]">
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority
              className="object-contain p-6"
              unoptimized
            />
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-3 text-xs text-[color:var(--color-muted)]">
            <li className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-muted-bg)] px-3 py-2">
              <span className="block text-[10px] font-bold uppercase tracking-wide text-[color:var(--color-foreground)]">
                Payroll-deducted
              </span>
              No cards. No standing orders.
            </li>
            <li className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-muted-bg)] px-3 py-2">
              <span className="block text-[10px] font-bold uppercase tracking-wide text-[color:var(--color-foreground)]">
                Fee included
              </span>
              Every plan total is final.
            </li>
            <li className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-muted-bg)] px-3 py-2">
              <span className="block text-[10px] font-bold uppercase tracking-wide text-[color:var(--color-foreground)]">
                30% cap
              </span>
              Monthly stays under salary cap.
            </li>
            <li className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-muted-bg)] px-3 py-2">
              <span className="block text-[10px] font-bold uppercase tracking-wide text-[color:var(--color-foreground)]">
                72hr fulfilment
              </span>
              Delivered to your registered address.
            </li>
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--color-muted)]">
            {product.category}
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-bold text-[color:var(--color-foreground)]">
            {product.name}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-muted)]">
            Pick a payroll-friendly repayment plan. The total payable is shown before you commit — the PayEasy
            service fee is already included in each plan total.
          </p>

          <section aria-labelledby="plans-heading" className="mt-8">
            <div className="flex items-center justify-between">
              <h2
                id="plans-heading"
                className="font-[family-name:var(--font-heading)] text-lg font-bold text-[color:var(--color-foreground)]"
              >
                Choose your repayment plan
              </h2>
              {ctx.salaryGhs != null ? (
                <span className="text-[11px] font-semibold text-[color:var(--color-muted)]">
                  Cap {formatGhs(ctx.monthlyCapGhs)}/mo
                </span>
              ) : null}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {evaluation.plans.map((plan) => {
                const selected = plan.tenure === selectedTenure;
                const monthly = Math.round(plan.monthly);
                const eligibilityClass =
                  ctx.salaryGhs == null
                    ? ""
                    : plan.fitsCap && plan.fitsLimit
                    ? "border-[color:var(--color-success)]"
                    : plan.fitsCap
                    ? "border-[color:var(--color-warning)]"
                    : "border-[color:var(--color-danger)]";
                return (
                  <Link
                    key={plan.tenure}
                    href={planHref(plan.tenure)}
                    aria-pressed={selected}
                    className={`relative flex flex-col gap-1 rounded-xl border-2 px-4 py-3 text-left transition ${
                      selected
                        ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-white shadow-sm"
                        : `bg-white text-[color:var(--color-foreground)] hover:border-[color:var(--color-primary)] ${eligibilityClass || "border-[color:var(--color-border-strong)]"}`
                    }`}
                  >
                    {selected ? (
                      <span
                        aria-hidden
                        className="absolute right-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--color-accent)] text-[10px] font-bold text-[color:var(--color-primary)]"
                      >
                        ✓
                      </span>
                    ) : null}
                    <span className="text-xs font-semibold uppercase tracking-wide opacity-80">
                      {TENURE_LABELS[plan.tenure]}
                    </span>
                    <span className="text-xl font-bold">
                      {formatGhs(monthly)}
                      <span className="ml-1 text-xs font-medium opacity-80">/ mo</span>
                    </span>
                    <span className="text-[11px] opacity-80">Total {formatGhs(Math.round(plan.total))}</span>
                    {ctx.salaryGhs != null ? (
                      plan.fitsCap && plan.fitsLimit ? (
                        <span className="text-[10px] font-semibold uppercase tracking-wide opacity-80">
                          Eligible
                        </span>
                      ) : plan.fitsCap ? (
                        <span className="text-[10px] font-semibold uppercase tracking-wide opacity-80">
                          Over limit
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold uppercase tracking-wide opacity-80">
                          Above 30% cap
                        </span>
                      )
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </section>

          {selectedPlan ? (
            <section
              aria-labelledby="fee-heading"
              className="mt-6 rounded-xl border border-[color:var(--color-border-strong)] bg-white p-5 shadow-sm"
            >
              <h2
                id="fee-heading"
                className="text-[11px] font-bold uppercase tracking-[0.14em] text-[color:var(--color-muted)]"
              >
                Plan summary · {TENURE_LABELS[selectedPlan.tenure]}
              </h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-[color:var(--color-muted)]">Monthly deduction</dt>
                  <dd className="font-bold text-[color:var(--color-foreground)]">
                    {formatGhs(Math.round(selectedPlan.monthly))} × {selectedPlan.months}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-[color:var(--color-muted)]">Total payable</dt>
                  <dd className="font-bold text-[color:var(--color-foreground)]">
                    {formatGhs(Math.round(selectedPlan.total))}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-[color:var(--color-muted)]">Service fee</dt>
                  <dd className="font-semibold text-[color:var(--color-hot)]">Included in total</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-[color:var(--color-muted)]">Payment method</dt>
                  <dd className="font-semibold text-[color:var(--color-foreground)]">Payroll deduction</dd>
                </div>
              </dl>
              <p className="mt-3 text-[11px] leading-relaxed text-[color:var(--color-muted)]">
                ⚡ The PayEasy service fee is baked into every plan total — no surprise charges, no separate line
                item to remember. Compare totals across plans to find the lowest you can comfortably afford.
              </p>
            </section>
          ) : null}

          <section
            aria-labelledby="eligibility-heading"
            className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
              evaluation.status === "approved"
                ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-white"
                : evaluation.status === "pending"
                ? "border-[color:var(--color-warning)] bg-[color:var(--color-warning-bg)] text-[color:var(--color-foreground)]"
                : evaluation.status === "locked"
                ? "border-[color:var(--color-danger)] bg-[color:var(--color-danger-bg)] text-[color:var(--color-foreground)]"
                : "border-[color:var(--color-border-strong)] bg-white text-[color:var(--color-foreground)]"
            }`}
          >
            <h2 id="eligibility-heading" className="text-[11px] font-bold uppercase tracking-wide opacity-80">
              Eligibility check
            </h2>
            {ctx.salaryGhs == null ? (
              <p className="mt-1">
                <Link href="/eligibility" className="font-bold underline underline-offset-4">
                  Tell us your monthly salary
                </Link>{" "}
                to see whether this plan fits your 30% deduction cap and credit limit.
              </p>
            ) : evaluation.status === "approved" && selectedPlan ? (
              <p className="mt-1">
                <span className="font-bold">✓ You&apos;re eligible for this plan.</span>{" "}
                {formatGhs(Math.round(selectedPlan.monthly))}/mo is within your 30% deduction limit (
                {formatGhs(ctx.monthlyCapGhs)}/mo max).
              </p>
            ) : (
              <p className="mt-1">
                <span className="font-bold">{evaluation.status === "pending" ? "Tight fit." : "Not eligible yet."}</span>{" "}
                {evaluation.reason}
              </p>
            )}
          </section>

          <p className="mt-4 text-xs text-[color:var(--color-muted)]">
            🚚 Delivery to your registered address within 72 hours of order confirmation.
          </p>

          <p className="mt-4 text-xs text-[color:var(--color-muted)]">
            Illustrative catalogue only — checkout, eligibility, and payroll deductions are not wired up in this
            static demo.
          </p>
        </div>
      </div>

      {selectedPlan ? (
        <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] z-30 border-t border-[color:var(--color-border)] bg-white/95 px-4 py-3 backdrop-blur md:bottom-6 md:left-auto md:right-6 md:rounded-2xl md:border md:border-[color:var(--color-border-strong)] md:px-6 md:py-4 md:shadow-lg">
          <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 md:max-w-none">
            <div>
              <p className="text-lg font-bold text-[color:var(--color-foreground)]">
                {formatGhs(Math.round(selectedPlan.monthly))} / mo
              </p>
              <p className="text-[11px] text-[color:var(--color-muted)]">
                × {selectedPlan.months} months · total {formatGhs(Math.round(selectedPlan.total))}
              </p>
            </div>
            <Link
              href={checkoutHref}
              aria-disabled={evaluation.status === "locked"}
              className={`inline-flex h-12 items-center justify-center rounded-xl px-5 text-sm font-semibold transition ${
                evaluation.status === "locked"
                  ? "bg-[color:var(--color-muted-bg)] text-[color:var(--color-muted)] pointer-events-none"
                  : "bg-[color:var(--color-primary)] text-white hover:bg-[color:var(--color-primary-hover)]"
              }`}
            >
              {evaluation.status === "locked" ? "Not eligible" : "Continue →"}
            </Link>
          </div>
        </div>
      ) : null}

      {related.length ? (
        <section className="mt-14">
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[color:var(--color-foreground)]">
            More in {product.category}
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p) => {
              const monthly = (() => {
                const sixth = p.pricesGhs.months6;
                if (sixth == null) return null;
                return Math.round(sixth / TENURE_MONTHS.months6);
              })();
              return (
                <Link
                  key={p.id}
                  href={withSalaryParam(`/product/${p.id}`, salaryGhs)}
                  className="rounded-xl border border-[color:var(--color-border)] bg-white p-3 text-sm font-semibold shadow-sm hover:border-[color:var(--color-primary)]/30"
                >
                  <div className="relative mb-2 aspect-square bg-[color:var(--color-app)]">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      className="object-contain p-2"
                      unoptimized
                    />
                  </div>
                  <span className="line-clamp-2">{p.name}</span>
                  <span className="mt-1 block text-xs font-normal text-[color:var(--color-muted)]">
                    {monthly != null ? `From ${formatGhs(monthly)}/mo × 6` : `From ${formatGhs(p.fromPriceGhs ?? undefined)}`}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
