import { OpsDashboardShell } from "@/components/ops/OpsDashboardShell";
import type { ReactNode } from "react";

export default function OpsDashboardLayout({ children }: { children: ReactNode }) {
  return <OpsDashboardShell>{children}</OpsDashboardShell>;
}
