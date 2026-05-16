import type { Product } from "@/lib/catalog";
import { HorizontalCarousel } from "@/components/HorizontalCarousel";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";
import type { SalaryContext } from "@/lib/eligibility";

type Props = {
  products: Product[];
  salaryCtx?: SalaryContext;
};

export function HomeFeaturedProducts({ products, salaryCtx }: Props) {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6">
      <SectionHeading
        title="Eligible across most salary bands"
        actionHref="/catalog"
        actionLabel="Browse catalogue"
      />
      <div className="rounded-2xl border border-[color:var(--color-border)] bg-white p-4 shadow-sm">
        <HorizontalCarousel ariaLabel="Featured products carousel">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} variant="carousel" salaryCtx={salaryCtx} />
          ))}
        </HorizontalCarousel>
      </div>
    </section>
  );
}
