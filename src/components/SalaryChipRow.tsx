import Link from "next/link";
import { formatGhs } from "@/lib/format";

const PRESETS: { label: string; salary: number | null }[] = [
  { label: "Any salary", salary: null },
  { label: "≤ ₵3,000", salary: 3000 },
  { label: "≤ ₵5,000", salary: 5000 },
  { label: "≤ ₵8,000", salary: 8000 },
  { label: "≤ ₵12,000", salary: 12000 },
];

type Props = {
  /** Currently selected salary hint (from `?salary=`). */
  currentSalary: number | null;
  /** Base path to keep when chips rebuild the href, e.g. `/catalog` or `/catalog/phones`. */
  basePath: string;
  /** Other query params to preserve verbatim, e.g. `q`, `min`, `max`, `payroll`. */
  preserve?: Record<string, string | undefined>;
};

function buildHref(
  basePath: string,
  salary: number | null,
  preserve: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(preserve)) {
    if (v) params.set(k, v);
  }
  if (salary != null) {
    params.set("salary", String(salary));
  } else {
    params.delete("salary");
  }
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function SalaryChipRow({ currentSalary, basePath, preserve = {} }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">
        Salary band
      </span>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => {
          const active =
            (p.salary == null && currentSalary == null) || p.salary === currentSalary;
          return (
            <Link
              key={p.label}
              href={buildHref(basePath, p.salary, preserve)}
              className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                active
                  ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-white"
                  : "border-[color:var(--color-border-strong)] bg-white text-[color:var(--color-foreground)] hover:bg-[color:var(--color-muted-bg)]"
              }`}
              aria-pressed={active}
            >
              {p.label}
            </Link>
          );
        })}
      </div>
      {currentSalary != null ? (
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[color:var(--color-primary)] px-3 py-1 text-[11px] font-semibold text-white">
          Your salary {formatGhs(currentSalary)}
        </span>
      ) : null}
    </div>
  );
}
