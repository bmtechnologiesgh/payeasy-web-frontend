"use client";

import { PortalHeader } from "@/components/PortalHeader";
import { PageHeader } from "@/components/PageHeader";
import { clearAccessToken, getAccessToken } from "@/lib/auth-token";
import { me } from "@/lib/employer-api";
import { portalHref } from "@/lib/portal-path";
import { userMayAccessEmployerPortal } from "@/lib/portal-access";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type DashboardUser = Awaited<ReturnType<typeof me>>;

function primaryEmployerName(user: DashboardUser): string | null {
  const first = user.employments?.find((e) => e.employer?.name);
  return first?.employer?.name ?? null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace(portalHref("employer", "/login"));
      return;
    }

    me(token)
      .then((u) => {
        if (!userMayAccessEmployerPortal(u.roles)) {
          setError("This session is not authorized for the employer portal.");
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

  const employerName = user ? primaryEmployerName(user) : null;

  return (
    <div className="min-h-screen bg-[color:var(--color-app)]">
      <PortalHeader portal="employer" contextLabel={employerName} />

      <main className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6">
        {!user && !error ? (
          <p className="text-sm text-[color:var(--color-muted)]">Loading dashboard…</p>
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
              onClick={() => router.push(portalHref("employer", "/login"))}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[color:var(--color-primary)] px-5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)]"
            >
              Go to sign in
            </button>
          </div>
        ) : null}

        {user ? (
          <div className="space-y-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <PageHeader
                eyebrow="Employer workspace"
                title={employerName ?? "Link your employment"}
                subtitle={`Signed in as ${user.full_name}${user.email ? ` (${user.email})` : ""}.`}
              />
            </div>

            <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <article className="space-y-4 rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 shadow-sm">
                <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[color:var(--color-foreground)]">
                  Roster &amp; payroll
                </h2>
                <p className="text-sm text-[color:var(--color-muted)]">
                  Complete employer onboarding and roster management will appear here. Your linked employers are shown
                  in the account panel when your administrator has associated your login.
                </p>
              </article>

              <article className="rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 shadow-sm">
                <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[color:var(--color-foreground)]">
                  Account
                </h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-4 border-b border-[color:var(--color-border)] pb-3">
                    <dt className="text-[color:var(--color-muted)]">Roles</dt>
                    <dd className="text-right font-semibold text-[color:var(--color-foreground)]">
                      {user.roles.join(", ") || "none"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-[color:var(--color-border)] pb-3">
                    <dt className="text-[color:var(--color-muted)]">Linked employments</dt>
                    <dd className="text-right font-semibold text-[color:var(--color-foreground)]">
                      {user.employments?.length ?? 0}
                    </dd>
                  </div>
                  {user.employments?.map((row) => (
                    <div
                      key={row.uuid}
                      className="flex justify-between gap-4 border-b border-[color:var(--color-border)] pb-3 last:border-0 last:pb-0"
                    >
                      <dt className="text-[color:var(--color-muted)]">Employer</dt>
                      <dd className="max-w-[55%] text-right font-mono text-xs text-[color:var(--color-foreground)]">
                        {row.employer?.name ?? "—"}
                        {row.employer?.uuid ? (
                          <span className="mt-1 block truncate text-[10px] text-[color:var(--color-muted)]">
                            {row.employer.uuid}
                          </span>
                        ) : null}
                      </dd>
                    </div>
                  ))}
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
                    Employee roster
                    <span className="mt-0.5 block text-xs font-normal">Coming soon — import and manage roster rows</span>
                  </span>
                </li>
                <li>
                  <span className="block px-5 py-4 text-sm font-semibold text-[color:var(--color-muted)]">
                    Deductions &amp; reports
                    <span className="mt-0.5 block text-xs font-normal">Coming soon — payroll deduction reporting</span>
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
