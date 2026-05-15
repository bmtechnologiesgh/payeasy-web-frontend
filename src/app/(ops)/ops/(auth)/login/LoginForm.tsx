"use client";

import { PasswordField } from "@/components/auth/PasswordField";
import { PageHeader } from "@/components/PageHeader";
import { setAccessToken } from "@/lib/auth-token";
import { login } from "@/lib/ops-api";
import { portalHref } from "@/lib/portal-path";
import { userMayAccessOpsPortal } from "@/lib/portal-access";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const applyQuery = useCallback(() => {
    const e = searchParams.get("email");
    if (e) {
      setEmail(e);
    }
    if (searchParams.get("reset") === "1") {
      setNotice("Your password was updated. Sign in with your new password.");
    }
  }, [searchParams]);

  useEffect(() => {
    applyQuery();
  }, [applyQuery]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await login({
        email,
        password,
        device_name: "ops-portal",
      });
      if (!userMayAccessOpsPortal(result.user.roles)) {
        setError(
          "This portal is only for PayEasy operations staff. Use the merchant or employer sign-in page instead.",
        );
        return;
      }
      setAccessToken(result.token);
      router.push(portalHref("ops", "/dashboard"));
    } catch {
      setError("We could not sign you in. Check your email and password, then try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[440px]">
      <PageHeader
        align="center"
        eyebrow="Internal"
        title="Sign in to operations"
        subtitle="Use the account issued by PayEasy engineering or administration. Self-registration is not available."
      />

      {notice ? (
        <div
          role="status"
          className="mt-6 rounded-xl border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] px-4 py-3 text-sm text-[color:var(--color-foreground)]"
        >
          {notice}
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-[color:var(--color-danger)]/25 bg-[color:var(--color-danger-bg)] px-4 py-3 text-sm text-[color:var(--color-danger)]"
        >
          {error}
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5 rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 shadow-sm"
      >
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[color:var(--color-input-border)] bg-white px-4 py-3 text-[color:var(--color-foreground)] outline-none ring-[color:var(--color-focus)] focus:ring-2"
          />
        </div>
        <div>
          <div className="flex items-center justify-between gap-3">
            <span className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
              Password
            </span>
            <Link
              href={
                email.trim()
                  ? portalHref("ops", `/forgot-password?email=${encodeURIComponent(email.trim())}`)
                  : portalHref("ops", "/forgot-password")
              }
              className="text-xs font-semibold text-[color:var(--color-primary)] underline-offset-2 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordField
            id="password"
            aria-label="Password"
            autoComplete="current-password"
            value={password}
            onChange={setPassword}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[color:var(--color-accent)] py-3 text-sm font-bold text-[color:var(--color-foreground)] transition hover:bg-[color:var(--color-accent-hover)] disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
