"use client";

import { PayEasyBusinessLogo } from "@/components/merchant/PayEasyBusinessLogo";
import { clearAccessToken } from "@/lib/auth-token";
import { portalHref } from "@/lib/portal-path";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  tradingName?: string | null;
  userName?: string | null;
  userEmail?: string | null;
};

function initials(name: string | null | undefined, email: string | null | undefined): string {
  const fromName = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (fromName.length >= 2) {
    return `${fromName[0][0]}${fromName[1][0]}`.toUpperCase();
  }
  if (fromName.length === 1) {
    return fromName[0].slice(0, 2).toUpperCase();
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return "ME";
}

export function MerchantHeader({ tradingName, userName, userEmail }: Props) {
  const router = useRouter();

  function signOut() {
    clearAccessToken();
    router.push(portalHref("merchant", "/login"));
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--color-border)] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-4">
          <PayEasyBusinessLogo size="sm" href={portalHref("merchant", "/dashboard")} />
          {tradingName ? (
            <div className="hidden min-w-0 border-l border-[color:var(--color-border)] pl-4 sm:block">
              <p className="truncate text-sm font-bold text-[color:var(--color-foreground)]">{tradingName}</p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--color-muted)]">
                Merchant portal
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href={portalHref("merchant", "/products/new")}
            className="hidden min-h-[40px] items-center justify-center rounded-full bg-[color:var(--color-primary)] px-4 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)] sm:inline-flex"
          >
            Add product
          </Link>
          <Link
            href={portalHref("merchant", "/profile")}
            className="hidden items-center gap-2 rounded-full border border-[color:var(--color-border-strong)] bg-white py-1.5 pr-3 pl-1.5 transition hover:bg-[color:var(--color-muted-bg)] md:flex"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-xs font-bold text-white">
              {initials(userName, userEmail)}
            </span>
            <span className="max-w-[120px] truncate text-xs font-semibold text-[color:var(--color-foreground)]">
              {userName?.split(" ")[0] ?? "Account"}
            </span>
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-[color:var(--color-border-strong)] bg-white px-4 text-sm font-semibold text-[color:var(--color-foreground)] transition hover:bg-[color:var(--color-muted-bg)]"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
