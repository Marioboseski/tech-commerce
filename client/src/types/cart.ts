import type { ApiProduct } from './product';

// One row of GET /api/cart: which product, how many, and the product itself.
export type CartItem = {
  productId: number;
  quantity: number;
  product: ApiProduct;
};
