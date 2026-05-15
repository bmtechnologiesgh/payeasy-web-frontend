import { Suspense } from "react";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<p className="text-sm text-[color:var(--color-muted)]">Loading…</p>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
