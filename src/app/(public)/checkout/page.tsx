import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutPageContent } from "@/components/cart/CheckoutPageContent";

export const metadata: Metadata = {
  title: "Confirm order",
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function CheckoutCartPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const salary = Array.isArray(sp.salary) ? sp.salary[0] : sp.salary;

  return (
    <Suspense fallback={<div className="mx-auto max-w-[860px] px-4 py-12 sm:px-6">Loading…</div>}>
      <CheckoutPageContent salaryParam={salary} />
    </Suspense>
  );
}
