import type { ApiProduct } from '../types/product';

// Temporary: the database has no product images yet (image_url is NULL).
// Until real images are stored, show a local placeholder per category.
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
