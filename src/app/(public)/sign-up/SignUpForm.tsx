"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { OtpInput } from "@/components/auth/OtpInput";
import { PasswordField } from "@/components/auth/PasswordField";
import { setAccessToken } from "@/lib/auth-token";
import { PASSWORD_MIN_LENGTH, postPayeasyJson } from "@/lib/payeasy-api";

type Channel = "email" | "phone";

function inferChannel(value: string): Channel {
  return value.includes("@") ? "email" : "phone";
}

export function SignUpForm() {
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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otherName, setOtherName] = useState("");
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
    if (channel === "email") return email.trim();
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
      { attempt_uuid: string; contact_masked?: string; expires_in_seconds?: number }
    >("/auth/register/request-otp", body);
    setBusy(false);

    if (!result.ok) {
      setError("Could not reach the server. Check NEXT_PUBLIC_PAYEASY_API_URL and your network.");
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
      setError("New account registration is turned off right now. Please try again later or contact support.");
      return;
    }

    if (status === 503 && json.meta?.errorCode === "REGISTRATION_PHONE_UNAVAILABLE") {
      setError("Phone sign-up is not available in this environment. Use email instead.");
      setChannel("email");
      return;
    }

    if (status === 422 && json.errors?.contact?.[0]) {
      setError(`${json.errors.contact[0]} If you already registered, try signing in instead.`);
      return;
    }

    setError(json.message || "Could not send the code.");
  }

  async function completeRegistration(e: React.FormEvent) {
    e.preventDefault();
    if (!attemptUuid) return;
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

    const body = {
      attempt_uuid: attemptUuid,
      code: code.trim(),
      password,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      other_name: otherName.trim() || undefined,
      device_name: typeof navigator !== "undefined" ? navigator.userAgent : "web",
    };

    const result = await postPayeasyJson<typeof body, { token: string }>("/auth/register/complete", body);
    setBusy(false);

    if (!result.ok) {
      setError("Could not reach the server.");
      return;
    }

    const { json, status } = result;

    if (json.success && json.data?.token) {
      setAccessToken(json.data.token);
      router.push("/");
      router.refresh();
      return;
    }

    if (status === 422 && json.errors?.code?.[0]) {
      setError(json.errors.code[0]);
      return;
    }

    setError(json.message || "Registration could not be completed.");
  }

  return (
    <div className="mx-auto max-w-[440px] px-4 py-10 sm:px-6">
      <header className="text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-muted)]">Account</p>
        <h1 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-bold text-[color:var(--color-foreground)]">
          Create account
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-[color:var(--color-muted)]">
          Use a personal email or phone you control. We will send a one-time code to verify it.
        </p>
      </header>

      {message ? (
        <p role="status" className="mt-6 rounded-xl border border-[color:var(--color-border-strong)] bg-white px-4 py-3 text-sm text-[color:var(--color-foreground)]">
          {message}
          {masked ? (
            <span className="mt-1 block text-[color:var(--color-muted)]">Sent to: {masked}</span>
          ) : null}
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="mt-4 rounded-xl border border-[color:var(--color-danger)]/25 bg-[color:var(--color-danger-bg)] px-4 py-3 text-sm text-[color:var(--color-danger)]">
          {error}
        </p>
      ) : null}

      {!attemptUuid ? (
        <form
          onSubmit={requestOtp}
          className="mt-8 space-y-5 rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 shadow-sm"
        >
          <fieldset className="space-y-2">
            <legend className="text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">Verify with</legend>
            <div className="flex gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="channel"
                  checked={channel === "email"}
                  onChange={() => setChannel("email")}
                  className="accent-[color:var(--color-primary)]"
                />
                Email
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="channel"
                  checked={channel === "phone"}
                  onChange={() => setChannel("phone")}
                  className="accent-[color:var(--color-primary)]"
                />
                Phone
              </label>
            </div>
          </fieldset>

          {channel === "email" ? (
            <div>
              <label htmlFor="su-email" className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
                Email
              </label>
              <input
                id="su-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[color:var(--color-input-border)] bg-white px-4 py-3 text-[color:var(--color-foreground)] outline-none ring-[color:var(--color-focus)] focus:ring-2"
                required
              />
            </div>
          ) : (
            <div>
              <label htmlFor="su-phone" className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
                Mobile number
              </label>
              <input
                id="su-phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[color:var(--color-input-border)] bg-white px-4 py-3 text-[color:var(--color-foreground)] outline-none ring-[color:var(--color-focus)] focus:ring-2"
                required
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
        <form
          onSubmit={completeRegistration}
          className="mt-8 space-y-5 rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 shadow-sm"
        >
          <p className="text-sm text-[color:var(--color-muted)]">
            Verifying <span className="font-semibold text-[color:var(--color-foreground)]">{contactSummary || "your contact"}</span>
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

          <OtpInput id="su-code" label="6-digit code" value={code} onChange={setCode} disabled={busy} />

          <PasswordField
            id="su-password"
            label="Password"
            autoComplete="new-password"
            required
            minLength={PASSWORD_MIN_LENGTH}
            value={password}
            onChange={setPassword}
            hint={`At least ${PASSWORD_MIN_LENGTH} characters.`}
          />

          <PasswordField
            id="su-password2"
            label="Confirm password"
            autoComplete="new-password"
            required
            minLength={PASSWORD_MIN_LENGTH}
            value={passwordConfirmation}
            onChange={setPasswordConfirmation}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="su-fn" className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
                First name
              </label>
              <input
                id="su-fn"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[color:var(--color-input-border)] bg-white px-4 py-3 text-[color:var(--color-foreground)] outline-none ring-[color:var(--color-focus)] focus:ring-2"
                required
              />
            </div>
            <div>
              <label htmlFor="su-ln" className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
                Last name
              </label>
              <input
                id="su-ln"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[color:var(--color-input-border)] bg-white px-4 py-3 text-[color:var(--color-foreground)] outline-none ring-[color:var(--color-focus)] focus:ring-2"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="su-on" className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
              Other names <span className="font-normal normal-case">(optional)</span>
            </label>
            <input
              id="su-on"
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
            {busy ? "Creating account…" : "Create account"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-[color:var(--color-muted)]">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-semibold text-[color:var(--color-primary)] underline-offset-2 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
