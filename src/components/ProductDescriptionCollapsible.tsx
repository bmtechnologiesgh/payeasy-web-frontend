"use client";

import { useId, useMemo, useState } from "react";

const MIN_CHARS_FOR_TOGGLE = 320;

type Props = {
  description: string;
  className?: string;
};

function descriptionNeedsToggle(text: string): boolean {
  if (text.length >= MIN_CHARS_FOR_TOGGLE) {
    return true;
  }

  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim() !== "");

  return paragraphs.length > 2;
}

export function ProductDescriptionCollapsible({ description, className = "" }: Props) {
  const contentId = useId();
  const [expanded, setExpanded] = useState(false);

  const needsToggle = useMemo(() => descriptionNeedsToggle(description), [description]);
  const collapsed = needsToggle && !expanded;

  return (
    <section aria-labelledby={`${contentId}-heading`} className={className}>
      <h2
        id={`${contentId}-heading`}
        className="text-[11px] font-bold uppercase tracking-[0.14em] text-[color:var(--color-muted)]"
      >
        About this product
      </h2>
      <div id={contentId} className="relative mt-2">
        <p
          className={`whitespace-pre-wrap text-sm leading-relaxed text-[color:var(--color-foreground)] ${
            collapsed ? "line-clamp-6" : ""
          }`}
        >
          {description}
        </p>
        {collapsed ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[color:var(--color-app)] to-transparent"
          />
        ) : null}
      </div>
      {needsToggle ? (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={() => setExpanded((open) => !open)}
          className="mt-2 text-sm font-semibold text-[color:var(--color-primary)] underline-offset-4 hover:underline"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      ) : null}
    </section>
  );
}
