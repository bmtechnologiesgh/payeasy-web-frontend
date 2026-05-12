import Link from "next/link";
import { SectionHeading } from "@/components/SectionHeading";

const brands = [
  ["Dyson", "Lenovo", "Cisco", "Samsung", "LG", "Bose"],
  ["Apple", "Google", "Nvidia", "Electrolux", "Sony", "Intel"],
] as const;

export function TrendingBrands() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6">
      <SectionHeading
        title="Brands available on Pay-Small-Small"
        actionHref="/catalog"
        actionLabel="See full catalogue"
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {brands.flat().map((name) => (
          <Link
            key={name}
            href="/catalog"
            className="flex min-h-[72px] items-center justify-center rounded-xl border border-[color:var(--color-border)] bg-white px-6 py-5 text-center font-[family-name:var(--font-heading)] text-lg font-bold text-[color:var(--color-foreground)] shadow-sm transition hover:bg-[color:var(--color-muted-bg)]"
          >
            {name}
          </Link>
        ))}
      </div>
    </section>
  );
}
