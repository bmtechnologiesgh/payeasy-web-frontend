import { MerchantDashboardShell } from "@/components/merchant/MerchantDashboardShell";
import type { ReactNode } from "react";

export default function MerchantDashboardLayout({ children }: { children: ReactNode }) {
  return <MerchantDashboardShell>{children}</MerchantDashboardShell>;
}
