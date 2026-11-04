import type { CartState } from '../context/cart-context';
import { useProductsByIds } from './useProductsByIds';

// Products in the cart, loaded from the API.
export function useCartProducts(cart: CartState) {
  const ids = Object.entries(cart)
    .filter(([, quantity]) => quantity > 0)
    .map(([id]) => Number(id));
  return useProductsByIds(ids);
}
