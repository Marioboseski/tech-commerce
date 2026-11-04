import type { ApiProduct } from '../types/product';

export const getCartQuantity = (cart: Record<number, number>) =>
  Object.values(cart).reduce((total, quantity) => total + quantity, 0);

export const getCartEntries = (
  cart: Record<number, number>,
  products: ApiProduct[],
) =>
  Object.entries(cart)
    .filter(([, quantity]) => quantity > 0)
    .flatMap(([id, quantity]) => {
      const product = products.find((item) => item.id === Number(id));
      return product ? [{ product, quantity }] : [];
    });

export const getCartTotals = (
  cart: Record<number, number>,
  products: ApiProduct[],
) => {
  const subtotal = getCartEntries(cart, products).reduce(
    (total, { product, quantity }) => total + product.price * quantity,
    0,
  );
  const shipping = subtotal === 0 || subtotal >= 75 ? 0 : 9.9;
  return { subtotal, shipping, total: subtotal + shipping };
};
