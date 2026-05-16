import Link from "next/link";

type Props = {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
  tone?: "default" | "success" | "warning" | "muted";
};

const toneRing: Record<NonNullable<Props["tone"]>, string> = {
  default: "border-[color:var(--color-border-strong)]",
  success: "border-[color:var(--color-success)]/25 bg-[color:var(--color-success-bg)]/40",
  warning: "border-[color:var(--color-warning)]/25 bg-[color:var(--color-warning-bg)]/50",
  muted: "border-[color:var(--color-border)] bg-[color:var(--color-muted-bg)]/60",
};

export function MerchantStatCard({ label, value, hint, href, tone = "default" }: Props) {
  const inner = (
    <>
      <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">{label}</p>
      <p className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-bold tabular-nums text-[color:var(--color-foreground)]">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-[color:var(--color-muted)]">{hint}</p> : null}
    </>
  );

  const className = `flex h-full flex-col rounded-2xl border p-5 shadow-sm transition ${toneRing[tone]} ${
    href ? "hover:border-[color:var(--color-primary)]/35 hover:shadow-md" : ""
  } bg-white`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }

  return <article className={className}>{inner}</article>;
}
