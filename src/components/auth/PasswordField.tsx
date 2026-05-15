"use client";

import { useId, useState } from "react";

const inputClass =
  "w-full rounded-xl border border-[color:var(--color-input-border)] bg-white px-4 py-3 pr-11 text-[color:var(--color-foreground)] outline-none ring-[color:var(--color-focus)] focus:ring-2";

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <path d="M1 1 23 23" />
    </svg>
  );
}

type Props = {
  id?: string;
  name?: string;
  /** When omitted, only the input row is rendered (use when the label lives elsewhere). */
  label?: string;
  /** Used when `label` is omitted (e.g. custom heading row). */
  "aria-label"?: string;
  autoComplete: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  minLength?: number;
  hint?: React.ReactNode;
};

export function PasswordField({
  id: idProp,
  name,
  label,
  "aria-label": ariaLabel,
  autoComplete,
  value,
  onChange,
  required,
  minLength,
  hint,
}: Props) {
  const reactId = useId();
  const inputId = idProp ?? `pw-${reactId}`;
  const [visible, setVisible] = useState(false);

  return (
    <div>
      {label ? (
        <label htmlFor={inputId} className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
          {label}
        </label>
      ) : null}
      <div className="relative mt-2">
        <input
          id={inputId}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          aria-label={label ? undefined : ariaLabel}
          required={required}
          minLength={minLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
        <button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[color:var(--color-muted)] outline-none ring-[color:var(--color-focus)] hover:text-[color:var(--color-foreground)] focus-visible:ring-2"
        >
          {visible ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
        </button>
      </div>
      {hint ? <div className="mt-1.5 text-xs text-[color:var(--color-muted)]">{hint}</div> : null}
    </div>
  );
}
