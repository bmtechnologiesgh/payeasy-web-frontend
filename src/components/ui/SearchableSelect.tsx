"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

export type SearchableSelectOption = {
  value: string;
  label: string;
  hint?: string;
};

type Props = {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  /** When true, users can pick a value that is not in the option list. */
  allowCustom?: boolean;
  customOptionLabel?: (query: string) => string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

export function SearchableSelect({
  id: idProp,
  label,
  value,
  onChange,
  options,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyMessage = "No matches",
  allowCustom = false,
  customOptionLabel = (query) => `Add "${query}"`,
  required = false,
  disabled = false,
  className = "",
}: Props) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const listboxId = `${id}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = useMemo(() => options.find((o) => o.value === value), [options, value]);

  const displayLabel = selected?.label ?? (value.trim() !== "" ? value : null);

  const customQuery = query.trim();

  const hasExactMatch = useMemo(() => {
    if (customQuery === "") {
      return true;
    }
    const q = customQuery.toLowerCase();
    return options.some((o) => o.value.toLowerCase() === q || o.label.toLowerCase() === q);
  }, [customQuery, options]);

  const showCustomOption = allowCustom && customQuery !== "" && !hasExactMatch;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return options;
    }
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.value.toLowerCase().includes(q) ||
        (o.hint?.toLowerCase().includes(q) ?? false),
    );
  }, [options, query]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function openList() {
    if (disabled) {
      return;
    }
    setOpen(true);
    setQuery("");
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }

  function selectOption(next: string) {
    onChange(next);
    setOpen(false);
    setQuery("");
  }

  const triggerClass =
    "mt-2 flex w-full min-h-[48px] items-center justify-between gap-2 rounded-xl border border-[color:var(--color-input-border)] bg-white px-4 py-3 text-left text-sm text-[color:var(--color-foreground)] outline-none ring-[color:var(--color-focus)] focus:ring-2 disabled:opacity-60";

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {label ? (
        <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
          {label}
          {required ? <span className="text-[color:var(--color-danger)]"> *</span> : null}
        </label>
      ) : null}

      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => (open ? setOpen(false) : openList())}
        className={triggerClass}
      >
        <span className={displayLabel ? "" : "text-[color:var(--color-muted)]"}>
          {displayLabel ?? placeholder}
        </span>
        <span aria-hidden className="text-[color:var(--color-muted)]">
          ▾
        </span>
      </button>

      {open ? (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-[color:var(--color-border-strong)] bg-white shadow-lg">
          <div className="border-b border-[color:var(--color-border)] p-2">
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg border border-[color:var(--color-input-border)] bg-[color:var(--color-muted-bg)]/40 px-3 py-2 text-sm outline-none ring-[color:var(--color-focus)] focus:ring-2"
            />
          </div>
          <ul id={listboxId} role="listbox" className="max-h-56 overflow-y-auto py-1">
            {showCustomOption ? (
              <li role="option" aria-selected={value === customQuery}>
                <button
                  type="button"
                  onClick={() => selectOption(customQuery)}
                  className="flex w-full flex-col border-b border-[color:var(--color-border)] px-4 py-2.5 text-left text-sm font-semibold text-[color:var(--color-primary)] transition hover:bg-[color:var(--color-primary)]/8"
                >
                  {customOptionLabel(customQuery)}
                </button>
              </li>
            ) : null}
            {filtered.length === 0 && !showCustomOption ? (
              <li className="px-4 py-3 text-sm text-[color:var(--color-muted)]">{emptyMessage}</li>
            ) : (
              filtered.map((option) => {
                const active = option.value === value;
                return (
                  <li key={option.value} role="option" aria-selected={active}>
                    <button
                      type="button"
                      onClick={() => selectOption(option.value)}
                      className={`flex w-full flex-col px-4 py-2.5 text-left text-sm transition hover:bg-[color:var(--color-muted-bg)] ${
                        active ? "bg-[color:var(--color-primary)]/8 font-semibold text-[color:var(--color-primary)]" : ""
                      }`}
                    >
                      <span>{option.label}</span>
                      {option.hint ? (
                        <span className="text-xs font-normal text-[color:var(--color-muted)]">{option.hint}</span>
                      ) : null}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
