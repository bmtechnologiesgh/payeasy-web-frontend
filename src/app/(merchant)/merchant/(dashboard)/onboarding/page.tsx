import { portalHref } from "@/lib/portal-path";
import { redirect } from "next/navigation";

/** @deprecated Use `/profile` — kept so old links continue to work. */
export default function MerchantOnboardingRedirectPage() {
  redirect(portalHref("merchant", "/profile"));
}
