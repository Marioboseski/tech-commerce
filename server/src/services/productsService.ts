import { prisma } from "../lib/prisma.js"

export const getProducts = async () => {
  const products = await prisma.product.findMany({
    include: {
      category: {
        select: {
          name: true,
          slug: true,
        }
      }
    }
  });
  return products.map((product) => ({
    ...product, price: product.price.toNumber()
  }));
}