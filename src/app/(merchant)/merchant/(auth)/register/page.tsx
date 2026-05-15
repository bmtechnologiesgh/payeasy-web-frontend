import { Suspense } from "react";
import { RegisterForm } from "./RegisterForm";

export default function RegisterPage() {
  return (
    <Suspense fallback={<p className="text-sm text-[color:var(--color-muted)]">Loading…</p>}>
      <RegisterForm />
    </Suspense>
  );
}
