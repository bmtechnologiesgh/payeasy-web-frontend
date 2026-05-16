import {
  firstValidationError,
  getPayeasyJson,
  paginatedMetaFromEnvelope,
  patchPayeasyJson,
  postPayeasyJsonAuth,
  putPayeasyJson,
  type ApiEnvelope,
  type PaginatedMeta,
} from "@/lib/payeasy-api";

export type { PaginatedMeta };

function assertSuccess<T>(result: { ok: boolean; json?: ApiEnvelope<T>; text?: string }, fallback: string): ApiEnvelope<T> {
  if (!result.ok || !result.json) {
    throw new Error(result.text || fallback);
  }
  if (!result.json.success) {
    throw new Error(result.json.message || fallback);
  }
  return result.json;
}

function validationError(json: ApiEnvelope<unknown>, fallback: string, status: number): never {
  const msg = firstValidationError(json) || json.message || fallback;
  throw new Error(status === 422 ? msg : json.message || fallback);
}

// ——— Users ———

export type AdminUser = {
  uuid: string;
  first_name: string;
  last_name: string;
  other_name: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  status: string;
  status_label: string;
  is_active: boolean;
  roles: string[];
  last_login_at: string | null;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function listUsers(
  token: string,
  params?: { search?: string; status?: string; role?: string; page?: number; per_page?: number },
): Promise<{ users: AdminUser[]; meta: PaginatedMeta }> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.status) query.set("status", params.status);
  if (params?.role) query.set("role", params.role);
  if (params?.page) query.set("page", String(params.page));
  if (params?.per_page) query.set("per_page", String(params.per_page ?? 20));

  const result = await getPayeasyJson<{ users: AdminUser[] }>(
    `/admin/users${query.toString() ? `?${query}` : ""}`,
    token,
  );
  const json = assertSuccess(result, "Could not load users");
  const users = json.data?.users ?? [];
  return { users, meta: paginatedMetaFromEnvelope(json, users.length) };
}

export async function getUser(token: string, uuid: string): Promise<AdminUser> {
  const result = await getPayeasyJson<{ user: AdminUser }>(`/admin/users/${uuid}`, token);
  const json = assertSuccess(result, "Could not load user");
  if (!json.data?.user) throw new Error("Could not load user");
  return json.data.user;
}

export async function updateUser(
  token: string,
  uuid: string,
  payload: Partial<{
    first_name: string;
    last_name: string;
    other_name: string | null;
    email: string;
    phone: string | null;
    status: string;
    is_active: boolean;
  }>,
): Promise<AdminUser> {
  const result = await patchPayeasyJson<typeof payload, { user: AdminUser }>(`/admin/users/${uuid}`, payload, token);
  if (!result.ok) throw new Error(result.text || "Could not update user");
  const { json, status } = result;
  if (json.success && json.data?.user) return json.data.user;
  validationError(json, "Could not update user", status);
}

// ——— Roles ———

export type AdminRole = {
  id: number;
  name: string;
  guard_name: string;
  permissions: string[];
};

export async function listRoles(token: string): Promise<AdminRole[]> {
  const result = await getPayeasyJson<{ roles: AdminRole[] }>("/admin/roles", token);
  const json = assertSuccess(result, "Could not load roles");
  return json.data?.roles ?? [];
}

export async function syncUserRoles(token: string, uuid: string, roles: string[]): Promise<AdminUser> {
  const result = await putPayeasyJson<{ roles: string[] }, { user: AdminUser }>(
    `/admin/users/${uuid}/roles`,
    { roles },
    token,
  );
  if (!result.ok) throw new Error(result.text || "Could not update roles");
  const { json, status } = result;
  if (json.success && json.data?.user) return json.data.user;
  validationError(json, "Could not update roles", status);
}

// ——— Audit logs ———

export type AuditLogEntry = {
  id: number;
  event_type: string;
  event_category: string;
  severity: string;
  action: string;
  description: string;
  user: {
    id: number | null;
    uuid: string | null;
    name: string | null;
    email: string | null;
    type: string | null;
  };
  auditable: { type: string | null; id: number | null };
  request: { ip_address: string | null; user_agent: string | null; url: string | null; method: string | null };
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  is_suspicious: boolean;
  created_at: string;
};

