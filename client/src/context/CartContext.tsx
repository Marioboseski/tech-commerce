import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

type CartContextValue = {
  cart: Record<number, number>;
  cartOpen: boolean;
  addToCart: (id: number) => void;
  changeQuantity: (id: number, delta: number) => void;
  removeFromCart: (id: number) => void;
  setCartOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Record<number, number>>(() => {
    try {
      const savedCart = window.localStorage.getItem('techstore-cart');
      return savedCart ? JSON.parse(savedCart) : {};
    } catch {
      return {};
    }
  });
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    window.localStorage.setItem('techstore-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (id: number) => {
    setCart((current) => ({ ...current, [id]: (current[id] ?? 0) + 1 }));
  };

  const changeQuantity = (id: number, delta: number) => {
    setCart((current) => {
      const next = { ...current };
      const count = (next[id] ?? 0) + delta;

      if (count <= 0) delete next[id];
      else next[id] = count;

      return next;
    });
  };

  const removeFromCart = (id: number) => {
    setCart((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartOpen,
        addToCart,
        changeQuantity,
        removeFromCart,
        setCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }

  return context;
}
