import { prisma } from "../lib/prisma.js";
import { toApiProduct } from "../lib/apiProduct.js";

export const getFavoriteProducts = async (userId: number) => {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        include: {
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  return favorites.map(({ product }) => toApiProduct(product));
};

export const addFavorite = async (userId: number, productId: number) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });

  if (!product) {
    return null;
  }

  return prisma.favorite.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId },
    update: {},
  });
};

export const removeFavorite = async (userId: number, productId: number) => {
  await prisma.favorite.deleteMany({
    where: { userId, productId },
  });
};
