"use client";

type Props = {
  currentPage: number;
  lastPage: number;
  total: number;
  onPageChange: (page: number) => void;
};

export function OpsPagination({ currentPage, lastPage, total, onPageChange }: Props) {
  if (lastPage <= 1) {
    return (
      <p className="mt-4 text-xs text-[color:var(--color-muted)]">
        {total} {total === 1 ? "result" : "results"}
      </p>
    );
  }

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-[color:var(--color-muted)]">
        Page {currentPage} of {lastPage} · {total} total
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-[color:var(--color-border-strong)] bg-white px-4 text-sm font-semibold text-[color:var(--color-foreground)] transition hover:bg-[color:var(--color-muted-bg)] disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={currentPage >= lastPage}
          onClick={() => onPageChange(currentPage + 1)}
          className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-[color:var(--color-border-strong)] bg-white px-4 text-sm font-semibold text-[color:var(--color-foreground)] transition hover:bg-[color:var(--color-muted-bg)] disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
