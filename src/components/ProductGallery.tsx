"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import { IconChevronLeft, IconChevronRight } from "@/components/marketplace/icons";
import { ProductImage } from "@/components/ProductImage";
import { hasProductImage } from "@/lib/product-image";

type Props = {
  images: string[];
  fallback: string;
  alt: string;
  category?: string;
  priority?: boolean;
};

const SWIPE_THRESHOLD_PX = 48;
const thumbTrackClass =
  "flex gap-2 overflow-x-auto overscroll-x-contain scroll-smooth pb-1 pt-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory touch-pan-x";
const thumbBtnClass =
  "product-media relative size-[4.25rem] shrink-0 snap-center overflow-hidden rounded-lg border-2 transition active:scale-95 sm:size-[4.5rem]";
const overlayNavClass =
  "absolute top-1/2 z-10 flex h-11 w-11 min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white shadow-lg backdrop-blur-sm transition active:scale-95";

function buildGalleryUrls(images: string[], fallback: string): string[] {
  const list = images.filter((url) => hasProductImage(url));
  if (list.length > 0) {
    return list;
  }
  if (hasProductImage(fallback)) {
    return [fallback];
  }
  return [];
}

function useSwipeNavigation(onPrev: () => void, onNext: () => void, enabled: boolean) {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const onTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled) return;
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    },
    [enabled],
  );

  const onTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!enabled || touchStartX.current == null || touchStartY.current == null) return;
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = e.changedTouches[0].clientY - touchStartY.current;
      touchStartX.current = null;
      touchStartY.current = null;
      if (Math.abs(dx) < SWIPE_THRESHOLD_PX || Math.abs(dx) < Math.abs(dy)) {
        return;
      }
      if (dx < 0) {
        onNext();
      } else {
        onPrev();
      }
    },
    [enabled, onNext, onPrev],
  );

  return { onTouchStart, onTouchEnd };
}

