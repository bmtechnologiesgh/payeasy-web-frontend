import type { Metadata } from "next";
import { CatalogSidebar } from "@/components/CatalogSidebar";
import { EligibilityBanner } from "@/components/EligibilityBanner";
import { ProductGrid } from "@/components/ProductGrid";
import { SalaryChipRow } from "@/components/SalaryChipRow";
import { filterProducts } from "@/lib/catalog";
import {
  applyEligibility,
  buildSalaryContext,
  readSalaryFromSearchParams,
} from "@/lib/eligibility";

export const metadata: Metadata = {
  title: "Catalogue",
};

type SearchParams = Record<string, string | string[] | undefined>;

function first(param: string | string[] | undefined): string | undefined {
  if (Array.isArray(param)) return param[0];
  return param;
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const q = first(sp.q);
  const minRaw = first(sp.min);
  const maxRaw = first(sp.max);
  const min = minRaw != null && minRaw !== "" ? Number(minRaw) : undefined;
  const max = maxRaw != null && maxRaw !== "" ? Number(maxRaw) : undefined;
  const payrollOnly = first(sp.payroll) === "1";

  const salaryGhs = readSalaryFromSearchParams(sp.salary);
  const ctx = buildSalaryContext(salaryGhs);

  const filtered = filterProducts({
    q,
    min: Number.isFinite(min) ? min : undefined,
    max: Number.isFinite(max) ? max : undefined,
  });
  const products = applyEligibility(filtered, ctx, { payrollOnly });

  const preserve: Record<string, string | undefined> = {
    q: q ?? undefined,
    min: Number.isFinite(min) ? String(min) : undefined,
    max: Number.isFinite(max) ? String(max) : undefined,
    payroll: payrollOnly ? "1" : undefined,
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[color:var(--color-foreground)]">
          Full catalogue
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[color:var(--color-muted)]">
          {q
            ? `Showing results for "${q}". Adjust the salary band or filters to refine.`
            : "Set your salary band to surface plans that fit your 30% deduction cap."}
        </p>
      </header>

      <div className="mb-4">
        <SalaryChipRow currentSalary={salaryGhs} basePath="/catalog" preserve={preserve} />
      </div>

      <div className="mb-6">
        <EligibilityBanner products={products} ctx={ctx} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:items-start">
        <CatalogSidebar
          actionPath="/catalog"
          min={Number.isFinite(min) ? min : undefined}
          max={Number.isFinite(max) ? max : undefined}
          q={q}
          salary={salaryGhs ?? undefined}
          payrollOnly={payrollOnly}
        />
        <ProductGrid
          products={products}
          emptyMessage="Try widening the salary band, lowering the monthly ceiling, or clearing your search."
          salaryCtx={ctx}
        />
      </div>
    </div>
  );
}
