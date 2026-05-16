"use client";

import { PayEasyLogo } from "@/components/PayEasyLogo";
import { clearAccessToken } from "@/lib/auth-token";
import type { PortalId } from "@/lib/portal-path";
import { portalHref } from "@/lib/portal-path";
import { useRouter } from "next/navigation";

type Props = {
  portal: PortalId;
  contextLabel?: string | null;
};

export function PortalHeader({ portal, contextLabel }: Props) {
  const router = useRouter();

  function signOut() {
    clearAccessToken();
    router.push(portalHref(portal, "/login"));
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--color-border)] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <PayEasyLogo size="sm" href="/" />
        <div className="flex min-w-0 items-center gap-3">
          {contextLabel ? (
            <p className="hidden truncate text-sm font-semibold text-[color:var(--color-foreground)] sm:block">
              {contextLabel}
            </p>
          ) : null}
          <button
            type="button"
            onClick={signOut}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[color:var(--color-border-strong)] bg-white px-4 text-sm font-semibold text-[color:var(--color-foreground)] transition hover:bg-[color:var(--color-muted-bg)]"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
