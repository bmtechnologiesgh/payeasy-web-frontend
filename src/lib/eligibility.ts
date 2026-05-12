import type { Product, TenureKey } from "@/lib/catalog";

/**
 * BNPL eligibility & instalment helpers.
 *
 * Conventions
 * -----------
 * - All amounts are GHS.
 * - Tenure totals (`product.pricesGhs[tenure]`) are *selling totals* that already include
 *   the PayEasy service fee. Internal cost / fee % never reaches this file.
 * - Salary is read from a `?salary=` query string (whole GHS) so reviewers can demo the
 *   eligible / pending / locked states without auth or a backend.
 * - Employer policy mirrors the mobile app + Phase 1 prompt:
 *     creditLimit       = 50% of monthly gross salary
 *     monthlyDeductionCap = 30% of monthly gross salary
 */
export const TENURES: TenureKey[] = ["months3", "months4", "months5", "months6"];

export const TENURE_MONTHS: Record<TenureKey, number> = {
  months3: 3,
  months4: 4,
  months5: 5,
  months6: 6,
};

export const TENURE_LABELS: Record<TenureKey, string> = {
  months3: "3 months",
  months4: "4 months",
  months5: "5 months",
  months6: "6 months",
};

export const CREDIT_LIMIT_RATE = 0.5;
export const DEDUCTION_CAP_RATE = 0.3;

/** Default mock employer used for anonymous demo visitors. */
export const DEFAULT_EMPLOYER = "Ghana Revenue Authority";

export type SalaryContext = {
  /** Raw salary the visitor hinted via `?salary=`. `null` means anonymous browse. */
  salaryGhs: number | null;
  /** Computed monthly credit limit (50% of salary). */
  creditLimitGhs: number;
  /** Computed monthly deduction cap (30% of salary). */
  monthlyCapGhs: number;
  /** Pretty employer label for display. */
  employer: string;
};

export function readSalaryFromSearchParams(
  raw: string | string[] | undefined,
): number | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value == null || value === "") return null;
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return null;
  return Math.round(num);
}

export function buildSalaryContext(salaryGhs: number | null): SalaryContext {
  if (salaryGhs == null) {
    return {
      salaryGhs: null,
      creditLimitGhs: 0,
      monthlyCapGhs: 0,
      employer: DEFAULT_EMPLOYER,
    };
  }
  return {
    salaryGhs,
    creditLimitGhs: Math.round(salaryGhs * CREDIT_LIMIT_RATE),
    monthlyCapGhs: Math.round(salaryGhs * DEDUCTION_CAP_RATE),
    employer: DEFAULT_EMPLOYER,
  };
}

export type Plan = {
  tenure: TenureKey;
  months: number;
  total: number;
  monthly: number;
};

export function computePlans(product: Product): Plan[] {
  return TENURES.flatMap((tenure) => {
    const total = product.pricesGhs[tenure];
    if (total == null) return [];
    const months = TENURE_MONTHS[tenure];
    return [{ tenure, months, total, monthly: total / months }];
  });
}

/** Cheapest monthly across available plans (falls back to `null` if no plans). */
export function lowestMonthly(product: Product): { plan: Plan } | null {
  const plans = computePlans(product);
  if (plans.length === 0) return null;
  let best = plans[0];
  for (const p of plans) {
    if (p.monthly < best.monthly) best = p;
  }
  return { plan: best };
}

/**
 * Implied minimum monthly salary so the 6-month (longest, lowest-monthly) plan
 * still fits under the 30% deduction cap. Used for the "Min. salary" chip.
 */
export function minSalaryFor(product: Product): number | null {
  const longest = product.pricesGhs.months6 ?? product.pricesGhs.months5 ?? product.pricesGhs.months4 ?? product.pricesGhs.months3;
  if (longest == null) return null;
  const months = product.pricesGhs.months6
    ? 6
    : product.pricesGhs.months5
    ? 5
    : product.pricesGhs.months4
    ? 4
    : 3;
  const monthly = longest / months;
  return Math.ceil(monthly / DEDUCTION_CAP_RATE / 50) * 50; // round up to nearest 50 GHS
}

