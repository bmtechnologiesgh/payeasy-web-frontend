import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  title: string;
  actionHref?: string;
  actionLabel?: string;
  eyebrow?: string;
  right?: ReactNode;
};

export function SectionHeading({
  title,
  actionHref,
  actionLabel,
  eyebrow,
  right,
}: Props) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--color-muted)]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold tracking-tight text-[color:var(--color-foreground)] md:text-2xl">
          {title}
        </h2>
      </div>
      {right ??
        (actionHref && actionLabel ? (
          <Link
            href={actionHref}
            className="text-sm font-medium text-[color:var(--color-foreground)] underline underline-offset-4 hover:opacity-80"
          >
            {actionLabel}
          </Link>
        ) : null)}
    </div>
  );
}
