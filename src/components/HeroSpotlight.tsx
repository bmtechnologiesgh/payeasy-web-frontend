"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export type HeroSlide = {
  productId: string;
  brand: string;
  title: string;
  subtitle: string;
  /**
   * Catalogue cut-out (i.e. `Product.image`). Used as a graceful fallback
   * when `heroImage` is missing or 404s. Always points at a real on-disk asset.
   */
  image: string;
  /**
   * Curated lifestyle/marketing shot for the hero only. Independent of
   * `Product.image` so the storefront hero can show a styled scene while the
   * PDP keeps the plain catalogue cut-out.
   */
  heroImage?: string;
  /**
   * "cover" → edge-to-edge lifestyle photo (default when `heroImage` is set).
   * "contain" → fits the cut-out with padding (default when falling back to `image`).
   */
  imageFit?: "cover" | "contain";
  badge?: string;
};

type Props = {
  slides: HeroSlide[];
};

export function HeroSpotlight({ slides }: Props) {
  const [index, setIndex] = useState(0);
  // Per-slide flag flipped when a curated `heroImage` 404s — we then fall back
  // to the product cut-out so the hero never renders broken.
  const [heroFailed, setHeroFailed] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 7000);
    return () => window.clearInterval(t);
  }, [slides.length]);

  const slide = slides[index] ?? slides[0];
  if (!slide) return null;

  const useHero = !!slide.heroImage && !heroFailed[index];
  const src = useHero ? (slide.heroImage as string) : slide.image;
  // Cut-out fallbacks always render `contain` — cover-cropping a transparent
  // catalogue shot looks broken. `imageFit` only applies to the curated hero.
  const fit: "cover" | "contain" = useHero ? slide.imageFit ?? "cover" : "contain";
  const isCover = fit === "cover";

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-white shadow-inner md:min-h-[380px] md:flex-row md:items-stretch">
      {/* Image first on mobile (order-1), right column on desktop (order-2) */}
      <div
        className={`relative order-1 w-full md:order-2 md:flex md:w-[55%] md:min-h-[340px] md:flex-col md:justify-center ${
          isCover ? "bg-[color:var(--color-muted-bg)]" : "md:bg-white md:p-6"
        }`}
      >
        {slide.badge ? (
          <span className="absolute right-4 top-4 z-[2] max-w-[11rem] rounded-md bg-[color:var(--color-primary)] px-2.5 py-1.5 text-[9px] font-bold uppercase leading-tight tracking-wide text-white md:right-6 md:top-6 md:max-w-none md:px-3 md:text-[10px]">
            {slide.badge}
          </span>
        ) : null}
        <div
          className={`relative aspect-[4/3] w-full md:aspect-auto md:min-h-[320px] md:flex-1 ${
            isCover ? "" : "bg-white"
          }`}
        >
          <Image
            key={src}
            src={src}
            alt={slide.title}
            fill
            className={
              isCover
                ? "object-cover object-center"
                : "object-contain object-center p-4 md:object-bottom"
            }
            sizes="(max-width:768px) 100vw, 560px"
            priority
            unoptimized
            onError={() => {
              if (useHero) setHeroFailed((prev) => ({ ...prev, [index]: true }));
            }}
          />
        </div>
      </div>

      {/* Copy block — below image on mobile with tinted panel; left column on desktop */}
      <div className="relative z-[1] order-2 flex flex-col justify-center bg-[color:var(--color-muted-bg)] px-5 pb-8 pt-6 md:order-1 md:w-[45%] md:bg-white md:px-10 md:pb-10 md:pt-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
          {slide.brand}
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-extrabold leading-tight tracking-tight text-[color:var(--color-foreground)] sm:text-3xl md:text-4xl">
          {slide.title}
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-[color:var(--color-muted)] md:text-base">
          {slide.subtitle}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href={`/product/${slide.productId}`}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-[color:var(--color-primary)] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)]"
          >
            See plans
          </Link>
          <Link
            href={`/product/${slide.productId}`}
            className="min-h-[44px] text-sm font-medium text-[color:var(--color-foreground)] underline underline-offset-4"
          >
            Compare totals
          </Link>
        </div>
        {slides.length > 1 ? (
          <div className="mt-8 flex justify-center gap-2 md:justify-start">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className={`h-2.5 w-2.5 rounded-full transition ${i === index ? "bg-[color:var(--color-primary)]" : "bg-[color:var(--color-border-strong)]"}`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
