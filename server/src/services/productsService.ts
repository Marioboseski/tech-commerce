import { prisma } from "../lib/prisma.js"
import { toImageUrl } from "../lib/imageUrl.js"

// `contains` becomes SQL LIKE, where % and _ are wildcards. Escape them so a
// search for "%" looks for the character itself instead of matching everything.
const escapeLike = (value: string) => value.replace(/[\\%_]/g, "\\$&");

type ProductFilters = {
  categoryId: number | undefined;
  minPrice: number | undefined;
  maxPrice: number | undefined;
  ids: number[] | undefined;
  search: string | undefined;
  limit: number | undefined;
};

export const getProducts = async ({ categoryId, minPrice, maxPrice, ids, search, limit }: ProductFilters) => {
  const searchTerm = search !== undefined ? escapeLike(search) : undefined;

  const products = await prisma.product.findMany({
    where: {
      // The MySQL collation (utf8mb4_unicode_ci) makes contains case-insensitive.
      ...(searchTerm !== undefined && {
        OR: [
          { name: { contains: searchTerm } },
          { description: { contains: searchTerm } },
          { category: { name: { contains: searchTerm } } },
        ]
      }),
      ...(ids !== undefined && { id: { in: ids } }),
      ...(categoryId !== undefined && { categoryId }),
      ...((minPrice !== undefined || maxPrice !== undefined) && {
        price: {
          ...(minPrice !== undefined && { gte: minPrice }),
          ...(maxPrice !== undefined && { lte: maxPrice }),
        }
      }),
    },

    // A stable order is needed so that `limit` always returns the same products.
    orderBy: { id: "asc" },
    ...(limit !== undefined && { take: limit }),

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
    ...product,
    price: product.price.toNumber(),
    imageUrl: toImageUrl(product.imageUrl),
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
    imageUrl: toImageUrl(product.imageUrl),
  };
};