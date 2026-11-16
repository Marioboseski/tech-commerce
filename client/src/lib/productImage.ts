import type { ApiProduct } from '../types/product';

// Product images come from the API (imageUrl). A product without an image
// (imageUrl is null) shows the picture of its category instead.
const categoryPlaceholders: Record<string, string> = {
  laptops: '/categories/laptops.webp',
  'mobile-phones': '/categories/mobile-phones.webp',
  tablets: '/categories/tablets.webp',
  computers: '/categories/computers.webp',
  consoles: '/categories/consoles.webp',
};

// Also used for order items, which have no category.
export const defaultPlaceholder = '/product-placeholder.svg';

export const getProductImage = (
  product: Pick<ApiProduct, 'imageUrl' | 'category'>,
) =>
  product.imageUrl ??
  categoryPlaceholders[product.category.slug] ??
  defaultPlaceholder;
