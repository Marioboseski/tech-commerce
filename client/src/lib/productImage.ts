import type { ApiProduct } from '../types/product';

// Product images come from the API (imageUrl). A product without an image
// (imageUrl is null) shows a local placeholder for its category.
const categoryPlaceholders: Record<string, string> = {
  laptops: '/products/novabook-air.jpg',
  'mobile-phones': '/products/apex-pro.jpg',
  tablets: '/products/slatepad.jpg',
  computers: '/products/tower-core.jpg',
};

const defaultPlaceholder = '/products/studiodesk.jpg';

export const getProductImage = (
  product: Pick<ApiProduct, 'imageUrl' | 'category'>,
) =>
  product.imageUrl ??
  categoryPlaceholders[product.category.slug] ??
  defaultPlaceholder;
