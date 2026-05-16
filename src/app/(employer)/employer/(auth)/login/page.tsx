import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="text-sm text-[color:var(--color-muted)]">Loading…</p>}>
      <LoginForm />
    </Suspense>
  );
}
