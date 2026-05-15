"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { clearAccessToken, getAccessToken, subscribeAuthChanged } from "@/lib/auth-token";
import { getPayeasyJson } from "@/lib/payeasy-api";

type MePayload = {
  user: {
    first_name?: string | null;
    last_name?: string | null;
    full_name?: string | null;
    email_verified_at?: string | null;
    phone_verified_at?: string | null;
  };
};

function displayFirstName(user: MePayload["user"]): string {
  const raw = user.first_name?.trim();
  if (raw) return raw;
  const full = user.full_name?.trim();
  if (full) return full.split(/\s+/)[0] ?? "there";
  return "there";
}

function isVerified(user: MePayload["user"]): boolean {
  return Boolean(user.email_verified_at || user.phone_verified_at);
}

export type EmployeeSessionValue = {
  token: string | null;
  greeting: string | null;
  verified: boolean;
  signedIn: boolean;
};

const EmployeeSessionContext = createContext<EmployeeSessionValue | null>(null);

export function EmployeeSessionProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [greeting, setGreeting] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  const loadUser = useCallback(async () => {
    const t = getAccessToken();
    setToken(t);
    if (!t) {
      setGreeting(null);
      setVerified(false);
      return;
    }
    const res = await getPayeasyJson<MePayload>("/me", t);
    if (res.ok && res.status === 401) {
      clearAccessToken();
      setToken(null);
      setGreeting(null);
      setVerified(false);
      return;
    }
    if (!res.ok || !res.json.success || !res.json.data?.user) {
      setGreeting(null);
      setVerified(false);
      return;
    }
    const u = res.json.data.user;
    setGreeting(displayFirstName(u));
    setVerified(isVerified(u));
  }, []);

  useEffect(() => {
    void loadUser();
    return subscribeAuthChanged(() => {
      void loadUser();
    });
  }, [loadUser]);

  const value = useMemo<EmployeeSessionValue>(
    () => ({
      token,
      greeting,
      verified,
      signedIn: Boolean(token && greeting),
    }),
    [token, greeting, verified],
  );

  return (
    <EmployeeSessionContext.Provider value={value}>{children}</EmployeeSessionContext.Provider>
  );
}

export function useEmployeeSession(): EmployeeSessionValue {
  const ctx = useContext(EmployeeSessionContext);
  if (!ctx) {
    throw new Error("useEmployeeSession must be used within EmployeeSessionProvider");
  }
  return ctx;
}
