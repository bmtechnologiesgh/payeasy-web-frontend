import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { formatGhs } from "@/lib/format";

type Props = {
  deals: Product[];
};

export function DealsStrip({ deals }: Props) {
  if (!deals.length) return null;

  return (
    <section className="border-y border-[color:var(--color-border)] bg-[color:var(--color-primary)] text-white">
      <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/60">
              Limited-time spotlight
            </p>
            <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold">
              Deals of the week
            </h2>
          </div>
          <Link
            href="/catalog"
            className="rounded-lg bg-[color:var(--color-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[color:var(--color-accent-hover)]"
          >
            Browse catalogue
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-pan-x">
          {deals.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.id}`}
              className="flex min-w-[220px] max-w-[240px] shrink-0 gap-3 rounded-xl bg-white/10 p-3 backdrop-blur transition hover:bg-white/15"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-white/90">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  className="object-contain p-1"
                  unoptimized
                />
              </div>
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-semibold leading-snug">
                  {p.name}
                </p>
                <p className="mt-1 text-xs text-white/70">From</p>
                <p className="text-base font-semibold text-[color:var(--color-accent)]">
                  {formatGhs(p.fromPriceGhs ?? undefined)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
