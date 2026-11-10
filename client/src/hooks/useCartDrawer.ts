import { useContext } from 'react';
import { CartDrawerContext } from '../context/cart-drawer-context';

// Open / close the cart drawer from any component.
export function useCartDrawer() {
  const context = useContext(CartDrawerContext);
  if (!context) {
    throw new Error('useCartDrawer must be used within CartDrawerProvider');
  }
  return context;
}
