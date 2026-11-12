import type { CartItem } from '../types/cart';

const FREE_SHIPPING_FROM = 75;
const SHIPPING_PRICE = 9.9;

export const getCartQuantity = (items: CartItem[]) =>
  items.reduce((total, item) => total + item.quantity, 0);

// Only for display: the order total is calculated by the server, because
// prices on the client can be old or changed by the user.
export const getCartTotals = (items: CartItem[]) => {
  const subtotal = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );
  const shipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_PRICE;
  return { subtotal, shipping, total: subtotal + shipping };
};
