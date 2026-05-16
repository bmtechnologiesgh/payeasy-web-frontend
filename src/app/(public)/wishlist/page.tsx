import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Wishlist",
};

export default function WishlistPage() {
  return (
    <div className="mx-auto max-w-[860px] px-4 py-12 sm:px-6">
      <header className="text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-muted)]">Saved for later</p>
        <h1 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-bold text-[color:var(--color-foreground)] sm:text-4xl">
          Your wishlist
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-[color:var(--color-muted)]">
          Heart items while you browse; when you are ready, move them to checkout. This list will connect to your
          PayEasy account in a future release.
        </p>
      </header>

      <section className="mt-10 rounded-2xl border border-dashed border-[color:var(--color-border-strong)] bg-white p-8 text-center">
        <span aria-hidden className="text-3xl">
          ♡
        </span>
        <p className="mt-4 text-sm font-semibold text-[color:var(--color-foreground)]">Nothing saved yet</p>
        <p className="mt-1 text-sm text-[color:var(--color-muted)]">Browse the catalogue and tap the heart on products you like.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link
            href="/catalog"
            className="inline-flex items-center justify-center rounded-xl bg-[color:var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)]"
          >
            Browse the catalogue
          </Link>
        </div>
      </section>
    </div>
  );
}
