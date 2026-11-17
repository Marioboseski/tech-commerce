import { toImageUrl } from "./imageUrl.js";

type DbProduct = {
  price: { toNumber: () => number };
  imageUrl: string | null;
};

export const toApiProduct = <T extends DbProduct>(product: T) => ({
  ...product,
  price: product.price.toNumber(),
  imageUrl: toImageUrl(product.imageUrl),
});
