"use client";

import { MerchantProductForm } from "@/components/merchant/MerchantProductForm";
import { PageHeader } from "@/components/PageHeader";

export default function MerchantNewProductPage() {
  return (
    <main className="px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto mb-8 max-w-6xl">
        <PageHeader eyebrow="Merchant" title="New product" subtitle="Create a catalogue listing for your shop." />
      </div>
      <MerchantProductForm />
    </main>
  );
}
