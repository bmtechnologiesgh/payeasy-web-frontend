import {
  firstValidationError,
  getApiBaseUrl,
  getPayeasyJson,
  patchPayeasyJson,
  type ApiEnvelope,
} from "@/lib/payeasy-api";

const API_BASE_URL = getApiBaseUrl();

export type OpsUser = {
  uuid: string;
  full_name: string;
  email: string | null;
  roles: string[];
};

export type LoginResponse = {
  token: string;
  token_type: string;
  user: OpsUser;
};

export type MerchantOwner = {
  uuid: string;
  full_name: string;
  email: string | null;
  role: string | null;
};

export type AdminMerchant = {
  uuid: string;
  legal_name: string | null;
  trading_name: string | null;
  slug: string | null;
  registration_number: string | null;
  tin: string | null;
  country: string | null;
  ship_from_line1: string | null;
  ship_from_line2: string | null;
  ship_from_city: string | null;
  ship_from_region: string | null;
  ship_from_postal_code: string | null;
  payout_account_holder_name: string | null;
  payout_bank_name: string | null;
  payout_account_number: string | null;
  payout_bank_branch_code: string | null;
  payout_mobile_money_number: string | null;
  website_url: string | null;
  support_email: string | null;
  support_phone: string | null;
  returns_policy_url: string | null;
  about: string | null;
  status: string;
  owners?: MerchantOwner[];
  created_at?: string | null;
  updated_at?: string | null;
};

export type MerchantListMeta = {
  count: number;
  current_page: number;
  last_page: number;
  per_page: number;
};

export async function login(payload: {
  email?: string;
  identifier?: string;
  password: string;
  device_name?: string;
}): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }

  const json = await res.json();
  return json.data as LoginResponse;
}

export async function me(token: string): Promise<OpsUser> {
  const res = await fetch(`${API_BASE_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to load session");
  }

  const json = await res.json();
  return json.data.user as OpsUser;
}

export async function listMerchants(
  token: string,
  params?: { search?: string; status?: string; page?: number; per_page?: number },
): Promise<{ merchants: AdminMerchant[]; meta: MerchantListMeta }> {
  const query = new URLSearchParams();
  if (params?.search) {
    query.set("search", params.search);
  }
  if (params?.status) {
    query.set("status", params.status);
  }
  if (params?.page) {
    query.set("page", String(params.page));
  }
  if (params?.per_page) {
    query.set("per_page", String(params.per_page));
  }

  const path = `/admin/merchants${query.toString() ? `?${query}` : ""}`;
  const result = await getPayeasyJson<{ merchants: AdminMerchant[] }>(path, token);

  if (!result.ok || !result.json.success || !result.json.data?.merchants) {
    throw new Error(result.ok ? result.json.message || "Could not load merchants" : result.text);
  }

  const meta = result.json.meta as MerchantListMeta | undefined;

  return {
    merchants: result.json.data.merchants,
    meta: {
      count: meta?.count ?? result.json.data.merchants.length,
      current_page: meta?.current_page ?? 1,
      last_page: meta?.last_page ?? 1,
      per_page: meta?.per_page ?? result.json.data.merchants.length,
    },
  };
}

export async function getMerchant(token: string, uuid: string): Promise<AdminMerchant> {
  const result = await getPayeasyJson<{ merchant: AdminMerchant }>(`/admin/merchants/${uuid}`, token);

  if (!result.ok || !result.json.success || !result.json.data?.merchant) {
    throw new Error(result.ok ? result.json.message || "Could not load merchant" : result.text);
  }

  return result.json.data.merchant;
}

export async function updateMerchantStatus(
  token: string,
  uuid: string,
  payload: { status: "approved" | "rejected" | "suspended"; notes?: string },
): Promise<AdminMerchant> {
  const result = await patchPayeasyJson<
    { status: string; notes?: string },
    { merchant: AdminMerchant }
  >(`/admin/merchants/${uuid}/status`, payload, token);

  if (!result.ok) {
    throw new Error(result.text || "Could not update merchant status");
  }

  const { json, status } = result;

  if (json.success && json.data?.merchant) {
    return json.data.merchant;
  }

  const msg =
    firstValidationError(json as ApiEnvelope<unknown>) || json.message || "Could not update merchant status";
  throw new Error(status === 422 ? msg : json.message || "Could not update merchant status");
}
