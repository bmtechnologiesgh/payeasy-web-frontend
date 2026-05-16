type Props = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
};

export function PageHeader({ eyebrow, title, subtitle, align = "left" }: Props) {
  const alignClass = align === "center" ? "text-center" : "";

  return (
    <header className={alignClass}>
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-muted)]">
        {eyebrow}
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-bold text-[color:var(--color-foreground)] sm:text-4xl">
        {title}
      </h1>
      {subtitle ? (
        <p
          className={`mt-3 text-sm text-[color:var(--color-muted)] ${
            align === "center" ? "mx-auto max-w-sm" : "max-w-xl"
          }`}
        >
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}
