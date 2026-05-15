"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { setAccessToken } from "@/lib/auth-token";
import { postPayeasyJson } from "@/lib/payeasy-api";

function looksLikeEmail(s: string): boolean {
  return s.includes("@");
}

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [showCreatePath, setShowCreatePath] = useState(false);

  useEffect(() => {
    const q = searchParams.get("contact") ?? searchParams.get("email") ?? searchParams.get("phone") ?? "";
    if (q) setContact(q);
    if (searchParams.get("registered") === "1") {
      setBanner("Your account is ready. Sign in with the password you chose.");
    }
  }, [searchParams]);

  const signUpHref = useCallback(() => {
    const trimmed = contact.trim();
    if (!trimmed) return "/sign-up";
    if (looksLikeEmail(trimmed)) {
      return `/sign-up?email=${encodeURIComponent(trimmed)}`;
    }
    return `/sign-up?phone=${encodeURIComponent(trimmed)}`;
  }, [contact]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBanner(null);
    setShowCreatePath(false);
    const trimmed = contact.trim();
    if (!trimmed || !password) return;

    setBusy(true);
    const body = looksLikeEmail(trimmed)
      ? { email: trimmed.toLowerCase(), password, device_name: typeof navigator !== "undefined" ? navigator.userAgent : "web" }
      : { identifier: trimmed, password, device_name: typeof navigator !== "undefined" ? navigator.userAgent : "web" };

    const result = await postPayeasyJson<typeof body, { token: string }>("/auth/login", body);
    setBusy(false);

    if (!result.ok) {
      setBanner("We could not reach the sign-in service. Check your connection or API URL.");
      return;
    }

    const { json, status } = result;

    if (json.success && json.data?.token) {
      setAccessToken(json.data.token);
      router.push("/");
      router.refresh();
      return;
    }

    if (status === 403 && json.meta?.errorCode === "ACCOUNT_INACTIVE") {
      setBanner(json.message || "This account is not allowed to sign in.");
      return;
    }

    if (status === 422) {
      setShowCreatePath(true);
      setBanner(
        "That email or phone and password do not match an active account. Double-check your password, or create an account if you are new to PayEasy.",
      );
      return;
    }

    setBanner(json.message || "Sign-in failed. Please try again.");
  }

  return (
    <div className="mx-auto max-w-[440px] px-4 py-10 sm:px-6">
      <header className="text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-muted)]">Account</p>
        <h1 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-bold text-[color:var(--color-foreground)]">
          Sign in
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-[color:var(--color-muted)]">
          Use the personal email or phone number you registered with, and your password.
        </p>
      </header>

      {banner ? (
        <div
          role="status"
          className={`mt-6 rounded-xl border px-4 py-3 text-sm ${
            showCreatePath
              ? "border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] text-[color:var(--color-foreground)]"
              : "border-[color:var(--color-danger)]/25 bg-[color:var(--color-danger-bg)] text-[color:var(--color-danger)]"
          }`}
        >
          {banner}
        </div>
      ) : null}

      {showCreatePath ? (
        <div className="mt-4 rounded-xl border border-[color:var(--color-border-strong)] bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-[color:var(--color-foreground)]">New to PayEasy?</p>
          <p className="mt-1 text-sm text-[color:var(--color-muted)]">
            Continue with the same email or phone to verify it and set your password.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Link
              href={signUpHref()}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-[color:var(--color-primary)] px-5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)]"
            >
              Create account
            </Link>
            <button
              type="button"
              className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full border border-[color:var(--color-border-strong)] bg-white px-5 text-sm font-semibold text-[color:var(--color-foreground)] transition hover:bg-[color:var(--color-muted-bg)]"
              onClick={() => {
                setShowCreatePath(false);
                setBanner(null);
                setPassword("");
                setContact("");
              }}
            >
              Use a different email or phone
            </button>
          </div>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="mt-8 space-y-5 rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 shadow-sm">
        <div>
          <label htmlFor="signin-contact" className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
            Email or mobile number
          </label>
          <input
            id="signin-contact"
            name="contact"
            type="text"
            autoComplete="username"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[color:var(--color-input-border)] bg-white px-4 py-3 text-[color:var(--color-foreground)] outline-none ring-[color:var(--color-focus)] focus:ring-2"
            required
          />
        </div>
        <div>
          <label htmlFor="signin-password" className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
            Password
          </label>
          <input
            id="signin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[color:var(--color-input-border)] bg-white px-4 py-3 text-[color:var(--color-foreground)] outline-none ring-[color:var(--color-focus)] focus:ring-2"
            required
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-[color:var(--color-accent)] py-3 text-sm font-bold text-[color:var(--color-foreground)] transition hover:bg-[color:var(--color-accent-hover)] disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[color:var(--color-muted)]">
        New customer?{" "}
        <Link href="/sign-up" className="font-semibold text-[color:var(--color-primary)] underline-offset-2 hover:underline">
          Create your PayEasy account
        </Link>
      </p>
      <p className="mt-4 text-center text-sm">
        <Link href="/eligibility" className="text-[color:var(--color-muted)] underline-offset-2 hover:text-[color:var(--color-foreground)] hover:underline">
          Check eligibility instead
        </Link>
      </p>
    </div>
  );
}
