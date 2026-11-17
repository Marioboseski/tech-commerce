import type { ApiProduct } from './product';

export type CartItem = {
  productId: number;
  quantity: number;
  product: ApiProduct;
};
