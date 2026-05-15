import { getApiBaseUrl } from "@/lib/payeasy-api";

const API_BASE_URL = getApiBaseUrl();

export type EmploymentDto = {
  uuid: string;
  employer?: {
    uuid: string;
    name: string;
  };
  roster_entry_uuid?: string;
  work_email_verified_at?: string | null;
};

export type LoginResponse = {
  token: string;
  token_type: string;
  user: {
    uuid: string;
    full_name: string;
    email: string | null;
    roles: string[];
    employments?: EmploymentDto[];
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