export type EligibilityStatus = "approved" | "pending" | "locked" | "anonymous";

export type ProductEligibility = {
  status: EligibilityStatus;
  /** Monthly of the cheapest plan that fits the deduction cap, if any. */
  bestPlan: Plan | null;
  /** Plan-by-plan breakdown so detail screens can render a selector. */
  plans: (Plan & { fitsCap: boolean; fitsLimit: boolean })[];
  reason: string | null;
  minSalaryGhs: number | null;
};

export function evaluateProduct(
  product: Product,
  ctx: SalaryContext,
): ProductEligibility {
  const plans = computePlans(product);
  const minSalaryGhs = minSalaryFor(product);

  if (ctx.salaryGhs == null) {
    return {
      status: "anonymous",
      bestPlan: lowestMonthly(product)?.plan ?? null,
      plans: plans.map((p) => ({ ...p, fitsCap: true, fitsLimit: true })),
      reason: null,
      minSalaryGhs,
    };
  }

  const annotated = plans.map((p) => ({
    ...p,
    fitsCap: p.monthly <= ctx.monthlyCapGhs,
    fitsLimit: p.total <= ctx.creditLimitGhs,
  }));
  const fits = annotated.filter((p) => p.fitsCap && p.fitsLimit);

  if (fits.length > 0) {
    const best = [...fits].sort((a, b) => a.monthly - b.monthly)[0];
    return {
      status: "approved",
      bestPlan: best,
      plans: annotated,
      reason: null,
      minSalaryGhs,
    };
  }

  const fitsCapOnly = annotated.filter((p) => p.fitsCap);
  if (fitsCapOnly.length > 0) {
    return {
      status: "pending",
      bestPlan: fitsCapOnly[0],
      plans: annotated,
      reason: `Plan total exceeds your ${formatGhsCompact(ctx.creditLimitGhs)} credit limit — speak to your employer about a higher cap.`,
      minSalaryGhs,
    };
  }

  return {
    status: "locked",
    bestPlan: null,
    plans: annotated,
    reason:
      minSalaryGhs != null
        ? `Min. salary ${formatGhsCompact(minSalaryGhs)} required to keep deductions under 30%.`
        : "Outside your monthly deduction cap.",
    minSalaryGhs,
  };
}

function formatGhsCompact(amount: number): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Append `?salary=` to a relative URL while preserving any other query string.
 * Used by client-side controls that want to bake the salary hint into hrefs.
 */
export function withSalaryParam(href: string, salaryGhs: number | null): string {
  if (salaryGhs == null) return href;
  const [path, search = ""] = href.split("?");
  const params = new URLSearchParams(search);
  params.set("salary", String(salaryGhs));
  return `${path}?${params.toString()}`;
}

/**
 * Sort & optionally filter a catalogue by eligibility:
 *   - When `payrollOnly` is set, drops products whose only feasible status is locked.
 *   - Always re-orders to put approved → pending → locked.
 */
export function applyEligibility(
  products: Product[],
  ctx: SalaryContext,
  opts: { payrollOnly?: boolean; eligibleOnly?: boolean } = {},
): Product[] {
  if (ctx.salaryGhs == null) return products;

  const ranked = products
    .map((p) => ({ p, e: evaluateProduct(p, ctx) }))
    .filter(({ e }) => {
      if (opts.eligibleOnly) return e.status === "approved";
      if (opts.payrollOnly) return e.status !== "locked";
      return true;
    });

  const order: Record<EligibilityStatus, number> = {
    approved: 0,
    pending: 1,
    locked: 2,
    anonymous: 3,
  };

  ranked.sort((a, b) => {
    const diff = order[a.e.status] - order[b.e.status];
    if (diff !== 0) return diff;
    const aMonthly = a.e.bestPlan?.monthly ?? Number.POSITIVE_INFINITY;
    const bMonthly = b.e.bestPlan?.monthly ?? Number.POSITIVE_INFINITY;
    return aMonthly - bMonthly;
  });

  return ranked.map(({ p }) => p);
}
