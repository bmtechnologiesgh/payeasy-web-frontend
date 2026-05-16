import type { Metadata } from "next";
import { Suspense } from "react";
import { CartPageContent } from "@/components/cart/CartPageContent";

export const metadata: Metadata = {
  title: "Your cart",
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function CartPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const salary = Array.isArray(sp.salary) ? sp.salary[0] : sp.salary;

  return (
    <Suspense fallback={<div className="mx-auto max-w-[860px] px-4 py-12 sm:px-6">Loading…</div>}>
      <CartPageContent salaryParam={salary} />
    </Suspense>
  );
}
