import Link from "next/link";

type Props = {
  actionPath: string;
  min?: number;
  max?: number;
  q?: string;
  salary?: number;
  payrollOnly?: boolean;
};

export function CatalogSidebar({ actionPath, min, max, q, salary, payrollOnly }: Props) {
  const resetParams = new URLSearchParams();
  if (q) resetParams.set("q", q);
  if (salary != null) resetParams.set("salary", String(salary));
  const resetHref = resetParams.toString() ? `${actionPath}?${resetParams.toString()}` : actionPath;

  return (
    <aside className="space-y-6 rounded-xl border border-[color:var(--color-border)] bg-white p-4 shadow-sm">
      <div>
        <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[color:var(--color-foreground)]">
          Filters
        </h2>
        <p className="mt-1 text-xs text-[color:var(--color-muted)]">
          Combine salary band with monthly price ceiling to find a payroll-friendly plan.
        </p>
      </div>

      <form method="get" action={actionPath} className="space-y-4">
        {q ? <input type="hidden" name="q" value={q} /> : null}
        {salary != null ? <input type="hidden" name="salary" value={salary} /> : null}

        <div>
          <label
            className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-muted)]"
            htmlFor="min-price"
          >
            Min monthly (GHS)
          </label>
          <input
            id="min-price"
            name="min"
            type="number"
            inputMode="numeric"
            min={0}
            step={50}
            defaultValue={min ?? ""}
            placeholder="0"
            className="mt-1 w-full rounded-lg border border-[color:var(--color-input-border)] px-3 py-2 text-sm outline-none focus:border-[color:var(--color-primary)] focus:ring-4 focus:ring-[color:var(--color-focus)]"
          />
        </div>
        <div>
          <label
            className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-muted)]"
            htmlFor="max-price"
          >
            Max monthly (GHS)
          </label>
          <input
            id="max-price"
            name="max"
            type="number"
            inputMode="numeric"
            min={0}
            step={50}
            defaultValue={max ?? ""}
            placeholder="Any"
            className="mt-1 w-full rounded-lg border border-[color:var(--color-input-border)] px-3 py-2 text-sm outline-none focus:border-[color:var(--color-primary)] focus:ring-4 focus:ring-[color:var(--color-focus)]"
          />
        </div>

        <fieldset className="space-y-3 rounded-lg bg-[color:var(--color-muted-bg)] px-3 py-3">
          <legend className="px-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">
            BNPL
          </legend>
          <label className="flex items-start gap-2 text-xs text-[color:var(--color-foreground)]">
            <input
              type="checkbox"
              name="payroll"
              value="1"
              defaultChecked={payrollOnly ?? false}
              className="mt-0.5 h-4 w-4 accent-[color:var(--color-foreground)]"
            />
            <span>
              <span className="font-semibold">Payroll-backed only</span>
              <span className="block text-[11px] text-[color:var(--color-muted)]">
                Hide products that exceed your 30% deduction cap.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-2 text-xs text-[color:var(--color-muted)]">
            <input type="checkbox" disabled className="mt-0.5 h-4 w-4" />
            <span>
              <span className="font-semibold text-[color:var(--color-foreground)]">Employer-approved brands</span>
              <span className="block text-[11px] text-[color:var(--color-muted)]">
                Coming soon — restrict to brands your HR team has approved.
              </span>
            </span>
          </label>
        </fieldset>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 rounded-lg bg-[color:var(--color-primary)] px-3 py-2 text-sm font-semibold text-white hover:bg-[color:var(--color-primary-hover)]"
          >
            Apply
          </button>
          <Link
            href={resetHref}
            className="rounded-lg border border-[color:var(--color-border-strong)] px-3 py-2 text-center text-sm font-semibold text-[color:var(--color-primary)] hover:bg-[color:var(--color-app)]"
          >
            Reset
          </Link>
        </div>
      </form>
    </aside>
  );
}
