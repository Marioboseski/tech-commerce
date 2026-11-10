import type { CartItem } from '../types/cart';

// Free delivery from this subtotal; below it delivery costs SHIPPING_PRICE.
const FREE_SHIPPING_FROM = 75;
const SHIPPING_PRICE = 9.9;

// How many pieces are in the cart in total (the number on the cart icon).
export const getCartQuantity = (items: CartItem[]) =>
  items.reduce((total, item) => total + item.quantity, 0);

// Only for showing the cart. The real order total will be calculated by
// the server when orders are added, because prices on the client can be
// old or changed by the user.
export const getCartTotals = (items: CartItem[]) => {
  const subtotal = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );
  const shipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_PRICE;
  return { subtotal, shipping, total: subtotal + shipping };
};
