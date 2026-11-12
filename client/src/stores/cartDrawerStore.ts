import { create } from 'zustand';

// UI state only: is the cart drawer open?
// (The cart itself is server data and lives in TanStack Query: useCart.)
type CartDrawerState = {
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

// create() makes a small global store and gives back a hook to read it.
// `set` changes the store; every component that reads the changed value
// re-renders by itself. No Provider is needed.
export const useCartDrawerStore = create<CartDrawerState>()((set) => ({
  cartOpen: false,
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
}));
