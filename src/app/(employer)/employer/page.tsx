import { redirect } from "next/navigation";
import { portalHref } from "@/lib/portal-path";

export default function EmployerHomePage() {
  redirect(portalHref("employer", "/login"));
}
