import { createContext } from 'react';

// Only UI state: is the cart drawer open? The cart itself comes from the
// API (hooks/useCart.ts). This moves to Zustand later.
export type CartDrawerContextValue = {
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
};

export const CartDrawerContext = createContext<CartDrawerContextValue | null>(
  null,
);
