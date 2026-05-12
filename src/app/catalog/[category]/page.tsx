import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CatalogSidebar } from "@/components/CatalogSidebar";
import { EligibilityBanner } from "@/components/EligibilityBanner";
import { ProductGrid } from "@/components/ProductGrid";
import { SalaryChipRow } from "@/components/SalaryChipRow";
import {
  filterProducts,
  getCategories,
  getCategoryBySlug,
} from "@/lib/catalog";
import {
  applyEligibility,
  buildSalaryContext,
  readSalaryFromSearchParams,
  withSalaryParam,
} from "@/lib/eligibility";

type SearchParams = Record<string, string | string[] | undefined>;

function first(param: string | string[] | undefined): string | undefined {
  if (Array.isArray(param)) return param[0];
  return param;
}

export async function generateStaticParams() {
  return getCategories().map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) return { title: "Category" };
  return { title: cat.name };
}

export default async function CategoryCatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams?: Promise<SearchParams>;
}) {
  const { category: slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) notFound();

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
    categorySlug: slug,
    q,
    min: Number.isFinite(min) ? min : undefined,
    max: Number.isFinite(max) ? max : undefined,
  });
  const products = applyEligibility(filtered, ctx, { payrollOnly });

  const actionPath = `/catalog/${slug}`;
  const preserve: Record<string, string | undefined> = {
    q: q ?? undefined,
    min: Number.isFinite(min) ? String(min) : undefined,
    max: Number.isFinite(max) ? String(max) : undefined,
    payroll: payrollOnly ? "1" : undefined,
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
      <nav className="mb-4 text-sm text-[color:var(--color-muted)]">
        <Link href={withSalaryParam("/", salaryGhs)} className="hover:text-[color:var(--color-primary)]">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href={withSalaryParam("/catalog", salaryGhs)} className="hover:text-[color:var(--color-primary)]">
          Catalogue
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[color:var(--color-foreground)]">{cat.name}</span>
      </nav>

      <header className="mb-6">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[color:var(--color-foreground)]">
          {cat.name}
        </h1>
        <p className="mt-2 text-sm text-[color:var(--color-muted)]">
          {cat.count} products in this category. Each row shows the lowest monthly across 3–6 month plans —
          fee included.
        </p>
      </header>

      <div className="mb-4">
        <SalaryChipRow currentSalary={salaryGhs} basePath={actionPath} preserve={preserve} />
      </div>

      <div className="mb-6">
        <EligibilityBanner products={products} ctx={ctx} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:items-start">
        <CatalogSidebar
          actionPath={actionPath}
          min={Number.isFinite(min) ? min : undefined}
          max={Number.isFinite(max) ? max : undefined}
          q={q}
          salary={salaryGhs ?? undefined}
          payrollOnly={payrollOnly}
        />
        <ProductGrid
          products={products}
          emptyMessage="No plans fit this combination. Try widening your salary band or removing the payroll-only filter."
          salaryCtx={ctx}
        />
      </div>
    </div>
  );
}
