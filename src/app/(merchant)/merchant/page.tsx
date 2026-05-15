import { redirect } from "next/navigation";
import { portalHref } from "@/lib/portal-path";

export default function MerchantHomePage() {
  redirect(portalHref("merchant", "/login"));
}
