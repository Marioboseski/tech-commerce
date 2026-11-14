import { prisma } from "../lib/prisma.js";
import { toImageUrl } from "../lib/imageUrl.js";
import type { Prisma } from "../../generated/prisma/client.js";

const RECENT_ORDERS = 5;
const TOP_PRODUCTS = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

// Cancelled orders were never paid, so they do not count as sales.
const countedOrder = { status: { not: "CANCELLED" } } satisfies Prisma.OrderWhereInput;

// Everything the admin dashboard shows, in one request.
export const getAdminStats = async () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * DAY_MS);

  // All independent, so they run at the same time.
  const [
    products,
    activeProducts,
    orders,
    pendingOrders,
    customers,
    allSales,
    recentSales,
    recentOrders,
    topItems,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.aggregate({ where: countedOrder, _sum: { total: true } }),
    prisma.order.aggregate({
      where: { ...countedOrder, createdAt: { gte: thirtyDaysAgo } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: RECENT_ORDERS,
      select: {
        id: true,
        status: true,
        total: true,
        createdAt: true,
        user: { select: { id: true, fullName: true, email: true } },
      },
    }),
    // Pieces sold per product. Deleted products (productId null) are skipped.
    prisma.orderItem.groupBy({
      by: ["productId"],
      where: { productId: { not: null }, order: countedOrder },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: TOP_PRODUCTS,
    }),
  ]);

  // groupBy only gives ids, so load the names and pictures in one query.
  const topIds = topItems.flatMap((item) => (item.productId === null ? [] : [item.productId]));
  const topProductRows = await prisma.product.findMany({
    where: { id: { in: topIds } },
    select: { id: true, name: true, imageUrl: true },
  });
  const productById = new Map(topProductRows.map((product) => [product.id, product]));

  return {
    products,
    activeProducts,
    orders,
    pendingOrders,
    customers,
    totalSales: allSales._sum.total?.toNumber() ?? 0,
    salesLast30Days: recentSales._sum.total?.toNumber() ?? 0,
    ordersLast30Days: recentSales._count,
    recentOrders: recentOrders.map((order) => ({ ...order, total: order.total.toNumber() })),
    topProducts: topItems.flatMap((item) => {
      const product = item.productId === null ? undefined : productById.get(item.productId);
      return product
        ? [
            {
              id: product.id,
              name: product.name,
              imageUrl: toImageUrl(product.imageUrl),
              quantitySold: item._sum.quantity ?? 0,
            },
          ]
        : [];
    }),
  };
};
