export type Product = {
  id: number,
  sku: string,
  name: string,
  description: string,
  price: number,
  imageUrl : string | null,
  category: {
    name: string,
    slug: string,
  }
};

export type ProductProps = {
  product: Product
};