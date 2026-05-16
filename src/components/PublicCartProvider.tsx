"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/context/CartContext";

export function PublicCartProvider({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
