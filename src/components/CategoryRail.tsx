import Link from "next/link";
import type { CategorySummary } from "@/lib/catalog";
import { CategoryNavIcon } from "@/components/CategoryNavIcon";
import { withSalaryParam } from "@/lib/eligibility";

type Props = {
  categories: CategorySummary[];
  salaryGhs: number | null;
  /** Maximum rows to show. Excess categories collapse into a "View all" footer. */
  limit?: number;
};

/**
 * Motta-style vertical category list. Sits to the left of the hero spotlight on
 * desktop (md+) and is hidden on tablet/mobile in favour of the horizontal chip
 * row inside HomeHero. Matches Motta's `motta-advanced-menu` rhythm: monoline icon
 * + label + right chevron, separated by a faint divider.
 */
export function CategoryRail({ categories, salaryGhs, limit = 9 }: Props) {
  const display = categories.slice(0, limit);
  const hasMore = categories.length > limit;

  return (
    <aside
      aria-label="Shop by category"
      className="hidden w-full shrink-0 self-stretch rounded-2xl border border-[color:var(--color-border)] bg-white shadow-sm md:block md:w-[230px] lg:w-[250px]"
    >
      <ul className="flex h-full flex-col py-1.5">
        {display.map((c) => {
          const href = withSalaryParam(`/catalog/${c.slug}`, salaryGhs);
          return (
            <li key={c.slug} className="border-b border-[color:var(--color-border)] last:border-b-0">
              <Link
                href={href}
                className="group flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold text-[color:var(--color-foreground)] transition hover:text-[color:var(--color-primary)]"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center text-[color:var(--color-foreground)]/75 transition group-hover:text-[color:var(--color-primary)]">
                  <CategoryNavIcon slug={c.slug} name={c.name} />
                </span>
                <span className="flex-1 truncate">{c.name}</span>
                <svg
                  viewBox="0 0 12 12"
                  className="h-3 w-3 text-[color:var(--color-muted)] transition group-hover:text-[color:var(--color-primary)]"
                  aria-hidden
                >
                  <path
                    d="M4 2.5L7.5 6L4 9.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </li>
          );
        })}

        {hasMore ? (
          <li className="mt-auto border-t border-[color:var(--color-border)]">
            <Link
              href={withSalaryParam("/catalog", salaryGhs)}
              className="flex items-center justify-between px-4 py-3 text-[12px] font-bold uppercase tracking-wide text-[color:var(--color-primary)] hover:text-[color:var(--color-primary-hover)]"
            >
              <span>View all categories</span>
              <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden>
                <path
                  d="M4 2.5L7.5 6L4 9.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </li>
        ) : null}
      </ul>
    </aside>
  );
}
