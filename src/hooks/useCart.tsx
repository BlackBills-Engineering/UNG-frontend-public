// src/hooks/useCart.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import type { CartProduct, CartPump } from "../types/Cart";

interface CartContextValue {
  products: CartProduct[];
  pumps: CartPump[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addProduct: (item: Omit<CartProduct, "quantity">) => void;
  addPump: (item: Omit<CartPump, "uuid">) => void;
  removeProduct: (id: number) => void;
  removePump: (uuid: string) => void;
  updateProductQty: (id: number, delta: number) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  // --- инициализируем из localStorage или пустым массивом ---
  const [products, setProducts] = useState<CartProduct[]>(() => {
    try {
      const stored = localStorage.getItem("cart_products");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [pumps, setPumps] = useState<CartPump[]>(() => {
    try {
      const stored = localStorage.getItem("cart_pumps");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setCartOpen] = useState(false);

  // --- синхронизируем каждый раз, когда меняются products/pumps ---
  useEffect(() => {
    localStorage.setItem("cart_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("cart_pumps", JSON.stringify(pumps));
  }, [pumps]);

  const openCart = () => setCartOpen(true);
  const closeCart = () => setCartOpen(false);
  const toggleCart = () => setCartOpen((o) => !o);

  const addProduct = (item: Omit<CartProduct, "quantity">) => {
    setProducts((prev) => {
      const exists = prev.find((p) => p.id === item.id);
      if (exists) {
        return prev.map((p) =>
          p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    openCart();
  };

  const updateProductQty = (id: number, delta: number) => {
    setProducts((prev) =>
      prev
        .map((p) =>
          p.id === id ? { ...p, quantity: Math.max(1, p.quantity + delta) } : p
        )
        .filter((p) => p.quantity > 0)
    );
  };

  const addPump = (item: Omit<CartPump, "uuid">) => {
    setPumps((prev) => [...prev, { ...item, uuid: uuidv4() }]);
    openCart();
  };

  const removeProduct = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const removePump = (uuid: string) => {
    setPumps((prev) => prev.filter((p) => p.uuid !== uuid));
  };

  return (
    <CartContext.Provider
      value={{
        products,
        pumps,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        addProduct,
        updateProductQty,
        addPump,
        removeProduct,
        removePump,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart must be inside CartProvider");
  return c;
};
