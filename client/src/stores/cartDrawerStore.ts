import { create } from 'zustand';

// UI state only: is the cart drawer open?
// (The cart itself is server data and lives in TanStack Query: useCart.)
type CartDrawerState = {
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

export const useCartDrawerStore = create<CartDrawerState>()((set) => ({
  cartOpen: false,
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
}));
