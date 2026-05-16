"use client";

import { clearAccessToken, getAccessToken } from "@/lib/auth-token";
import { me, type OpsUser } from "@/lib/ops-api";
import { portalHref } from "@/lib/portal-path";
import { userMayAccessOpsPortal } from "@/lib/portal-access";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type OpsDashboardContextValue = {
  user: OpsUser | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const OpsDashboardContext = createContext<OpsDashboardContextValue | null>(null);

export function useOpsDashboard(): OpsDashboardContextValue {
  const ctx = useContext(OpsDashboardContext);
  if (!ctx) {
    throw new Error("useOpsDashboard must be used within the ops dashboard layout.");
  }
  return ctx;
}

export function OpsDashboardProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<OpsUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      return;
    }
    const u = await me(token);
    if (!userMayAccessOpsPortal(u.roles)) {
      throw new Error("Unauthorized");
    }
    setUser(u);
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace(portalHref("ops", "/login"));
      setLoading(false);
      return;
    }

    me(token)
      .then((u) => {
        if (!userMayAccessOpsPortal(u.roles)) {
          setError("This session is not authorized for the operations portal.");
          clearAccessToken();
          setUser(null);
          return;
        }
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
      loading,
      error,
      refresh,
    }),
    [user, loading, error, refresh],
  );

  return <OpsDashboardContext.Provider value={value}>{children}</OpsDashboardContext.Provider>;
}
