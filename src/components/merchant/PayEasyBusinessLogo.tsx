import Link from "next/link";

type Props = {
  size?: "sm" | "md";
  href?: string;
  /** High-contrast treatment for dark primary backgrounds. */
  variant?: "default" | "onPrimary";
};

export function PayEasyBusinessLogo({
  size = "md",
  href = "/dashboard",
  variant = "default",
}: Props) {
  const textSize = size === "sm" ? "text-sm" : "text-lg sm:text-xl";
  const brandClass =
    variant === "onPrimary" ? "text-white" : "text-[color:var(--color-foreground)]";

  return (
    <Link href={href} className="flex min-w-0 items-center gap-2 text-left">
      <span className="flex shrink-0 gap-0.5" aria-hidden>
        <span className="h-2.5 w-2.5 rounded-sm bg-[#e53935]" />
        <span className="h-2.5 w-2.5 rounded-sm bg-[#43a047]" />
        <span className="h-2.5 w-2.5 rounded-sm bg-[#1e88e5]" />
        <span className="h-2.5 w-2.5 rounded-sm bg-[#fbc02d]" />
      </span>
      <span className="min-w-0">
        <span
          className={`font-[family-name:var(--font-heading)] font-extrabold tracking-tight ${textSize} ${brandClass}`}
        >
          PayEasy
        </span>
        <span
          className={`ml-1.5 text-[10px] font-bold uppercase tracking-[0.14em] ${
            variant === "onPrimary" ? "text-white/70" : "text-[color:var(--color-muted)]"
          }`}
        >
          Business
        </span>
      </span>
    </Link>
  );
}
