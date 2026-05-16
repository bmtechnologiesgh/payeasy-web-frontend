"use client";

import { OpsPagination } from "@/components/ops/OpsPagination";
import { PageHeader } from "@/components/PageHeader";
import { getAccessToken } from "@/lib/auth-token";
import { listAuditLogs, type AuditLogEntry } from "@/lib/ops-admin-api";
import { portalHref } from "@/lib/portal-path";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function severityClass(severity: string): string {
  if (severity === "critical" || severity === "error") return "text-[color:var(--color-danger)]";
  if (severity === "warning") return "text-[color:var(--color-warning)]";
  return "text-[color:var(--color-muted)]";
}

export default function AuditLogsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState({ count: 0, current_page: 1, last_page: 1, per_page: 25 });
  const page = Number(searchParams.get("page") ?? "1") || 1;

  const load = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const result = await listAuditLogs(token, {
        event_category: searchParams.get("event_category") ?? undefined,
        severity: searchParams.get("severity") ?? undefined,
        page,
        per_page: 25,
      });
      setLogs(result.audit_logs);
      setMeta(result.meta);
    } catch {
      setError("Could not load audit logs. You may need the view-audit-log permission.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams, page]);

  useEffect(() => {
    load();
  }, [load]);

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(portalHref("ops", `/audit-logs${params.toString() ? `?${params}` : ""}`));
  }

  function goToPage(next: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(next));
    router.push(portalHref("ops", `/audit-logs?${params}`));
  }

  return (
    <main className="px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Operations"
        title="Audit log"
        subtitle="Read-only trail of authentication, CRUD, and system events for compliance review."
      />

      <div className="mt-8 flex flex-wrap gap-3">
        <select
          value={searchParams.get("event_category") ?? ""}
          onChange={(e) => setFilter("event_category", e.target.value)}
          className="rounded-xl border border-[color:var(--color-input-border)] bg-white px-4 py-2.5 text-sm outline-none focus:ring-2"
          aria-label="Event category"
        >
          <option value="">All categories</option>
          <option value="auth">Auth</option>
          <option value="crud">CRUD</option>
          <option value="system">System</option>
          <option value="security">Security</option>
          <option value="financial">Financial</option>
        </select>
        <select
          value={searchParams.get("severity") ?? ""}
          onChange={(e) => setFilter("severity", e.target.value)}
          className="rounded-xl border border-[color:var(--color-input-border)] bg-white px-4 py-2.5 text-sm outline-none focus:ring-2"
          aria-label="Severity"
        >
          <option value="">All severities</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {error ? (
        <div role="alert" className="mt-6 rounded-xl border border-[color:var(--color-danger)]/25 bg-[color:var(--color-danger-bg)] px-4 py-3 text-sm text-[color:var(--color-danger)]">
          {error}
        </div>
      ) : null}

      <div className="mt-8 overflow-hidden rounded-2xl border border-[color:var(--color-border-strong)] bg-white shadow-sm">
        {loading ? (
          <p className="px-5 py-8 text-sm text-[color:var(--color-muted)]">Loading audit log…</p>
        ) : logs.length === 0 ? (
          <p className="px-5 py-8 text-sm text-[color:var(--color-muted)]">No entries match your filters.</p>
        ) : (
          <ul className="divide-y divide-[color:var(--color-border)]">
            {logs.map((log) => {
              const open = expandedId === log.id;
              return (
                <li key={log.id}>
                  <button
                    type="button"
                    onClick={() => setExpandedId(open ? null : log.id)}
                    className="flex w-full flex-col gap-1 px-5 py-4 text-left transition hover:bg-[color:var(--color-muted-bg)]/60 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[color:var(--color-foreground)]">{log.description}</p>
                      <p className="mt-0.5 text-xs text-[color:var(--color-muted)]">
                        {log.action} · {log.user.email ?? log.user.name ?? "System"} · {formatWhen(log.created_at)}
                      </p>
                    </div>
                    <span className={`shrink-0 text-xs font-semibold uppercase ${severityClass(log.severity)}`}>
                      {log.severity}
                    </span>
                  </button>
                  {open ? (
                    <div className="border-t border-[color:var(--color-border)] bg-[color:var(--color-muted-bg)]/30 px-5 py-4 text-xs">
                      <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-[color:var(--color-foreground)]">
                        {JSON.stringify(
                          {
                            event_type: log.event_type,
                            event_category: log.event_category,
                            request: log.request,
                            old_values: log.old_values,
                            new_values: log.new_values,
                            metadata: log.metadata,
                            is_suspicious: log.is_suspicious,
                          },
                          null,
                          2,
                        )}
                      </pre>
                    </div>
                  ) : null}
                </li>
              );
            })}
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
