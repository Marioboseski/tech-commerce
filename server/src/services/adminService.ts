import { prisma } from "../lib/prisma.js";

// Numbers for the top of the admin dashboard.
export const getAdminStats = async () => {
  const [products, orders, pendingOrders, customers] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
  ]);

  return { products, orders, pendingOrders, customers };
};
