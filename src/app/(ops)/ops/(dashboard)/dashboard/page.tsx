"use client";

import { PortalHeader } from "@/components/PortalHeader";
import { PageHeader } from "@/components/PageHeader";
import { clearAccessToken, getAccessToken } from "@/lib/auth-token";
import { me } from "@/lib/ops-api";
import { portalHref } from "@/lib/portal-path";
import { userMayAccessOpsPortal } from "@/lib/portal-access";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type DashboardUser = Awaited<ReturnType<typeof me>>;

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace(portalHref("ops", "/login"));
      return;
    }

    me(token)
      .then((u) => {
        if (!userMayAccessOpsPortal(u.roles)) {
          setError("This session is not authorized for the operations portal.");
          clearAccessToken();
          return;
        }
        setUser(u);
      })
      .catch(() => {
        setError("Unable to load your session. Please sign in again.");
        clearAccessToken();
      });
  }, [router]);

  return (
    <div className="min-h-screen bg-[color:var(--color-app)]">
      <PortalHeader portal="ops" contextLabel={user?.email} />

      <main className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6">
        {!user && !error ? (
          <p className="text-sm text-[color:var(--color-muted)]">Loading…</p>
        ) : null}

        {error ? (
          <div className="mx-auto max-w-lg space-y-4">
            <div
              role="alert"
              className="rounded-xl border border-[color:var(--color-danger)]/25 bg-[color:var(--color-danger-bg)] px-4 py-3 text-sm text-[color:var(--color-danger)]"
            >
              {error}
            </div>
            <button
              type="button"
              onClick={() => router.push(portalHref("ops", "/login"))}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[color:var(--color-primary)] px-5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)]"
            >
              Go to sign in
            </button>
          </div>
        ) : null}

        {user ? (
          <div className="space-y-10">
            <PageHeader
              eyebrow="Operations"
              title="Platform dashboard"
              subtitle={`Signed in as ${user.full_name}${user.email ? ` (${user.email})` : ""}. Admin API routes live under /api/admin — wire screens here as features ship.`}
            />

            <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <article className="space-y-4 rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 shadow-sm">
                <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[color:var(--color-foreground)]">
                  Administration
                </h2>
                <p className="text-sm text-[color:var(--color-muted)]">
                  Users, employers, roster imports, audit logs, and settings are exposed from the Laravel API for
                  authorized roles. Use your token against <code className="rounded bg-[color:var(--color-muted-bg)] px-1 text-xs">/api/admin/*</code>{" "}
                  endpoints; the UI will grow to call these with permission-aware navigation.
                </p>
              </article>

              <article className="rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 shadow-sm">
                <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[color:var(--color-foreground)]">
                  Access
                </h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-4 border-b border-[color:var(--color-border)] pb-3">
                    <dt className="text-[color:var(--color-muted)]">Roles</dt>
                    <dd className="text-right font-semibold text-[color:var(--color-foreground)]">
                      {user.roles.join(", ") || "none"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[color:var(--color-muted)]">User ID</dt>
                    <dd className="truncate text-right font-mono text-xs text-[color:var(--color-foreground)]">
                      {user.uuid}
                    </dd>
                  </div>
                </dl>
              </article>
            </section>

            <section>
              <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[color:var(--color-foreground)] md:text-2xl">
                Quick links
              </h2>
              <ul className="mt-4 divide-y divide-[color:var(--color-border)] rounded-2xl border border-[color:var(--color-border-strong)] bg-white shadow-sm">
                <li>
                  <span className="block px-5 py-4 text-sm font-semibold text-[color:var(--color-muted)]">
                    Users &amp; roles
                    <span className="mt-0.5 block text-xs font-normal">
                      Coming soon — <code className="text-[11px]">GET /api/admin/users</code>, role assignment
                    </span>
                  </span>
                </li>
                <li>
                  <span className="block px-5 py-4 text-sm font-semibold text-[color:var(--color-muted)]">
                    Employers &amp; roster
                    <span className="mt-0.5 block text-xs font-normal">
                      Coming soon — <code className="text-[11px]">POST /api/admin/employers</code>
                    </span>
                  </span>
                </li>
                <li>
                  <span className="block px-5 py-4 text-sm font-semibold text-[color:var(--color-muted)]">
                    Audit log
                    <span className="mt-0.5 block text-xs font-normal">
                      Coming soon — <code className="text-[11px]">GET /api/admin/audit-logs</code>
                    </span>
                  </span>
                </li>
              </ul>
            </section>
          </div>
        ) : null}
      </main>
    </div>
  );
}
