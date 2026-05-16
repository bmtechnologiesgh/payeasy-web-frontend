import type { ReactNode } from "react";
import { PayEasyBusinessLogo } from "@/components/merchant/PayEasyBusinessLogo";
import { portalHref } from "@/lib/portal-path";

export default function MerchantAuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[color:var(--color-app)]">
      <div className="px-4 pt-6 sm:px-6">
        <PayEasyBusinessLogo href={portalHref("merchant", "/login")} />
      </div>
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
