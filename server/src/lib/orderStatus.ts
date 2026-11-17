import type { OrderStatus } from "../../generated/prisma/client.js";

// Which status an order may move to next. Everything else is refused:
// a delivered or cancelled order is final, and a shipped order can no
// longer be cancelled (it is already on its way).
export const nextOrderStatuses: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export const canChangeOrderStatus = (from: OrderStatus, to: OrderStatus) =>
  nextOrderStatuses[from].includes(to);
