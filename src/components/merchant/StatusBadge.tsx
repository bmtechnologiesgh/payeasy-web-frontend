type StatusTone = "success" | "warning" | "danger" | "neutral";

const toneClasses: Record<StatusTone, string> = {
  success:
    "bg-[color:var(--color-success-bg)] text-[color:var(--color-success)] ring-[color:var(--color-success)]/20",
  warning:
    "bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)] ring-[color:var(--color-warning)]/20",
  danger:
    "bg-[color:var(--color-danger-bg)] text-[color:var(--color-danger)] ring-[color:var(--color-danger)]/20",
  neutral: "bg-[color:var(--color-muted-bg)] text-[color:var(--color-muted)] ring-[color:var(--color-border-strong)]",
};

export function merchantStatusTone(status: string | null | undefined): StatusTone {
  const normalized = (status ?? "not_started").toLowerCase();

  if (["approved", "active", "verified", "live"].includes(normalized)) {
    return "success";
  }
  if (["pending", "under_review", "review", "submitted"].includes(normalized)) {
    return "warning";
  }
  if (["rejected", "suspended", "locked", "inactive"].includes(normalized)) {
    return "danger";
  }
  return "neutral";
}

export function formatMerchantStatus(status: string | null | undefined): string {
  const normalized = (status ?? "not_started").replace(/_/g, " ");
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

type Props = {
  status: string | null | undefined;
  className?: string;
};

export function StatusBadge({ status, className = "" }: Props) {
  const tone = merchantStatusTone(status);

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${toneClasses[tone]} ${className}`}
    >
      {formatMerchantStatus(status)}
    </span>
  );
}
