"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { OtpInput } from "@/components/auth/OtpInput";
import { PasswordField } from "@/components/auth/PasswordField";
import {
  firstValidationError,
  PASSWORD_MIN_LENGTH,
  postPayeasyJson,
} from "@/lib/payeasy-api";

type Channel = "email" | "phone";

function inferChannel(value: string): Channel {
  return value.includes("@") ? "email" : "phone";
}

export function ForgotPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [channel, setChannel] = useState<Channel>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
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
    const p = searchParams.get("phone");
    const c = searchParams.get("contact");
    if (e) {
      setEmail(e);
      setChannel("email");
    } else if (p) {
      setPhone(p);
      setChannel("phone");
    } else if (c) {
      if (inferChannel(c) === "email") {
        setEmail(c);
        setChannel("email");
      } else {
        setPhone(c);
        setChannel("phone");
      }
    }
  }, [searchParams]);

  useEffect(() => {
    applyQuery();
  }, [applyQuery]);

  const contactSummary = useMemo(() => {
    if (channel === "email") return email.trim().toLowerCase();
    return phone.trim();
  }, [channel, email, phone]);

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setBusy(true);

    const body =
      channel === "email"
        ? { channel: "email" as const, email: email.trim().toLowerCase() }
        : { channel: "phone" as const, phone: phone.trim() };

    const result = await postPayeasyJson<
      typeof body,
      { attempt_uuid?: string | null; contact_masked?: string | null; status?: string }
    >("/auth/password-reset/request-otp", body);
    setBusy(false);

    if (!result.ok) {
      setError("Could not reach the server. Check NEXT_PUBLIC_PAYEASY_API_URL and your network.");
      return;
    }

    const { json, status } = result;

    if (status === 503 && json.meta?.errorCode === "PASSWORD_RESET_PHONE_UNAVAILABLE") {
      setError("Password reset by phone is not available in this environment. Use email instead.");
      setChannel("email");
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
        "If an account exists for that email or phone, we sent a verification code. Check your messages and spam folder.",
      );
      return;
    }

    const validationMessage = firstValidationError(json);
    setError(validationMessage || json.message || "Could not send the code.");
  }

  async function completeReset(e: React.FormEvent) {
    e.preventDefault();
    if (!attemptUuid) return;

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
      const q =
        channel === "email"
          ? `reset=1&email=${encodeURIComponent(email.trim().toLowerCase())}`
          : `reset=1&contact=${encodeURIComponent(phone.trim())}`;
      router.push(`/sign-in?${q}`);
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
    <div className="mx-auto max-w-[440px] px-4 py-10 sm:px-6">
      <header className="text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-muted)]">Account</p>
        <h1 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-bold text-[color:var(--color-foreground)]">
          Reset password
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-[color:var(--color-muted)]">
          Enter the email or mobile number you use with PayEasy. We will send a one-time code so you can choose a new
          password.
        </p>
      </header>

      {message ? (
        <div
          role="status"
          className={`mt-6 rounded-xl border px-4 py-3 text-sm ${
            attemptUuid
              ? "border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] text-[color:var(--color-foreground)]"
              : "border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] text-[color:var(--color-foreground)]"
          }`}
        >
          {message}
          {masked ? (
            <span className="mt-1 block text-[color:var(--color-muted)]">Sent to: {masked}</span>
          ) : null}
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

      {!attemptUuid ? (
        <form onSubmit={requestOtp} className="mt-8 space-y-5 rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 shadow-sm">
          <fieldset className="space-y-3">
            <legend className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
              Contact method
            </legend>
            <div className="flex gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-[color:var(--color-foreground)]">
                <input type="radio" name="fp-channel" checked={channel === "email"} onChange={() => setChannel("email")} />
                Email
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-[color:var(--color-foreground)]">
                <input type="radio" name="fp-channel" checked={channel === "phone"} onChange={() => setChannel("phone")} />
                Mobile number
              </label>
            </div>
          </fieldset>

          {channel === "email" ? (
            <div>
              <label htmlFor="fp-email" className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
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
          ) : (
            <div>
              <label htmlFor="fp-phone" className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
                Mobile number
              </label>
              <input
                id="fp-phone"
                type="tel"
                autoComplete="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[color:var(--color-input-border)] bg-white px-4 py-3 text-[color:var(--color-foreground)] outline-none ring-[color:var(--color-focus)] focus:ring-2"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-[color:var(--color-accent)] py-3 text-sm font-bold text-[color:var(--color-foreground)] transition hover:bg-[color:var(--color-accent-hover)] disabled:opacity-60"
          >
            {busy ? "Sending…" : "Send verification code"}
          </button>
        </form>
      ) : (
        <form onSubmit={completeReset} className="mt-8 space-y-5 rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 shadow-sm">
          <p className="text-sm text-[color:var(--color-muted)]">
            Verifying{" "}
            <span className="font-semibold text-[color:var(--color-foreground)]">{contactSummary || "your contact"}</span>.{" "}
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
              Start over
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
        <Link href="/sign-in" className="font-semibold text-[color:var(--color-primary)] underline-offset-2 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
