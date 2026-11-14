import { prisma } from "../lib/prisma.js";
import { toImageUrl } from "../lib/imageUrl.js";
import type { Prisma } from "../../generated/prisma/client.js";

const RECENT_ORDERS = 5;
const TOP_PRODUCTS = 5;
const SALES_CHART_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

// Cancelled orders were never paid, so they do not count as sales.
const countedOrder = { status: { not: "CANCELLED" } } satisfies Prisma.OrderWhereInput;

// "2026-11-14" in the server's time zone, used to group orders per day.
const dayKey = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

// Everything the admin dashboard shows, in one request.
export const getAdminStats = async () => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * DAY_MS);
  // Midnight at the start of the first chart day.
  const chartStart = new Date(now);
  chartStart.setHours(0, 0, 0, 0);
  chartStart.setDate(chartStart.getDate() - (SALES_CHART_DAYS - 1));

  // All independent, so they run at the same time.
  const [
    products,
    activeProducts,
    orders,
    pendingOrders,
    customers,
    allSales,
    recentSales,
    chartOrders,
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
      where: { ...countedOrder, createdAt: { gte: chartStart } },
      select: { total: true, createdAt: true },
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

  // Every chart day is listed, also days without sales (0), so the chart
  // has no gaps.
  const salesPerDay = new Map<string, number>();
  for (let i = 0; i < SALES_CHART_DAYS; i++) {
    // Calendar days, not "+ 24 hours": a day has 23 or 25 hours when the
    // clocks change, and adding 24 hours would then skip or repeat a day.
    const day = new Date(chartStart);
    day.setDate(chartStart.getDate() + i);
    salesPerDay.set(dayKey(day), 0);
  }
  for (const order of chartOrders) {
    const key = dayKey(order.createdAt);
    salesPerDay.set(key, (salesPerDay.get(key) ?? 0) + order.total.toNumber());
  }

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
    salesByDay: [...salesPerDay].map(([date, total]) => ({
      date,
      // Rounded to cents: adding many prices as numbers can leave 0.000001.
      total: Math.round(total * 100) / 100,
    })),
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
