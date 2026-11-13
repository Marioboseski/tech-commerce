import { prisma } from "../lib/prisma.js";
import { toImageUrl } from "../lib/imageUrl.js";
import { Prisma } from "../../generated/prisma/client.js";
import type { DeliveryAddress } from "../schemas/ordersSchemas.js";

const FREE_SHIPPING_FROM = new Prisma.Decimal(75);
const SHIPPING_PRICE = new Prisma.Decimal("9.90");

const orderSelect = {
  id: true,
  status: true,
  fullName: true,
  street: true,
  city: true,
  postalCode: true,
  subtotal: true,
  shippingCost: true,
  total: true,
  createdAt: true,
  items: {
    orderBy: { id: "asc" },
    select: {
      productId: true,
      productName: true,
      unitPrice: true,
      quantity: true,
      product: { select: { imageUrl: true } },
    },
  },
} satisfies Prisma.OrderSelect;

type DbOrder = Prisma.OrderGetPayload<{ select: typeof orderSelect }>;

const toApiOrder = (order: DbOrder) => ({
  ...order,
  subtotal: order.subtotal.toNumber(),
  shippingCost: order.shippingCost.toNumber(),
  total: order.total.toNumber(),
  items: order.items.map(({ product, ...item }) => ({
    ...item,
    unitPrice: item.unitPrice.toNumber(),
    imageUrl: toImageUrl(product?.imageUrl ?? null),
  })),
});

class CartChangedError extends Error {}

type CreateOrderResult =
  | { status: "created"; order: ReturnType<typeof toApiOrder> }
  | { status: "empty_cart" }
  | { status: "cart_changed" };

export const createOrder = async (
  userId: number,
  address: DeliveryAddress,
): Promise<CreateOrderResult> => {
  try {
    return await prisma.$transaction(async (tx) => {
      const cartItems = await tx.cartItem.findMany({
        // Archiving removes a product from carts; this also covers the
        // moment in between.
        where: { userId, product: { isActive: true } },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          productId: true,
          quantity: true,
          product: { select: { name: true, price: true } },
        },
      });

      if (cartItems.length === 0) {
        return { status: "empty_cart" } as const;
      }

      const subtotal = cartItems.reduce(
        (sum, item) => sum.plus(item.product.price.times(item.quantity)),
        new Prisma.Decimal(0),
      );
      const shippingCost = subtotal.gte(FREE_SHIPPING_FROM)
        ? new Prisma.Decimal(0)
        : SHIPPING_PRICE;

      const order = await tx.order.create({
        data: {
          userId,
          ...address,
          subtotal,
          shippingCost,
          total: subtotal.plus(shippingCost),
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              unitPrice: item.product.price,
              quantity: item.quantity,
            })),
          },
        },
        select: orderSelect,
      });

      const { count } = await tx.cartItem.deleteMany({
        where: { id: { in: cartItems.map((item) => item.id) } },
      });

      // Fewer rows deleted = another request already ordered (or changed)
      // this cart at the same time. Throw, so this order is undone.
      if (count !== cartItems.length) {
        throw new CartChangedError();
      }

      return { status: "created", order: toApiOrder(order) } as const;
    });
  } catch (error) {
    if (error instanceof CartChangedError) {
      return { status: "cart_changed" };
    }
    throw error;
  }
};

export const getOrders = async (userId: number) => {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: orderSelect,
  });

  return orders.map(toApiOrder);
};

// One order, but only if it belongs to this user. Returns null otherwise,
// so nobody can open someone else's order by guessing its number.
export const getOrderById = async (userId: number, orderId: number) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    select: orderSelect,
  });

  return order ? toApiOrder(order) : null;
};
