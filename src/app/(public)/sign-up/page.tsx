import type { Metadata } from "next";
import { Suspense } from "react";
import { SignUpForm } from "./SignUpForm";

export const metadata: Metadata = {
  title: "Create account",
};

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[440px] px-4 py-16 text-center text-sm text-[color:var(--color-muted)]">Loading…</div>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}
