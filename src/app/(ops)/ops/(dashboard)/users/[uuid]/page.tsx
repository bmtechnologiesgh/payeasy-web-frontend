"use client";

import { PageHeader } from "@/components/PageHeader";
import { getAccessToken } from "@/lib/auth-token";
import {
  getUser,
  listRoles,
  syncUserRoles,
  updateUser,
  type AdminRole,
  type AdminUser,
} from "@/lib/ops-admin-api";
import { portalHref } from "@/lib/portal-path";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";

const USER_STATUSES = ["active", "inactive", "suspended", "pending"] as const;

const ALL_ROLES = [
  "employee",
  "merchant",
  "employer",
  "credit_officer",
  "finance_officer",
  "admin",
  "super_admin",
] as const;

export default function UserDetailPage() {
  const params = useParams<{ uuid: string }>();
  const uuid = params.uuid;
  const [user, setUser] = useState<AdminUser | null>(null);
  const [availableRoles, setAvailableRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingRoles, setSavingRoles] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    other_name: "",
    email: "",
    phone: "",
    status: "active",
    is_active: true,
  });

  const load = useCallback(async () => {
    const token = getAccessToken();
    if (!token || !uuid) return;

    setLoading(true);
    setError(null);

    try {
      const [u, roles] = await Promise.all([getUser(token, uuid), listRoles(token).catch(() => [])]);
      setUser(u);
      setAvailableRoles(roles);
      setSelectedRoles(u.roles);
      setForm({
        first_name: u.first_name,
        last_name: u.last_name,
        other_name: u.other_name ?? "",
        email: u.email ?? "",
        phone: u.phone ?? "",
        status: u.status,
        is_active: u.is_active,
      });
    } catch {
      setError("Could not load this user.");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [uuid]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleProfileSubmit(event: FormEvent) {
    event.preventDefault();
    const token = getAccessToken();
    if (!token || !uuid) return;

    setSavingProfile(true);
    setProfileError(null);

    try {
      const updated = await updateUser(token, uuid, {
        first_name: form.first_name,
        last_name: form.last_name,
        other_name: form.other_name.trim() || null,
        email: form.email,
        phone: form.phone.trim() || null,
        status: form.status,
        is_active: form.is_active,
      });
      setUser(updated);
      setSelectedRoles(updated.roles);
    } catch (e) {
      setProfileError(e instanceof Error ? e.message : "Could not save profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleRolesSubmit(event: FormEvent) {
    event.preventDefault();
    const token = getAccessToken();
    if (!token || !uuid) return;

    setSavingRoles(true);
    setRolesError(null);

    try {
      const updated = await syncUserRoles(token, uuid, selectedRoles);
      setUser(updated);
      setSelectedRoles(updated.roles);
    } catch (e) {
      setRolesError(e instanceof Error ? e.message : "Could not save roles.");
    } finally {
      setSavingRoles(false);
    }
  }

  function toggleRole(role: string) {
    setSelectedRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));
  }

  const roleOptions = availableRoles.length > 0 ? availableRoles.map((r) => r.name) : [...ALL_ROLES];

  return (
    <main className="px-4 py-10 sm:px-6">
      <Link href={portalHref("ops", "/users")} className="text-sm font-semibold text-[color:var(--color-primary)] hover:underline">
        ← All users
      </Link>

      {loading ? <p className="mt-8 text-sm text-[color:var(--color-muted)]">Loading user…</p> : null}
      {error ? (
        <div role="alert" className="mt-8 rounded-xl border border-[color:var(--color-danger)]/25 bg-[color:var(--color-danger-bg)] px-4 py-3 text-sm text-[color:var(--color-danger)]">
          {error}
        </div>
      ) : null}

      {user ? (
        <div className="mt-8 space-y-8">
          <PageHeader eyebrow="User" title={user.full_name} subtitle={user.email ?? undefined} />

          <form
            onSubmit={handleProfileSubmit}
            className="space-y-5 rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 shadow-sm"
          >
            <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold">Profile</h2>
            {profileError ? (
              <div role="alert" className="rounded-xl border border-[color:var(--color-danger)]/25 bg-[color:var(--color-danger-bg)] px-4 py-3 text-sm text-[color:var(--color-danger)]">
                {profileError}
              </div>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">First name</label>
                <input
                  required
                  value={form.first_name}
                  onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-[color:var(--color-input-border)] px-4 py-3 text-sm outline-none focus:ring-2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">Last name</label>
                <input
                  required
                  value={form.last_name}
                  onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-[color:var(--color-input-border)] px-4 py-3 text-sm outline-none focus:ring-2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">Other name</label>
                <input
                  value={form.other_name}
                  onChange={(e) => setForm((f) => ({ ...f, other_name: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-[color:var(--color-input-border)] px-4 py-3 text-sm outline-none focus:ring-2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-[color:var(--color-input-border)] px-4 py-3 text-sm outline-none focus:ring-2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-[color:var(--color-input-border)] px-4 py-3 text-sm outline-none focus:ring-2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-[color:var(--color-input-border)] px-4 py-3 text-sm outline-none focus:ring-2"
                >
                  {USER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                className="size-4 rounded border-[color:var(--color-input-border)]"
              />
              Account is active
            </label>
            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[color:var(--color-primary)] px-5 text-sm font-semibold text-white hover:bg-[color:var(--color-primary-hover)] disabled:opacity-60"
            >
              {savingProfile ? "Saving…" : "Save profile"}
            </button>
          </form>

          <form
            onSubmit={handleRolesSubmit}
            className="space-y-4 rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 shadow-sm"
          >
            <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold">Roles</h2>
            <p className="text-sm text-[color:var(--color-muted)]">Requires assign-roles permission. Changes are audit-logged.</p>
            {rolesError ? (
              <div role="alert" className="rounded-xl border border-[color:var(--color-danger)]/25 bg-[color:var(--color-danger-bg)] px-4 py-3 text-sm text-[color:var(--color-danger)]">
                {rolesError}
              </div>
            ) : null}
            <ul className="grid gap-2 sm:grid-cols-2">
              {roleOptions.map((role) => (
                <li key={role}>
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[color:var(--color-border)] px-3 py-2.5 text-sm hover:bg-[color:var(--color-muted-bg)]/50">
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role)}
                      onChange={() => toggleRole(role)}
                      className="size-4 rounded"
                    />
                    <span className="font-medium">{role.replace(/_/g, " ")}</span>
                  </label>
                </li>
              ))}
            </ul>
            <button
              type="submit"
              disabled={savingRoles}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[color:var(--color-accent)] px-5 text-sm font-bold text-[color:var(--color-foreground)] hover:bg-[color:var(--color-accent-hover)] disabled:opacity-60"
            >
              {savingRoles ? "Saving…" : "Save roles"}
            </button>
          </form>

          <dl className="rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 text-sm shadow-sm">
            <div className="flex justify-between gap-4 border-b border-[color:var(--color-border)] py-3">
              <dt className="text-[color:var(--color-muted)]">UUID</dt>
              <dd className="font-mono text-xs">{user.uuid}</dd>
            </div>
            <div className="flex justify-between gap-4 py-3">
              <dt className="text-[color:var(--color-muted)]">Last login</dt>
              <dd>{user.last_login_at ? new Date(user.last_login_at).toLocaleString() : "—"}</dd>
            </div>
          </dl>
        </div>
      ) : null}
    </main>
  );
}
