export type ApiProduct = {
  id: number;
  sku: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  category: {
    name: string;
    slug: string;
  };
};