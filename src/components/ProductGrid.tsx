import type { Product } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
import type { SalaryContext } from "@/lib/eligibility";

type Props = {
  products: Product[];
  emptyMessage?: string;
  salaryCtx?: SalaryContext;
};

export function ProductGrid({ products, emptyMessage, salaryCtx }: Props) {
  if (!products.length) {
    return (
      <p className="rounded-xl border border-dashed border-[color:var(--color-border)] bg-white p-10 text-center text-[color:var(--color-muted)]">
        {emptyMessage ?? "No products match your filters."}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} salaryCtx={salaryCtx} />
      ))}
    </div>
  );
}
