"use client";

import { clearAccessToken, getAccessToken } from "@/lib/auth-token";
import { me, type LoginResponse } from "@/lib/merchant-api";
import { portalHref } from "@/lib/portal-path";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

export type MerchantDashboardUser = LoginResponse["user"];

type MerchantDashboardContextValue = {
  user: MerchantDashboardUser | null;
  setUser: Dispatch<SetStateAction<MerchantDashboardUser | null>>;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const MerchantDashboardContext = createContext<MerchantDashboardContextValue | null>(null);

export function useMerchantDashboard(): MerchantDashboardContextValue {
  const ctx = useContext(MerchantDashboardContext);
  if (!ctx) {
    throw new Error("useMerchantDashboard must be used within the merchant dashboard layout.");
  }
  return ctx;
}

export function MerchantDashboardProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<MerchantDashboardUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      return;
    }
    const u = await me(token);
    setUser(u);
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace(portalHref("merchant", "/login"));
      setLoading(false);
      return;
    }

    me(token)
      .then((u) => {
        setUser(u);
        setError(null);
      })
      .catch(() => {
        setError("Unable to load your session. Please sign in again.");
        clearAccessToken();
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      setUser,
      loading,
      error,
      refresh,
    }),
    [user, loading, error, refresh],
  );

  return <MerchantDashboardContext.Provider value={value}>{children}</MerchantDashboardContext.Provider>;
}
