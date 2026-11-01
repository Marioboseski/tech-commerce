import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { CartContext } from './cart-context';

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
      if (count <= 0) {
        delete next[id];
      } else {
        next[id] = count;
      }
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
