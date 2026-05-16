"use client";

import { useCallback, useRef } from "react";

const LENGTH = 6;

function packSlots(value: string): string[] {
  const clean = value.replace(/\D/g, "").slice(0, LENGTH);
  const slots: string[] = Array.from({ length: LENGTH }, () => "");
  for (let i = 0; i < clean.length; i++) {
    slots[i] = clean[i]!;
  }
  return slots;
}

const cellClass =
  "flex h-12 min-w-0 flex-1 rounded-xl border border-[color:var(--color-input-border)] bg-white text-center text-lg font-semibold tabular-nums text-[color:var(--color-foreground)] outline-none ring-[color:var(--color-focus)] focus:ring-2";

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
};

export function OtpInput({ id, label, value, onChange, disabled }: Props) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const slots = packSlots(value);

  const focusCell = useCallback((idx: number) => {
    window.requestAnimationFrame(() => {
      const el = refs.current[idx];
      el?.focus();
      el?.select();
    });
  }, []);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
      if (!digits) return;
      onChange(digits);
      focusCell(Math.min(digits.length, LENGTH - 1));
    },
    [focusCell, onChange],
  );

  function handleChange(index: number, raw: string) {
    const digits = raw.replace(/\D/g, "");
    if (digits.length > 1) {
      const next = digits.slice(0, LENGTH);
      onChange(next);
      focusCell(Math.min(next.length, LENGTH - 1));
      return;
    }
    const nextSlots = [...slots];
    nextSlots[index] = digits.slice(-1);
    onChange(nextSlots.join(""));
    if (digits && index < LENGTH - 1) {
      focusCell(index + 1);
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Backspace") return;
    const nextSlots = [...slots];
    if (nextSlots[index]) {
      nextSlots[index] = "";
      onChange(nextSlots.join(""));
      e.preventDefault();
      return;
    }
    if (index > 0) {
      nextSlots[index - 1] = "";
      onChange(nextSlots.join(""));
      focusCell(index - 1);
      e.preventDefault();
    }
  }

  const labelId = `${id}-label`;

  return (
    <div>
      <p id={labelId} className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
        {label}
      </p>
      <div
        role="group"
        aria-labelledby={labelId}
        className="mt-2 flex gap-2"
        onPaste={handlePaste}
      >
        {slots.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            id={`${id}-${i}`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            disabled={disabled}
            value={digit}
            aria-label={`Digit ${i + 1} of ${LENGTH}`}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onFocus={(e) => e.target.select()}
            className={cellClass}
          />
        ))}
      </div>
    </div>
  );
}
