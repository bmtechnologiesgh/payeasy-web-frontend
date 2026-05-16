import type { ReactNode } from "react";
import { BottomNav } from "@/components/BottomNav";
import { PublicCartProvider } from "@/components/PublicCartProvider";
import { FixedChrome } from "@/components/FixedChrome";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteTopBar } from "@/components/SiteTopBar";
import { getCategories } from "@/lib/catalog";

export const revalidate = 60;

export default async function PublicLayout({ children }: Readonly<{ children: ReactNode }>) {
  const categories = await getCategories();

  return (
    <PublicCartProvider>
      <SiteTopBar />
      <SiteHeader categories={categories} />
      <main className="flex-1 bg-[color:var(--color-app)] pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
        {children}
      </main>
      <SiteFooter />
      <BottomNav />
      <FixedChrome />
    </PublicCartProvider>
  );
}
