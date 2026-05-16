"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product, TenureKey } from "@/lib/catalog";
import {
  CART_STORAGE_KEY,
  MAX_CART_ITEMS,
  createCartItem,
  loadCartFromStorage,
  saveCartToStorage,
  updateCartItemTenure,
  type CartItem,
} from "@/lib/cart";

type AddResult = "added" | "updated" | "full";

type CartContextValue = {
  items: CartItem[];
  count: number;
  isReady: boolean;
  addProduct: (product: Product, tenure: TenureKey) => AddResult;
  removeLine: (lineId: string) => void;
  updateTenure: (lineId: string, tenure: TenureKey) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setItems(loadCartFromStorage());
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    saveCartToStorage(items);
  }, [items, isReady]);

  const addProduct = useCallback((product: Product, tenure: TenureKey): AddResult => {
    const nextItem = createCartItem(product, tenure);
    if (!nextItem) {
      return "full";
    }

    let result: AddResult = "added";

    setItems((current) => {
      const existingIndex = current.findIndex((item) => item.lineId === nextItem.lineId);
      if (existingIndex >= 0) {
        result = "updated";
        const copy = [...current];
        copy[existingIndex] = nextItem;
        return copy;
      }

      if (current.length >= MAX_CART_ITEMS) {
        result = "full";
        return current;
      }

      return [...current, nextItem];
    });

    return result;
  }, []);

  const removeLine = useCallback((lineId: string) => {
    setItems((current) => current.filter((item) => item.lineId !== lineId));
  }, []);

  const updateTenure = useCallback((lineId: string, tenure: TenureKey) => {
    setItems((current) => {
      const index = current.findIndex((item) => item.lineId === lineId);
      if (index < 0) {
        return current;
      }

      const updated = updateCartItemTenure(current[index], tenure);
      if (!updated) {
        return current;
      }

      return [
        ...current.filter((item, i) => i !== index && item.lineId !== updated.lineId),
        updated,
      ];
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, []);

  const value = useMemo(
    () => ({
      items,
      count: items.length,
      isReady,
      addProduct,
      removeLine,
      updateTenure,
      clearCart,
    }),
    [items, isReady, addProduct, removeLine, updateTenure, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }

  return ctx;
}
