"use client";

import { PageHeader } from "@/components/PageHeader";
import { getAccessToken } from "@/lib/auth-token";
import {
  createEmployer,
  importRosterEntries,
  type AdminEmployer,
  type RosterEntryInput,
} from "@/lib/ops-admin-api";
import { FormEvent, useState } from "react";

const EMPTY_ROSTER_ROW: RosterEntryInput = {
  ghana_card_number: "",
  work_email: "",
  staff_id: "",
  first_name: "",
  last_name: "",
};

export default function EmployersPage() {
  const [employerName, setEmployerName] = useState("");
  const [employerSlug, setEmployerSlug] = useState("");
  const [createdEmployer, setCreatedEmployer] = useState<AdminEmployer | null>(null);
  const [employerError, setEmployerError] = useState<string | null>(null);
  const [employerSaving, setEmployerSaving] = useState(false);

  const [employerUuid, setEmployerUuid] = useState("");
  const [rosterRows, setRosterRows] = useState<RosterEntryInput[]>([{ ...EMPTY_ROSTER_ROW }]);
  const [rosterError, setRosterError] = useState<string | null>(null);
  const [rosterSuccess, setRosterSuccess] = useState<string | null>(null);
  const [rosterSaving, setRosterSaving] = useState(false);

  async function handleCreateEmployer(event: FormEvent) {
    event.preventDefault();
    const token = getAccessToken();
    if (!token) return;

    setEmployerSaving(true);
    setEmployerError(null);

    try {
      const employer = await createEmployer(token, {
        name: employerName.trim(),
        slug: employerSlug.trim() || null,
      });
      setCreatedEmployer(employer);
      setEmployerUuid(employer.uuid);
      setEmployerName("");
      setEmployerSlug("");
    } catch (e) {
      setEmployerError(e instanceof Error ? e.message : "Could not create employer.");
    } finally {
      setEmployerSaving(false);
    }
  }

  async function handleImportRoster(event: FormEvent) {
    event.preventDefault();
    const token = getAccessToken();
    if (!token || !employerUuid.trim()) return;

    const entries = rosterRows
      .map((row) => ({
        ghana_card_number: row.ghana_card_number.trim(),
        work_email: row.work_email.trim(),
        staff_id: row.staff_id?.trim() || null,
        first_name: row.first_name?.trim() || null,
        last_name: row.last_name?.trim() || null,
      }))
      .filter((row) => row.ghana_card_number && row.work_email);

    if (entries.length === 0) {
      setRosterError("Add at least one row with Ghana card number and work email.");
      return;
    }

    setRosterSaving(true);
    setRosterError(null);
    setRosterSuccess(null);

    try {
      const result = await importRosterEntries(token, employerUuid.trim(), entries);
      setRosterSuccess(`Imported ${result.imported_count} roster row(s).`);
      setRosterRows([{ ...EMPTY_ROSTER_ROW }]);
    } catch (e) {
      setRosterError(e instanceof Error ? e.message : "Could not import roster.");
    } finally {
      setRosterSaving(false);
    }
  }

  function updateRow(index: number, field: keyof RosterEntryInput, value: string) {
    setRosterRows((rows) => rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  function addRow() {
    setRosterRows((rows) => [...rows, { ...EMPTY_ROSTER_ROW }]);
  }

  function removeRow(index: number) {
    setRosterRows((rows) => (rows.length <= 1 ? rows : rows.filter((_, i) => i !== index)));
  }

  return (
    <main className="px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Operations"
        title="Employers & roster"
        subtitle="Onboard employers and import employee roster rows for payroll-linked eligibility."
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <form
          onSubmit={handleCreateEmployer}
          className="space-y-4 rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 shadow-sm"
        >
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold">Create employer</h2>
          <p className="text-sm text-[color:var(--color-muted)]">Requires manage-employers permission.</p>
          {employerError ? (
            <div role="alert" className="rounded-xl border border-[color:var(--color-danger)]/25 bg-[color:var(--color-danger-bg)] px-4 py-3 text-sm text-[color:var(--color-danger)]">
              {employerError}
            </div>
          ) : null}
          {createdEmployer ? (
            <div role="status" className="rounded-xl border border-[color:var(--color-success)]/25 bg-[color:var(--color-success-bg)] px-4 py-3 text-sm text-[color:var(--color-success)]">
              Created <strong>{createdEmployer.name}</strong> — UUID{" "}
              <code className="text-xs">{createdEmployer.uuid}</code>
            </div>
          ) : null}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">Name</label>
            <input
              required
              value={employerName}
              onChange={(e) => setEmployerName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[color:var(--color-input-border)] px-4 py-3 text-sm outline-none focus:ring-2"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">Slug (optional)</label>
            <input
              value={employerSlug}
              onChange={(e) => setEmployerSlug(e.target.value)}
              placeholder="acme-corp"
              className="mt-2 w-full rounded-xl border border-[color:var(--color-input-border)] px-4 py-3 text-sm outline-none focus:ring-2"
            />
          </div>
          <button
            type="submit"
            disabled={employerSaving}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[color:var(--color-primary)] px-5 text-sm font-semibold text-white hover:bg-[color:var(--color-primary-hover)] disabled:opacity-60"
          >
            {employerSaving ? "Creating…" : "Create employer"}
          </button>
        </form>

        <form
          onSubmit={handleImportRoster}
          className="space-y-4 rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 shadow-sm"
        >
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold">Import roster</h2>
          <p className="text-sm text-[color:var(--color-muted)]">
            Upserts rows by Ghana card number per employer. Max 500 rows per request.
          </p>
          {rosterError ? (
            <div role="alert" className="rounded-xl border border-[color:var(--color-danger)]/25 bg-[color:var(--color-danger-bg)] px-4 py-3 text-sm text-[color:var(--color-danger)]">
              {rosterError}
            </div>
          ) : null}
          {rosterSuccess ? (
            <div role="status" className="rounded-xl border border-[color:var(--color-success)]/25 bg-[color:var(--color-success-bg)] px-4 py-3 text-sm text-[color:var(--color-success)]">
              {rosterSuccess}
            </div>
          ) : null}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">Employer UUID</label>
            <input
              required
              value={employerUuid}
              onChange={(e) => setEmployerUuid(e.target.value)}
              placeholder="Paste UUID from create step"
              className="mt-2 w-full rounded-xl border border-[color:var(--color-input-border)] px-4 py-3 font-mono text-xs outline-none focus:ring-2"
            />
          </div>
          <div className="space-y-3">
            {rosterRows.map((row, index) => (
              <div
                key={index}
                className="space-y-2 rounded-xl border border-[color:var(--color-border)] p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[color:var(--color-muted)]">Row {index + 1}</span>
                  {rosterRows.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="text-xs font-semibold text-[color:var(--color-danger)]"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
                <input
                  required
                  placeholder="Ghana card number"
                  value={row.ghana_card_number}
                  onChange={(e) => updateRow(index, "ghana_card_number", e.target.value)}
                  className="w-full rounded-lg border border-[color:var(--color-input-border)] px-3 py-2 text-sm outline-none focus:ring-2"
                />
                <input
                  required
                  type="email"
                  placeholder="Work email"
                  value={row.work_email}
                  onChange={(e) => updateRow(index, "work_email", e.target.value)}
                  className="w-full rounded-lg border border-[color:var(--color-input-border)] px-3 py-2 text-sm outline-none focus:ring-2"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    placeholder="Staff ID"
                    value={row.staff_id ?? ""}
                    onChange={(e) => updateRow(index, "staff_id", e.target.value)}
                    className="rounded-lg border border-[color:var(--color-input-border)] px-3 py-2 text-sm outline-none focus:ring-2"
                  />
                  <input
                    placeholder="First name"
                    value={row.first_name ?? ""}
                    onChange={(e) => updateRow(index, "first_name", e.target.value)}
                    className="rounded-lg border border-[color:var(--color-input-border)] px-3 py-2 text-sm outline-none focus:ring-2"
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addRow}
            className="text-sm font-semibold text-[color:var(--color-primary)] hover:underline"
          >
            + Add row
          </button>
          <button
            type="submit"
            disabled={rosterSaving}
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-[color:var(--color-accent)] px-5 text-sm font-bold text-[color:var(--color-foreground)] hover:bg-[color:var(--color-accent-hover)] disabled:opacity-60"
          >
            {rosterSaving ? "Importing…" : "Import roster"}
          </button>
        </form>
      </div>
    </main>
  );
}
