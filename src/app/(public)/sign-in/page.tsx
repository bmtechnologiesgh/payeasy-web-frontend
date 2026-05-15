import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInForm } from "./SignInForm";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[440px] px-4 py-16 text-center text-sm text-[color:var(--color-muted)]">Loading…</div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
