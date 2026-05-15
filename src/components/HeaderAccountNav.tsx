"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { IconChevronDown, IconUser } from "@/components/marketplace/icons";
import { clearAccessToken, getAccessToken, subscribeAuthChanged } from "@/lib/auth-token";
import { getPayeasyJson, postPayeasyJsonAuth } from "@/lib/payeasy-api";

type MePayload = {
  user: {
    first_name?: string | null;
    last_name?: string | null;
    full_name?: string | null;
    email_verified_at?: string | null;
    phone_verified_at?: string | null;
  };
};

function displayFirstName(user: MePayload["user"]): string {
  const raw = user.first_name?.trim();
  if (raw) return raw;
  const full = user.full_name?.trim();
  if (full) return full.split(/\s+/)[0] ?? "there";
  return "there";
}

function isVerified(user: MePayload["user"]): boolean {
  return Boolean(user.email_verified_at || user.phone_verified_at);
}

type Props = {
  /** Slightly smaller icon (mobile header row next to cart) */
  compact?: boolean;
};

export function HeaderAccountNav({ compact = false }: Props) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [greeting, setGreeting] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const loadUser = useCallback(async () => {
    const t = getAccessToken();
    setToken(t);
    if (!t) {
      setGreeting(null);
      setVerified(false);
      return;
    }
    const res = await getPayeasyJson<MePayload>("/me", t);
    if (res.ok && res.status === 401) {
      clearAccessToken();
      setToken(null);
      setGreeting(null);
      setVerified(false);
      return;
    }
    if (!res.ok || !res.json.success || !res.json.data?.user) {
      setGreeting(null);
      setVerified(false);
      return;
    }
    const u = res.json.data.user;
    setGreeting(displayFirstName(u));
    setVerified(isVerified(u));
  }, []);

  useEffect(() => {
    void loadUser();
    return subscribeAuthChanged(() => {
      void loadUser();
    });
  }, [loadUser]);

  useEffect(() => {
    if (!menuOpen) return;
    function onDocMouseDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [menuOpen]);

  async function signOut() {
    const t = getAccessToken();
    if (!t) {
      clearAccessToken();
      setMenuOpen(false);
      router.refresh();
      return;
    }
    setSigningOut(true);
    await postPayeasyJsonAuth("/auth/logout", t, {});
    clearAccessToken();
    setSigningOut(false);
    setMenuOpen(false);
    setGreeting(null);
    setVerified(false);
    router.refresh();
  }

  const iconClass = compact ? "h-5 w-5 sm:h-6 sm:w-6" : "h-6 w-6";

  if (!token || !greeting) {
    return (
      <Link
        href="/sign-in"
        className="flex min-w-[44px] flex-col items-center gap-0.5 rounded-lg px-1 py-1 text-[color:var(--color-foreground)] transition hover:bg-[color:var(--color-muted-bg)] sm:min-w-0 sm:px-2 sm:py-1"
      >
        <span className="flex h-8 w-8 items-center justify-center sm:h-9 sm:w-9">
          <IconUser className={iconClass} />
        </span>
        <span className="hidden text-[10px] font-medium leading-none sm:block sm:text-[11px]">Sign in</span>
      </Link>
    );
  }

  return (
    <div ref={wrapRef} className="relative min-w-0">
      <button
        type="button"
        aria-expanded={menuOpen}
        aria-haspopup="true"
        onClick={() => setMenuOpen((o) => !o)}
        className="flex max-w-[11rem] min-w-0 items-center gap-1.5 rounded-lg px-1 py-1 text-left text-[color:var(--color-foreground)] transition hover:bg-[color:var(--color-muted-bg)] sm:max-w-none sm:gap-2 sm:px-2 sm:py-1.5"
      >
        <span className="relative flex h-8 w-8 shrink-0 items-center justify-center sm:h-9 sm:w-9">
          <IconUser className={iconClass} />
          {verified ? (
            <span
              className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[color:var(--color-success)] text-[8px] font-bold text-white ring-2 ring-white"
              aria-label="Verified"
              title="Verified"
            >
              ✓
            </span>
          ) : null}
        </span>
        <span className="min-w-0 flex flex-col items-start leading-tight">
          <span className="max-w-[5.5rem] truncate text-[11px] font-medium text-[color:var(--color-muted)] sm:max-w-[10rem]">
            Hi, {greeting}
          </span>
          <span className="mt-0.5 flex items-center gap-0.5">
            <span className="text-[10px] font-bold text-[color:var(--color-foreground)] sm:text-[11px]">Account</span>
            <IconChevronDown className="h-3 w-3 shrink-0 text-[color:var(--color-muted)]" />
          </span>
        </span>
      </button>

      {menuOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-1 w-52 rounded-xl border border-[color:var(--color-border)] bg-white py-1 shadow-lg"
        >
          <Link
            href="/account"
            role="menuitem"
            className="block px-4 py-2.5 text-sm font-medium text-[color:var(--color-foreground)] hover:bg-[color:var(--color-muted-bg)]"
            onClick={() => setMenuOpen(false)}
          >
            Account
          </Link>
          <Link
            href="/eligibility"
            role="menuitem"
            className="block px-4 py-2.5 text-sm font-medium text-[color:var(--color-foreground)] hover:bg-[color:var(--color-muted-bg)]"
            onClick={() => setMenuOpen(false)}
          >
            Check eligibility
          </Link>
          <Link
            href="/wishlist"
            role="menuitem"
            className="block px-4 py-2.5 text-sm font-medium text-[color:var(--color-foreground)] hover:bg-[color:var(--color-muted-bg)]"
            onClick={() => setMenuOpen(false)}
          >
            Wishlist
          </Link>
          <Link
            href="/orders"
            role="menuitem"
            className="block px-4 py-2.5 text-sm font-medium text-[color:var(--color-foreground)] hover:bg-[color:var(--color-muted-bg)]"
            onClick={() => setMenuOpen(false)}
          >
            Orders
          </Link>
          <button
            type="button"
            role="menuitem"
            disabled={signingOut}
            className="w-full px-4 py-2.5 text-left text-sm font-medium text-[color:var(--color-danger)] hover:bg-[color:var(--color-muted-bg)] disabled:opacity-50"
            onClick={() => void signOut()}
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
