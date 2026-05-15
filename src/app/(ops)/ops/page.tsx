import { redirect } from "next/navigation";
import { portalHref } from "@/lib/portal-path";

export default function OpsHomePage() {
  redirect(portalHref("ops", "/login"));
}
