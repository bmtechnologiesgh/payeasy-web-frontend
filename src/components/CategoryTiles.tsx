import Image from "next/image";
import Link from "next/link";
import type { CategorySummary, Product } from "@/lib/catalog";
import { getPreviewProductForCategory } from "@/lib/catalog";
import { SectionHeading } from "@/components/SectionHeading";

type Props = {
  categories: CategorySummary[];
  products: Product[];
};

/** Surface categories as visual tiles (product image + label), matching storefront-style category strips. */
export function CategoryTiles({ categories, products }: Props) {
  const display = categories.slice(0, 12);

  return (
    <section id="categories" className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6">
      <SectionHeading
        title="Shop by category"
        actionHref="/catalog"
        actionLabel="See all categories"
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {display.map((c) => {
          const preview = getPreviewProductForCategory(products, c.name);
          return (
            <Link
              key={c.slug}
              href={`/catalog/${c.slug}`}
              className="flex flex-col overflow-hidden rounded-2xl border border-transparent bg-[color:var(--color-muted-bg)] transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="product-media relative aspect-square">
                {preview ? (
                  <Image
                    src={preview.image}
                    alt=""
                    fill
                    className="object-contain p-4"
                    sizes="(max-width:768px) 50vw, 16vw"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-[color:var(--color-muted)]">
                    {c.count} items
                  </div>
                )}
              </div>
              <span className="px-3 py-3 text-center text-sm font-semibold text-[color:var(--color-foreground)]">
                {c.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
