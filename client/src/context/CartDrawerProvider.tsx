import { useState } from 'react';
import type { ReactNode } from 'react';
import { CartDrawerContext } from './cart-drawer-context';

export function CartDrawerProvider({ children }: { children: ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <CartDrawerContext.Provider value={{ cartOpen, setCartOpen }}>
      {children}
    </CartDrawerContext.Provider>
  );
}
