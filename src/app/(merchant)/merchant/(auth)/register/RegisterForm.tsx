"use client";

import Link from "next/link";
import { OtpInput } from "@/components/auth/OtpInput";
import { PasswordField } from "@/components/auth/PasswordField";
import { PageHeader } from "@/components/PageHeader";
import { setAccessToken } from "@/lib/auth-token";
import {
  firstValidationError,
  PASSWORD_MIN_LENGTH,
  postPayeasyJson,
} from "@/lib/payeasy-api";
import { portalHref } from "@/lib/portal-path";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [attemptUuid, setAttemptUuid] = useState<string | null>(null);
  const [masked, setMasked] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otherName, setOtherName] = useState("");
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
      { attempt_uuid: string; contact_masked?: string }
    >("/auth/register/request-otp", {
      channel: "email",
      email: email.trim().toLowerCase(),
    });
    setBusy(false);

    if (!result.ok) {
      setError("Could not reach the server. Check NEXT_PUBLIC_API_BASE_URL and your network.");
      return;
    }

    const { json, status } = result;

    if (json.success && json.data?.attempt_uuid) {
      setAttemptUuid(json.data.attempt_uuid);
      setMasked(json.data.contact_masked ?? null);
      setMessage("We sent a verification code. Enter it below with your name and password.");
      return;
    }

    if (status === 403 && json.meta?.errorCode === "REGISTRATION_DISABLED") {
      setError("New account registration is turned off right now. Please try again later.");
      return;
    }

    if (status === 422 && json.errors?.contact?.[0]) {
      setError(`${json.errors.contact[0]} If you already registered, try signing in instead.`);
      return;
    }

    const validationMessage = firstValidationError(json);
    setError(validationMessage || json.message || "Could not send the code.");
  }

  async function completeRegistration(event: FormEvent) {
    event.preventDefault();
    if (!attemptUuid) {
      return;
    }
    setError(null);
    setMessage(null);

    if (code.trim().length !== 6) {
      setError("Enter the full 6-digit code.");
      return;
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      setError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters.`);
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);

    const result = await postPayeasyJson<
      {
        attempt_uuid: string;
        code: string;
        password: string;
        first_name: string;
        last_name: string;
        other_name?: string;
        device_name: string;
        intent: "merchant";
      },
      { token: string }
    >("/auth/register/complete", {
      attempt_uuid: attemptUuid,
      code: code.trim(),
      password,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      other_name: otherName.trim() || undefined,
      device_name: "merchant-portal",
      intent: "merchant",
    });
    setBusy(false);

    if (!result.ok) {
      setError("Could not reach the server.");
      return;
    }

    const { json } = result;

    if (json.success && json.data?.token) {
      setAccessToken(json.data.token);
      router.push(portalHref("merchant", "/dashboard"));
      return;
    }

    const validationMessage = firstValidationError(json);
    setError(validationMessage || json.message || "Registration could not be completed.");
  }

  return (
    <div className="w-full max-w-[440px]">
      <PageHeader
        align="center"
        eyebrow="For businesses"
        title="Register your business"
        subtitle="Use a business email you control. We will verify it, then you can complete your shop profile and start selling to PayEasy customers."
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
          onSubmit={completeRegistration}
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
              Change
            </button>
          </p>

          <OtpInput id="reg-code" label="6-digit code" value={code} onChange={setCode} disabled={busy} />
          <PasswordField
            id="password"
            label="Password"
            autoComplete="new-password"
            required
            minLength={PASSWORD_MIN_LENGTH}
            value={password}
            onChange={setPassword}
            hint={`At least ${PASSWORD_MIN_LENGTH} characters.`}
          />
          <PasswordField
            id="password-confirm"
            label="Confirm password"
            autoComplete="new-password"
            required
            minLength={PASSWORD_MIN_LENGTH}
            value={passwordConfirmation}
            onChange={setPasswordConfirmation}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="first-name"
                className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]"
              >
                First name
              </label>
              <input
                id="first-name"
                autoComplete="given-name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[color:var(--color-input-border)] bg-white px-4 py-3 text-[color:var(--color-foreground)] outline-none ring-[color:var(--color-focus)] focus:ring-2"
              />
            </div>
            <div>
              <label
                htmlFor="last-name"
                className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]"
              >
                Last name
              </label>
              <input
                id="last-name"
                autoComplete="family-name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[color:var(--color-input-border)] bg-white px-4 py-3 text-[color:var(--color-foreground)] outline-none ring-[color:var(--color-focus)] focus:ring-2"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="other-name"
              className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]"
            >
              Other names <span className="font-normal normal-case">(optional)</span>
            </label>
            <input
              id="other-name"
              value={otherName}
              onChange={(e) => setOtherName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[color:var(--color-input-border)] bg-white px-4 py-3 text-[color:var(--color-foreground)] outline-none ring-[color:var(--color-focus)] focus:ring-2"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-[color:var(--color-primary)] py-3 text-sm font-bold text-white transition hover:bg-[color:var(--color-primary-hover)] disabled:opacity-60"
          >
            {busy ? "Creating business account…" : "Create business account"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-[color:var(--color-muted)]">
        Already have an account?{" "}
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
