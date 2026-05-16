import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import type { ReactNode } from "react";
import { EmployeeSessionProvider } from "@/lib/employee-session";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PayEasy",
    template: "%s · PayEasy",
  },
  description:
    "PayEasy — employer-verified marketplace, employer workspace, merchant onboarding, and operations tools.",
  icons: {
    icon: [
      { url: "/favicon/favicon-96x96.png", type: "image/png", sizes: "96x96" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon/favicon.ico",
    apple: { url: "/favicon/apple-touch-icon.png", sizes: "180x180" },
  },
  manifest: "/favicon/site.webmanifest",
  appleWebApp: {
    title: "PayEasy",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} flex min-h-screen flex-col antialiased`}>
        <EmployeeSessionProvider>{children}</EmployeeSessionProvider>
      </body>
    </html>
  );
}
