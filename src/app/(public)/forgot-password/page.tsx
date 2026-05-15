import type { Metadata } from "next";
import { Suspense } from "react";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset password",
};

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[440px] px-4 py-16 text-center text-sm text-[color:var(--color-muted)]">Loading…</div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
