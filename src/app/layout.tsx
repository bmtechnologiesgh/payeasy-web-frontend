import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { BottomNav } from "@/components/BottomNav";
import { FixedChrome } from "@/components/FixedChrome";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteTopBar } from "@/components/SiteTopBar";
import { getCategories } from "@/lib/catalog";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PayEasy Marketplace",
    template: "%s · PayEasy Marketplace",
  },
  description:
    "Browse PayEasy’s corporate BNPL product catalogue — categories, search, and installment price bands.",
  icons: {
    icon: "/pe_favicon.png",
    shortcut: "/pe_favicon.png",
    apple: "/pe_favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = getCategories();

  return (
    <html lang="en">
      <body
        className={`${outfit.variable} flex min-h-screen flex-col antialiased`}
      >
        <SiteTopBar />
        <SiteHeader categories={categories} />
        <main className="flex-1 bg-[color:var(--color-app)] pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
          {children}
        </main>
        <SiteFooter />
        <BottomNav />
        <FixedChrome />
      </body>
    </html>
  );
}
