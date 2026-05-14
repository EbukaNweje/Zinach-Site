"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { CartItem, fetchCart, clearCart as apiClearCart } from "../lib/cart";

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  loading: boolean;
  refreshCart: () => Promise<void>;
  clearCart: () => Promise<void>;
  setCartItems: (items: CartItem[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshCart = useCallback(async () => {
    setLoading(true);
    try {
      const items = await fetchCart();
      setCartItems(items);
    } catch {
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCart = useCallback(async () => {
    await apiClearCart();
    setCartItems([]);
  }, []);

  // Load cart on mount (client-side only)
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        loading,
        refreshCart,
        clearCart,
        setCartItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
