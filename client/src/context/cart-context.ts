import { createContext } from 'react';

export type CartState = Record<number, number>;

export type CartContextValue = {
  cart: CartState;
  cartOpen: boolean;
  addToCart: (id: number) => void;
  changeQuantity: (id: number, delta: number) => void;
  removeFromCart: (id: number) => void;
  setCartOpen: (open: boolean) => void;
};

export const CartContext = createContext<CartContextValue | null>(null);
