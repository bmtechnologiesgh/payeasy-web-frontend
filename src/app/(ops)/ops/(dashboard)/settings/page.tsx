"use client";

import { PageHeader } from "@/components/PageHeader";
import { getAccessToken } from "@/lib/auth-token";
import { listSettings, updateSetting, type SystemSetting } from "@/lib/ops-admin-api";
import { useCallback, useEffect, useMemo, useState } from "react";

function SettingField({
  setting,
  onSave,
}: {
  setting: SystemSetting;
  onSave: (key: string, value: string | number | boolean | null) => Promise<void>;
}) {
  const [draft, setDraft] = useState<string>(() => String(setting.value ?? ""));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setDraft(String(setting.value ?? ""));
  }, [setting.value, setting.key]);

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      let parsed: string | number | boolean | null = draft;
      if (setting.type === "boolean") {
        parsed = draft === "true";
      } else if (setting.type === "integer") {
        parsed = Number.parseInt(draft, 10);
      } else if (setting.type === "float") {
        parsed = Number.parseFloat(draft);
      } else if (draft === "") {
        parsed = null;
      }
      await onSave(setting.key, parsed);
      setMessage("Saved");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (setting.is_encrypted) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--color-border)] py-4 last:border-0">
        <div>
          <p className="font-semibold text-[color:var(--color-foreground)]">{setting.name}</p>
          <p className="text-xs text-[color:var(--color-muted)]">{setting.key}</p>
        </div>
        <span className="text-xs font-medium text-[color:var(--color-muted)]">
          {setting.has_value ? "Value set (encrypted)" : "Not set"}
        </span>
      </div>
    );
  }

  return (
    <div className="border-b border-[color:var(--color-border)] py-4 last:border-0">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[color:var(--color-foreground)]">{setting.name}</p>
          {setting.description ? (
            <p className="mt-0.5 text-xs text-[color:var(--color-muted)]">{setting.description}</p>
          ) : null}
          <p className="mt-1 font-mono text-[10px] text-[color:var(--color-muted)]">{setting.key}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {setting.type === "boolean" ? (
          <select
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="rounded-xl border border-[color:var(--color-input-border)] bg-white px-3 py-2 text-sm outline-none focus:ring-2"
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        ) : setting.options && setting.options.length > 0 ? (
          <select
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="min-w-[12rem] flex-1 rounded-xl border border-[color:var(--color-input-border)] bg-white px-3 py-2 text-sm outline-none focus:ring-2"
          >
            {setting.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={setting.type === "integer" || setting.type === "float" ? "number" : "text"}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="min-w-[12rem] flex-1 rounded-xl border border-[color:var(--color-input-border)] bg-white px-3 py-2 text-sm outline-none focus:ring-2"
          />
        )}
        <button
          type="button"
          disabled={saving}
          onClick={save}
          className="inline-flex min-h-[40px] items-center justify-center rounded-full bg-[color:var(--color-primary)] px-4 text-sm font-semibold text-white hover:bg-[color:var(--color-primary-hover)] disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {message ? (
          <span className={`text-xs font-medium ${message === "Saved" ? "text-[color:var(--color-success)]" : "text-[color:var(--color-danger)]"}`}>
            {message}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const rows = await listSettings(token);
      setSettings(rows);
    } catch {
      setError("Could not load settings. You may need the manage-platform-settings permission.");
      setSettings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const grouped = useMemo(() => {
    const map = new Map<string, SystemSetting[]>();
    for (const s of settings) {
      const key = s.category_label || s.category;
      const list = map.get(key) ?? [];
      list.push(s);
      map.set(key, list);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [settings]);

  async function handleSave(key: string, value: string | number | boolean | null) {
    const token = getAccessToken();
    if (!token) throw new Error("Not signed in");
    const updated = await updateSetting(token, key, value);
    setSettings((prev) => prev.map((s) => (s.key === key ? updated : s)));
  }

  return (
    <main className="px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Operations"
        title="Platform settings"
        subtitle="Configure rate limits, notifications, and other system behaviour. Changes are audit-logged."
      />

      {error ? (
        <div role="alert" className="mt-6 rounded-xl border border-[color:var(--color-danger)]/25 bg-[color:var(--color-danger-bg)] px-4 py-3 text-sm text-[color:var(--color-danger)]">
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="mt-8 text-sm text-[color:var(--color-muted)]">Loading settings…</p>
      ) : (
        <div className="mt-8 space-y-8">
          {grouped.map(([category, items]) => (
            <section
              key={category}
              className="rounded-2xl border border-[color:var(--color-border-strong)] bg-white p-6 shadow-sm"
            >
              <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[color:var(--color-foreground)]">
                {category}
              </h2>
              <div className="mt-2">
                {items.map((setting) => (
                  <SettingField key={setting.key} setting={setting} onSave={handleSave} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
