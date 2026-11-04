import { prisma } from "../lib/prisma.js"

type ProductFilters = {
  categoryId: number | undefined;
  minPrice: number | undefined;
  maxPrice: number | undefined;
  ids: number[] | undefined;
};

export const getProducts = async ({ categoryId, minPrice, maxPrice, ids }: ProductFilters) => {
  const products = await prisma.product.findMany({
    where: {
      ...(ids !== undefined && { id: { in: ids } }),
      ...(categoryId !== undefined && { categoryId }),
      ...((minPrice !== undefined || maxPrice !== undefined) && {
        price: {
          ...(minPrice !== undefined && { gte: minPrice }),
          ...(maxPrice !== undefined && { lte: maxPrice }),
        }
      }),
    },

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
};

export const getProductById = async (id: number) => {
  const product = await prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      category: {
        select: {
          name: true,
          slug: true,
        }
      },

      laptopDetails: {
        select: {
          screenSize: true,
          ram: true,
          processor: true,
          storage: true,
          graphicsCard: true,
        }
      },

      mobilePhoneDetails: {
        select: {
          screenSize: true,
          ram: true,
          storage: true,
          processor: true,
          battery: true,
          camera: true,
        }
      },

      computerDetails: {
        select: {
          processor: true,
          ram: true,
          storage: true,
          graphicsCard: true,
          formFactor: true,
        }
      },

      consoleDetails: {
        select: {
          manufacturer: true,
          storage: true,
          resolution: true,
          maxPlayers: true,
          connectivity: true,
        }
      },

      tabletDetails: {
        select: {
          screenSize: true,
          ram: true,
          storage: true,
          processor: true,
          battery: true
        }
      }
    }
  })

  if (!product) {
    return null;
  }

  return {
    ...product,
    price: product.price.toNumber(),
  };
};