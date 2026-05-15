"use client";

import Link from "next/link";
import { useEmployeeSession } from "@/lib/employee-session";

export function SiteTopBarAuthLinks() {
  const { signedIn } = useEmployeeSession();

  return (
    <div className="flex shrink-0 items-center gap-x-3 text-[11px] font-medium text-[color:var(--color-foreground)] sm:gap-x-4 sm:text-[13px]">
      {signedIn ? null : (
        <>
          <Link href="/sign-in" className="hover:underline">
            Sign in
          </Link>
          <Link href="/sign-up" className="hover:underline">
            Create account
          </Link>
        </>
      )}
      <span
        className={
          signedIn
            ? "inline-flex items-center gap-1"
            : "inline-flex items-center gap-1 border-l border-[color:var(--color-border)] pl-3 sm:pl-4"
        }
      >
        <span aria-hidden>🇬🇭</span>
        <span className="hidden sm:inline">EN / GHS</span>
        <span className="sm:hidden">EN</span>
      </span>
    </div>
  );
}
