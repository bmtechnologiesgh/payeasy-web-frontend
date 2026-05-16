import {
  getApiBaseUrl,
  patchPayeasyJson,
  postPayeasyJsonAuth,
  type ApiEnvelope,
  firstValidationError,
} from "@/lib/payeasy-api";

const API_BASE_URL = getApiBaseUrl();

export type MerchantProfile = {
  uuid: string;
  merchant_code: string;
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
};

export type LoginResponse = {
  token: string;
  token_type: string;
  user: {
    uuid: string;
    full_name: string;
    email: string | null;
    roles: string[];
    merchant: MerchantProfile | null;
  };
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

export async function me(token: string): Promise<LoginResponse["user"]> {
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
  return json.data.user as LoginResponse["user"];
}

export type MerchantProfilePatch = {
  legal_name?: string | null;
  trading_name?: string | null;
  registration_number?: string | null;
  tin?: string | null;
  country?: string | null;
  ship_from_line1?: string | null;
  ship_from_line2?: string | null;
  ship_from_city?: string | null;
  ship_from_region?: string | null;
  ship_from_postal_code?: string | null;
  payout_account_holder_name?: string | null;
  payout_bank_name?: string | null;
  payout_account_number?: string | null;
  payout_bank_branch_code?: string | null;
  payout_mobile_money_number?: string | null;
  website_url?: string | null;
  support_email?: string | null;
  support_phone?: string | null;
  returns_policy_url?: string | null;
  about?: string | null;
};

export async function updateMerchantProfile(
  token: string,
  payload: MerchantProfilePatch,
): Promise<{ merchant: MerchantProfile }> {
  const result = await patchPayeasyJson<MerchantProfilePatch, { merchant: MerchantProfile }>(
    "/me/merchant",
    payload,
    token,
  );

  if (!result.ok) {
    throw new Error(result.text || "Could not save shop profile");
  }

  const { json, status } = result;

  if (json.success && json.data?.merchant) {
    return { merchant: json.data.merchant };
  }

  const msg = firstValidationError(json as ApiEnvelope<unknown>) || json.message || "Could not save shop profile";
  throw new Error(status === 422 ? msg : json.message || "Could not save shop profile");
}

export async function submitMerchantApplication(token: string): Promise<{ merchant: MerchantProfile }> {
  const result = await postPayeasyJsonAuth<Record<string, never>, { merchant: MerchantProfile }>(
    "/me/merchant/submit",
    token,
    {},
  );

  if (!result.ok) {
    throw new Error(result.text || "Could not submit application");
  }

  const { json, status } = result;

  if (json.success && json.data?.merchant) {
    return { merchant: json.data.merchant };
  }

  const msg = firstValidationError(json as ApiEnvelope<unknown>) || json.message || "Could not submit application";
  throw new Error(status === 422 ? msg : json.message || "Could not submit application");
}
