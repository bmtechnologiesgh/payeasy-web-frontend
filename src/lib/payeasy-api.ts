/**
 * Base URL for the PayEasy API (include `/api` path, e.g. `http://127.0.0.1:8000/api`).
 */
export function getPayeasyApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_PAYEASY_API_URL?.trim();
  if (raw) {
    return raw.replace(/\/$/, "");
  }
  return "http://127.0.0.1:8000/api";
}

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  meta?: { errorCode?: string | null };
};

export async function postPayeasyJson<TBody extends object, TData = unknown>(
  path: string,
  body: TBody,
): Promise<{ ok: true; status: number; json: ApiEnvelope<TData> } | { ok: false; status: number; text: string }> {
  const url = `${getPayeasyApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  try {
    const json = JSON.parse(text) as ApiEnvelope<TData>;
    return { ok: true, status: res.status, json };
  } catch {
    return { ok: false, status: res.status, text };
  }
}

export async function getPayeasyJson<TData = unknown>(
  path: string,
  token: string,
): Promise<{ ok: true; status: number; json: ApiEnvelope<TData> } | { ok: false; status: number; text: string }> {
  const url = `${getPayeasyApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const text = await res.text();
  try {
    const json = JSON.parse(text) as ApiEnvelope<TData>;
    return { ok: true, status: res.status, json };
  } catch {
    return { ok: false, status: res.status, text };
  }
}

export async function postPayeasyJsonAuth<TBody extends object | undefined, TData = unknown>(
  path: string,
  token: string,
  body?: TBody,
): Promise<{ ok: true; status: number; json: ApiEnvelope<TData> } | { ok: false; status: number; text: string }> {
  const url = `${getPayeasyApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await res.text();
  try {
    const json = JSON.parse(text) as ApiEnvelope<TData>;
    return { ok: true, status: res.status, json };
  } catch {
    return { ok: false, status: res.status, text };
  }
}
