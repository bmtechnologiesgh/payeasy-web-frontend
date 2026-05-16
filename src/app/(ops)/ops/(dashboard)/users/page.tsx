"use client";

import { OpsPagination } from "@/components/ops/OpsPagination";
import { PageHeader } from "@/components/PageHeader";
import { getAccessToken } from "@/lib/auth-token";
import { listUsers, type AdminUser } from "@/lib/ops-admin-api";
import { portalHref } from "@/lib/portal-path";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
];

const ROLE_OPTIONS = [
  { value: "", label: "All roles" },
  { value: "employee", label: "Employee" },
  { value: "merchant", label: "Merchant" },
  { value: "employer", label: "Employer" },
  { value: "admin", label: "Admin" },
  { value: "super_admin", label: "Super admin" },
  { value: "credit_officer", label: "Credit officer" },
  { value: "finance_officer", label: "Finance officer" },
];

function statusTone(status: string): string {
  if (status === "active") return "text-[color:var(--color-success)]";
  if (status === "suspended") return "text-[color:var(--color-danger)]";
  if (status === "pending") return "text-[color:var(--color-warning)]";
  return "text-[color:var(--color-muted)]";
}

export default function UsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
  const [meta, setMeta] = useState({ count: 0, current_page: 1, last_page: 1, per_page: 20 });
  const page = Number(searchParams.get("page") ?? "1") || 1;

  const load = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const result = await listUsers(token, {
        search: searchParams.get("search") ?? undefined,
        status: searchParams.get("status") ?? undefined,
        role: searchParams.get("role") ?? undefined,
        page,
        per_page: 20,
      });
      setUsers(result.users);
      setMeta(result.meta);
    } catch {
      setError("Could not load users. You may need the view-users permission.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams, page]);

  useEffect(() => {
    load();
  }, [load]);

  function applyFilters(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchInput.trim()) params.set("search", searchInput.trim());
    const status = searchParams.get("status");
    const role = searchParams.get("role");
    if (status) params.set("status", status);
    if (role) params.set("role", role);
    router.push(portalHref("ops", `/users${params.toString() ? `?${params}` : ""}`));
  }

  function setFilter(key: "status" | "role", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(portalHref("ops", `/users${params.toString() ? `?${params}` : ""}`));
  }

  function goToPage(next: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(next));
    router.push(portalHref("ops", `/users?${params}`));
  }

  return (
    <main className="px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Operations"
        title="Users"
        subtitle="Search platform accounts, review status, and manage roles on user detail pages."
      />

      <form onSubmit={applyFilters} className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="user-search" className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
            Search
          </label>
          <input
            id="user-search"
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Name, email, phone…"
            className="mt-2 w-full rounded-xl border border-[color:var(--color-input-border)] bg-white px-4 py-3 text-sm outline-none ring-[color:var(--color-focus)] focus:ring-2"
          />
        </div>
        <div className="w-full sm:w-40">
          <label htmlFor="user-status" className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
            Status
          </label>
          <select
            id="user-status"
            value={searchParams.get("status") ?? ""}
            onChange={(e) => setFilter("status", e.target.value)}
            className="mt-2 w-full rounded-xl border border-[color:var(--color-input-border)] bg-white px-4 py-3 text-sm outline-none focus:ring-2"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value || "all"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-44">
          <label htmlFor="user-role" className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
            Role
          </label>
          <select
            id="user-role"
            value={searchParams.get("role") ?? ""}
            onChange={(e) => setFilter("role", e.target.value)}
            className="mt-2 w-full rounded-xl border border-[color:var(--color-input-border)] bg-white px-4 py-3 text-sm outline-none focus:ring-2"
          >
            {ROLE_OPTIONS.map((o) => (
              <option key={o.value || "all"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="inline-flex min-h-[48px] shrink-0 items-center justify-center rounded-full bg-[color:var(--color-primary)] px-6 text-sm font-semibold text-white hover:bg-[color:var(--color-primary-hover)]"
        >
          Search
        </button>
      </form>

      {error ? (
        <div role="alert" className="mt-6 rounded-xl border border-[color:var(--color-danger)]/25 bg-[color:var(--color-danger-bg)] px-4 py-3 text-sm text-[color:var(--color-danger)]">
          {error}
        </div>
      ) : null}

      <div className="mt-8 overflow-hidden rounded-2xl border border-[color:var(--color-border-strong)] bg-white shadow-sm">
        {loading ? (
          <p className="px-5 py-8 text-sm text-[color:var(--color-muted)]">Loading users…</p>
        ) : users.length === 0 ? (
          <p className="px-5 py-8 text-sm text-[color:var(--color-muted)]">No users match your filters.</p>
        ) : (
          <ul className="divide-y divide-[color:var(--color-border)]">
            {users.map((user) => (
              <li key={user.uuid}>
                <Link
                  href={portalHref("ops", `/users/${user.uuid}`)}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-[color:var(--color-muted-bg)]/60"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-[color:var(--color-foreground)]">{user.full_name}</p>
                    <p className="mt-0.5 text-xs text-[color:var(--color-muted)]">
                      {user.email ?? "No email"} · {user.roles.join(", ") || "no roles"}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold uppercase tracking-wide ${statusTone(user.status)}`}>
                    {user.status_label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!loading && !error ? (
        <OpsPagination
          currentPage={meta.current_page}
          lastPage={meta.last_page}
          total={meta.count}
          onPageChange={goToPage}
        />
      ) : null}
    </main>
  );
}