export function ProductGallery({ images, fallback, alt, category, priority }: Props) {
  const urls = useMemo(() => buildGalleryUrls(images, fallback), [images, fallback]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const safeIndex = urls.length > 0 ? Math.min(activeIndex, urls.length - 1) : 0;
  const activeUrl = urls[safeIndex] ?? "";
  const hasGallery = urls.length > 0;
  const multiple = urls.length > 1;

  const goPrev = useCallback(() => {
    if (urls.length === 0) return;
    setActiveIndex((i) => (i - 1 + urls.length) % urls.length);
  }, [urls.length]);

  const goNext = useCallback(() => {
    if (urls.length === 0) return;
    setActiveIndex((i) => (i + 1) % urls.length);
  }, [urls.length]);

  const openLightbox = useCallback(() => {
    if (!hasGallery) return;
    setLightboxOpen(true);
  }, [hasGallery]);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const swipe = useSwipeNavigation(goPrev, goNext, multiple);

  useEffect(() => {
    const el = thumbRefs.current[safeIndex];
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [safeIndex]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowLeft") {
        goPrev();
      } else if (e.key === "ArrowRight") {
        goNext();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxOpen, closeLightbox, goPrev, goNext]);

  if (!hasGallery) {
    return (
      <div className="product-media relative aspect-square w-full max-w-[480px] sm:mx-auto">
        <ProductImage src="" alt={alt} category={category} priority={priority} className="object-contain p-4 sm:p-6" />
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-[480px] sm:mx-auto">
        <div
          className="relative touch-pan-y"
          onTouchStart={swipe.onTouchStart}
          onTouchEnd={swipe.onTouchEnd}
        >
          <button
            type="button"
            onClick={openLightbox}
            className="product-media group relative block aspect-square w-full cursor-zoom-in rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-2"
            aria-label={`View full size image ${safeIndex + 1} of ${urls.length}`}
          >
            <ProductImage
              src={activeUrl}
              alt={alt}
              category={category}
              priority={priority}
              className="object-contain p-3 transition group-active:opacity-95 sm:p-6"
              sizes="(max-width: 640px) 100vw, 480px"
            />
          </button>

          {multiple ? (
            <>
              <span
                className="pointer-events-none absolute right-2 top-2 z-[1] rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm"
                aria-hidden
              >
                {safeIndex + 1} / {urls.length}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                className={`${overlayNavClass} left-1.5 sm:left-2`}
                aria-label="Previous image"
              >
                <IconChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                className={`${overlayNavClass} right-1.5 sm:right-2`}
                aria-label="Next image"
              >
                <IconChevronRight className="h-5 w-5" />
              </button>
            </>
          ) : null}
        </div>

        <p className="mt-2 text-center">
          <button
            type="button"
            onClick={openLightbox}
            className="min-h-[44px] px-2 text-xs font-medium text-[color:var(--color-primary)] underline underline-offset-2 active:text-[color:var(--color-primary-hover)] sm:min-h-0"
          >
            <span className="sm:hidden">Tap to enlarge</span>
            <span className="hidden sm:inline">Click to see full view</span>
          </button>
        </p>

        {multiple ? (
          <>
            <div className={thumbTrackClass} role="tablist" aria-label="Product images">
              {urls.map((url, i) => (
                <button
                  key={`${url}-${i}`}
                  ref={(el) => {
                    thumbRefs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  aria-selected={i === safeIndex}
                  aria-label={`Show image ${i + 1} of ${urls.length}`}
                  onClick={() => setActiveIndex(i)}
                  className={`${thumbBtnClass} ${
                    i === safeIndex
                      ? "border-[color:var(--color-primary)] ring-2 ring-[color:var(--color-primary)]/25"
                      : "border-[color:var(--color-border)] opacity-90"
                  }`}
                >
                  <Image src={url} alt="" fill className="object-contain p-1" sizes="68px" unoptimized />
                </button>
              ))}
            </div>

            <div className="mt-2 flex justify-center gap-1.5 sm:hidden" aria-hidden>
              {urls.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === safeIndex ? "w-5 bg-[color:var(--color-primary)]" : "w-1.5 bg-[color:var(--color-border-strong)]"
                  }`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      {lightboxOpen ? (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${alt} — image viewer`}
          onClick={closeLightbox}
        >
          <div
            className="flex shrink-0 items-center justify-between gap-3 px-3 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-4"
            onClick={(e) => e.stopPropagation()}
          >
            {multiple ? (
              <p className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
                {safeIndex + 1} / {urls.length}
              </p>
            ) : (
              <span />
            )}
            <button
              ref={closeRef}
              type="button"
              onClick={closeLightbox}
              className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/15 text-2xl leading-none text-white transition active:bg-white/25"
              aria-label="Close image viewer"
            >
              ×
            </button>
          </div>

          <div
            className="relative flex min-h-0 flex-1 items-center justify-center px-1 sm:px-4"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={swipe.onTouchStart}
            onTouchEnd={swipe.onTouchEnd}
          >
            {multiple ? (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  className={`${overlayNavClass} left-2 sm:left-4`}
                  aria-label="Previous image"
                >
                  <IconChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className={`${overlayNavClass} right-2 sm:right-4`}
                  aria-label="Next image"
                >
                  <IconChevronRight className="h-6 w-6" />
                </button>
              </>
            ) : null}

            <div className="relative mx-auto aspect-square w-full max-h-[min(72dvh,720px)] max-w-[min(calc(100vw-4.5rem),720px)]">
              <Image
                src={activeUrl}
                alt={alt}
                fill
                className="object-contain"
                sizes="100vw"
                priority
                unoptimized
              />
            </div>
          </div>

          {multiple ? (
            <div
              className={`shrink-0 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:px-4 ${thumbTrackClass}`}
              onClick={(e) => e.stopPropagation()}
            >
              {urls.map((url, i) => (
                <button
                  key={`lb-${url}-${i}`}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={`${thumbBtnClass} ${
                    i === safeIndex ? "border-white ring-2 ring-white/40" : "border-white/35 opacity-75"
                  }`}
                  aria-label={`Go to image ${i + 1}`}
                  aria-current={i === safeIndex}
                >
                  <Image src={url} alt="" fill className="object-contain p-0.5" sizes="68px" unoptimized />
                </button>
              ))}
            </div>
          ) : (
            <div className="h-[max(0.75rem,env(safe-area-inset-bottom))] shrink-0" aria-hidden />
          )}
        </div>
      ) : null}
    </>
  );
}
