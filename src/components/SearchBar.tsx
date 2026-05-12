"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { IconChevronDown, IconSearch } from "@/components/marketplace/icons";

export type SearchCategoryOption = {
  slug: string;
  name: string;
};

type Props = {
  categories?: SearchCategoryOption[];
};

export function SearchBar({ categories = [] }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState("");
  const [categorySlug, setCategorySlug] = useState<string>("all");

  useEffect(() => {
    setValue(searchParams.get("q") ?? "");
  }, [searchParams]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const q = value.trim();
    const params = new URLSearchParams();
    if (q) params.set("q", q);

    if (categorySlug !== "all") {
      router.push(`/catalog/${categorySlug}?${params.toString()}`);
      return;
    }
    router.push(`/catalog?${params.toString()}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full items-center gap-1 rounded-full border border-[color:var(--color-input-border)] bg-[color:var(--color-muted-bg)] p-1 pl-2 shadow-inner sm:pl-3"
    >
      <label className="sr-only" htmlFor="catalog-search">
        Search products
      </label>
      <div className="relative shrink-0">
        <select
          aria-label="Category"
          value={categorySlug}
          onChange={(e) => setCategorySlug(e.target.value)}
          className="max-w-[7.5rem] cursor-pointer appearance-none rounded-full border-0 bg-transparent py-2.5 pl-2 pr-8 text-[13px] font-semibold text-[color:var(--color-foreground)] outline-none focus:ring-0 sm:max-w-[10rem] sm:text-sm"
        >
          <option value="all">All</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <IconChevronDown className="pointer-events-none absolute right-1 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-muted)]" />
      </div>
      <span className="hidden h-6 w-px shrink-0 bg-[color:var(--color-border-strong)] sm:block" aria-hidden />
      <input
        id="catalog-search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search for anything."
        className="min-w-0 flex-1 border-0 bg-transparent py-2.5 text-sm text-[color:var(--color-foreground)] outline-none ring-0 placeholder:text-[color:var(--color-muted)]"
      />
      <button
        type="submit"
        aria-label="Search"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[color:var(--color-foreground)] shadow-sm ring-1 ring-[color:var(--color-border)] transition hover:bg-[color:var(--color-muted-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-primary)]"
      >
        <IconSearch className="h-5 w-5" />
      </button>
    </form>
  );
}