export async function listAuditLogs(
  token: string,
  params?: {
    event_category?: string;
    event_type?: string;
    severity?: string;
    user_uuid?: string;
    is_suspicious?: boolean;
    page?: number;
    per_page?: number;
  },
): Promise<{ audit_logs: AuditLogEntry[]; meta: PaginatedMeta }> {
  const query = new URLSearchParams();
  if (params?.event_category) query.set("event_category", params.event_category);
  if (params?.event_type) query.set("event_type", params.event_type);
  if (params?.severity) query.set("severity", params.severity);
  if (params?.user_uuid) query.set("user_uuid", params.user_uuid);
  if (params?.is_suspicious !== undefined) query.set("is_suspicious", params.is_suspicious ? "1" : "0");
  if (params?.page) query.set("page", String(params.page));
  if (params?.per_page) query.set("per_page", String(params.per_page ?? 25));

  const result = await getPayeasyJson<{ audit_logs: AuditLogEntry[] }>(
    `/admin/audit-logs${query.toString() ? `?${query}` : ""}`,
    token,
  );
  const json = assertSuccess(result, "Could not load audit logs");
  const audit_logs = json.data?.audit_logs ?? [];
  return { audit_logs, meta: paginatedMetaFromEnvelope(json, audit_logs.length) };
}

export async function getAuditLog(token: string, id: number): Promise<AuditLogEntry> {
  const result = await getPayeasyJson<{ audit_log: AuditLogEntry }>(`/admin/audit-logs/${id}`, token);
  const json = assertSuccess(result, "Could not load audit log");
  if (!json.data?.audit_log) throw new Error("Could not load audit log");
  return json.data.audit_log;
}

// ——— Settings ———

export type SystemSetting = {
  key: string;
  name: string;
  description: string | null;
  category: string;
  category_label: string;
  type: string;
  type_label: string;
  value: string | number | boolean | null;
  has_value: boolean;
  options: string[] | null;
  is_public: boolean;
  is_encrypted: boolean;
  sort_order: number;
  updated_at: string | null;
};

export async function listSettings(token: string): Promise<SystemSetting[]> {
  const result = await getPayeasyJson<{ settings: SystemSetting[] }>("/admin/settings", token);
  const json = assertSuccess(result, "Could not load settings");
  return json.data?.settings ?? [];
}

export async function updateSetting(
  token: string,
  key: string,
  value: string | number | boolean | null,
): Promise<SystemSetting> {
  const result = await patchPayeasyJson<{ value: typeof value }, { setting: SystemSetting }>(
    `/admin/settings/${encodeURIComponent(key)}`,
    { value },
    token,
  );
  if (!result.ok) throw new Error(result.text || "Could not update setting");
  const { json, status } = result;
  if (json.success && json.data?.setting) return json.data.setting;
  validationError(json, "Could not update setting", status);
}

// ——— Employers ———

export type AdminEmployer = {
  uuid: string;
  name: string;
  slug: string | null;
  created_at: string;
  updated_at: string;
};

export async function createEmployer(
  token: string,
  payload: { name: string; slug?: string | null },
): Promise<AdminEmployer> {
  const result = await postPayeasyJsonAuth<typeof payload, { employer: AdminEmployer }>(
    "/admin/employers",
    token,
    payload,
  );
  if (!result.ok) throw new Error(result.text || "Could not create employer");
  const { json, status } = result;
  if (json.success && json.data?.employer) return json.data.employer;
  validationError(json, "Could not create employer", status);
}

export type RosterEntryInput = {
  ghana_card_number: string;
  work_email: string;
  staff_id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
};

export async function importRosterEntries(
  token: string,
  employerUuid: string,
  entries: RosterEntryInput[],
): Promise<{ imported_count: number; roster_entry_uuids: string[] }> {
  const result = await postPayeasyJsonAuth<
    { entries: RosterEntryInput[] },
    { imported_count: number; roster_entry_uuids: string[] }
  >(`/admin/employers/${employerUuid}/roster-entries`, token, { entries });

  if (!result.ok) throw new Error(result.text || "Could not import roster");
  const { json, status } = result;
  if (json.success && json.data) {
    return {
      imported_count: json.data.imported_count,
      roster_entry_uuids: json.data.roster_entry_uuids,
    };
  }
  validationError(json, "Could not import roster", status);
}
