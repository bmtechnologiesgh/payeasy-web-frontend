import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Your account",
};

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-[640px] px-4 py-12 sm:px-6">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-muted)]">Account</p>
        <h1 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-bold text-[color:var(--color-foreground)]">
          Your PayEasy account
        </h1>
        <p className="mt-3 text-sm text-[color:var(--color-muted)]">
          Manage saved items, orders, and eligibility from here. More profile and security settings will ship with
          the full account API.
        </p>
      </header>

      <ul className="mt-10 divide-y divide-[color:var(--color-border)] rounded-2xl border border-[color:var(--color-border-strong)] bg-white shadow-sm">
        <li>
          <Link
            href="/wishlist"
            className="block px-5 py-4 text-sm font-semibold text-[color:var(--color-foreground)] transition hover:bg-[color:var(--color-muted-bg)]"
          >
            Wishlist
            <span className="mt-0.5 block text-xs font-normal text-[color:var(--color-muted)]">Saved products</span>
          </Link>
        </li>
        <li>
          <Link
            href="/orders"
            className="block px-5 py-4 text-sm font-semibold text-[color:var(--color-foreground)] transition hover:bg-[color:var(--color-muted-bg)]"
          >
            Orders
            <span className="mt-0.5 block text-xs font-normal text-[color:var(--color-muted)]">Track instalments and history</span>
          </Link>
        </li>
        <li>
          <Link
            href="/eligibility"
            className="block px-5 py-4 text-sm font-semibold text-[color:var(--color-foreground)] transition hover:bg-[color:var(--color-muted-bg)]"
          >
            Check eligibility
            <span className="mt-0.5 block text-xs font-normal text-[color:var(--color-muted)]">Estimate your PayEasy limit</span>
          </Link>
        </li>
      </ul>
    </div>
  );
}
