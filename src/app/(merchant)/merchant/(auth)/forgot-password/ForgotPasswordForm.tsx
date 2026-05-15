"use client";

import Link from "next/link";
import { OtpInput } from "@/components/auth/OtpInput";
import { PasswordField } from "@/components/auth/PasswordField";
import { PageHeader } from "@/components/PageHeader";
import {
  firstValidationError,
  PASSWORD_MIN_LENGTH,
  postPayeasyJson,
} from "@/lib/payeasy-api";
import { portalHref } from "@/lib/portal-path";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";

export function ForgotPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [attemptUuid, setAttemptUuid] = useState<string | null>(null);
  const [masked, setMasked] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const applyQuery = useCallback(() => {
    const e = searchParams.get("email");
    if (e) {
      setEmail(e);
    }
  }, [searchParams]);

  useEffect(() => {
    applyQuery();
  }, [applyQuery]);

  async function requestOtp(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setBusy(true);

    const result = await postPayeasyJson<
      { channel: "email"; email: string },
      { attempt_uuid?: string | null; contact_masked?: string | null; status?: string }
    >("/auth/password-reset/request-otp", {
      channel: "email",
      email: email.trim().toLowerCase(),
    });
    setBusy(false);

    if (!result.ok) {
      setError("Could not reach the server. Check NEXT_PUBLIC_API_BASE_URL and your network.");
      return;
    }

    const { json, status } = result;

    if (status === 503 && json.meta?.errorCode === "PASSWORD_RESET_PHONE_UNAVAILABLE") {
      setError(json.message || "This reset path is not available.");
      return;
    }

    if (json.success && json.data?.attempt_uuid) {
      setAttemptUuid(json.data.attempt_uuid);
      setMasked(json.data.contact_masked ?? null);
      setMessage("We sent a verification code. Enter it below with your new password.");
      return;
    }

    if (json.success && json.data?.status === "otp_sent_if_matched") {
      setAttemptUuid(null);
      setMasked(null);
      setMessage(
        "If an account exists for that email, we sent a verification code. Check your inbox and spam folder.",
      );
      return;
    }

    const validationMessage = firstValidationError(json);
    setError(validationMessage || json.message || "Could not send the code.");
  }

  async function completeReset(event: FormEvent) {
    event.preventDefault();
    if (!attemptUuid) {
      return;
    }
    setError(null);
    setMessage(null);

    if (password.length < PASSWORD_MIN_LENGTH) {
      setError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters.`);
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Passwords do not match.");
      return;
    }

    if (code.trim().length !== 6) {
      setError("Enter the full 6-digit code.");
      return;
    }

    setBusy(true);

    const result = await postPayeasyJson<
      {
        attempt_uuid: string;
        code: string;
        password: string;
        password_confirmation: string;
      },
      Record<string, unknown>
    >("/auth/password-reset/complete", {
      attempt_uuid: attemptUuid,
      code: code.trim(),
      password,
      password_confirmation: passwordConfirmation,
    });
    setBusy(false);

    if (!result.ok) {
      setError("Could not reach the server.");
      return;
    }

    const { json, status } = result;

    if (json.success) {
      router.push(
        portalHref("merchant", `/login?reset=1&email=${encodeURIComponent(email.trim().toLowerCase())}`),
      );
      return;
    }

    if (status === 422 && json.meta?.errorCode === "PASSWORD_RESET_OTP_EXPIRED") {
      setError("This code expired. Request a new one.");
      return;
    }

    if (status === 422 && json.meta?.errorCode === "PASSWORD_RESET_OTP_LOCKED") {
      setError("Too many incorrect attempts. Request a new code.");
      return;
    }

    const validationMessage = firstValidationError(json);
    setError(validationMessage || json.message || "Could not reset your password.");
  }

  return (
    <div className="w-full max-w-[440px]">
      <PageHeader
        align="center"
        eyebrow="For businesses"
        title="Reset password"
        subtitle="Enter your business email and we will send a one-time code so you can choose a new password."
      />

      {message ? (
        <p
          role="status"
          className="mt-6 rounded-xl border border-[color:var(--color-border-strong)] bg-white px-4 py-3 text-sm text-[color:var(--color-foreground)]"
        >
          {message}
          {masked ? (
            <span className="mt-1 block text-[color:var(--color-muted)]">Sent to: {masked}</span>
          ) : null}
        </p>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-[color:var(--color-danger)]/25 bg-[color:var(--color-danger-bg)] px-4 py-3 text-sm text-[color:var(--color-danger)]"
        >
          {error}
        </div>
      ) : null}

      {!attemptUuid ? (
        <form
          onSubmit={requestOtp}
          className="mt-8 space-y-5 rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 shadow-sm"
        >
          <div>
            <label
              htmlFor="fp-email"
              className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]"
            >
              Email
            </label>
            <input
              id="fp-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[color:var(--color-input-border)] bg-white px-4 py-3 text-[color:var(--color-foreground)] outline-none ring-[color:var(--color-focus)] focus:ring-2"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-[color:var(--color-accent)] py-3 text-sm font-bold text-[color:var(--color-foreground)] transition hover:bg-[color:var(--color-accent-hover)] disabled:opacity-60"
          >
            {busy ? "Sending…" : "Send verification code"}
          </button>
        </form>
      ) : (
        <form
          onSubmit={completeReset}
          className="mt-8 space-y-5 rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 shadow-sm"
        >
          <p className="text-sm text-[color:var(--color-muted)]">
            Verifying{" "}
            <span className="font-semibold text-[color:var(--color-foreground)]">
              {email.trim() || "your email"}
            </span>
            .{" "}
            <button
              type="button"
              className="font-semibold text-[color:var(--color-primary)] underline-offset-2 hover:underline"
              onClick={() => {
                setAttemptUuid(null);
                setMasked(null);
                setCode("");
                setPassword("");
                setPasswordConfirmation("");
                setMessage(null);
                setError(null);
              }}
            >
              Change email
            </button>
          </p>

          <OtpInput id="fp-code" label="6-digit code" value={code} onChange={setCode} disabled={busy} />
          <PasswordField
            id="fp-password"
            label="New password"
            autoComplete="new-password"
            required
            minLength={PASSWORD_MIN_LENGTH}
            value={password}
            onChange={setPassword}
          />
          <PasswordField
            id="fp-password2"
            label="Confirm new password"
            autoComplete="new-password"
            required
            minLength={PASSWORD_MIN_LENGTH}
            value={passwordConfirmation}
            onChange={setPasswordConfirmation}
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-[color:var(--color-primary)] py-3 text-sm font-bold text-white transition hover:bg-[color:var(--color-primary-hover)] disabled:opacity-60"
          >
            {busy ? "Updating password…" : "Update password"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-[color:var(--color-muted)]">
        Remember your password?{" "}
        <Link
          href={portalHref("merchant", "/login")}
          className="font-semibold text-[color:var(--color-primary)] underline-offset-2 hover:underline"
        >
          Sign in to your business account
        </Link>
      </p>
    </div>
  );
}
