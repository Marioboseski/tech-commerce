import { prisma } from "../lib/prisma.js";
import { toApiProduct } from "../lib/apiProduct.js";

export const MAX_CART_QUANTITY = 10;

const toApiCartItem = (item: {
  productId: number;
  quantity: number;
}) => ({
  productId: item.productId,
  quantity: item.quantity,
});

export const getCartItems = async (userId: number) => {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
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

  return items.map((item) => ({
    ...toApiCartItem(item),
    product: toApiProduct(item.product),
  }));
};

type AddCartItemResult =
  | { status: "added"; item: { productId: number; quantity: number } }
  | { status: "product_not_found" }
  | { status: "limit_reached" };

export const addCartItem = async (
  userId: number,
  productId: number,
): Promise<AddCartItemResult> => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });

  if (!product) {
    return { status: "product_not_found" };
  }

  const existingItem = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId, productId } },
    select: { quantity: true },
  });

  if (existingItem && existingItem.quantity >= MAX_CART_QUANTITY) {
    return { status: "limit_reached" };
  }

  const item = await prisma.cartItem.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId },
    update: { quantity: { increment: 1 } },
  });

  return { status: "added", item: toApiCartItem(item) };
};

export const updateCartItemQuantity = async (
  userId: number,
  productId: number,
  quantity: number,
) => {
  
  const { count } = await prisma.cartItem.updateMany({
    where: { userId, productId },
    data: { quantity },
  });

  return count === 0 ? null : toApiCartItem({ productId, quantity });
};

export const removeCartItem = async (userId: number, productId: number) => {
  await prisma.cartItem.deleteMany({
    where: { userId, productId },
  });
};
