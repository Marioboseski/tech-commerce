import { prisma } from "../lib/prisma.js";
import { canChangeOrderStatus, nextOrderStatuses } from "../lib/orderStatus.js";
import { orderSelect, toApiOrder } from "./ordersService.js";
import type { OrderStatus, Prisma } from "../../generated/prisma/client.js";

type ListFilters = {
  page: number;
  pageSize: number;
  status: OrderStatus | "ALL";
  search?: string | undefined;
};

const customerSelect = { id: true, fullName: true, email: true } satisfies Prisma.UserSelect;

// "12" or "#12" → 12, anything else → null.
const orderNumberFrom = (search: string) => {
  const match = /^#?(\d{1,9})$/.exec(search);
  return match ? Number(match[1]) : null;
};

// One page of all orders (every customer), newest first.
export const listOrders = async ({ page, pageSize, status, search }: ListFilters) => {
  const orderNumber = search ? orderNumberFrom(search) : null;

  const where: Prisma.OrderWhereInput = {
    ...(status !== "ALL" && { status }),
    ...(search &&
      (orderNumber !== null
        ? { id: orderNumber }
        : {
            OR: [
              { fullName: { contains: search } },
              { user: { fullName: { contains: search } } },
              { user: { email: { contains: search } } },
            ],
          })),
  };

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        status: true,
        total: true,
        createdAt: true,
        user: { select: customerSelect },
        items: { select: { quantity: true } },
      },
    }),
  ]);

  return {
    items: orders.map(({ items, total: orderTotal, ...order }) => ({
      ...order,
      total: orderTotal.toNumber(),
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    })),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
};

// One order with its customer and the statuses it may move to next.
// null if it does not exist.
export const getOrder = async (id: number) => {
  const order = await prisma.order.findUnique({
    where: { id },
    select: { ...orderSelect, user: { select: customerSelect } },
  });

  if (!order) {
    return null;
  }

  const { user, ...rest } = order;
  return {
    ...toApiOrder(rest),
    customer: user,
    nextStatuses: nextOrderStatuses[order.status],
  };
};

type StatusResult =
  | { status: "updated"; order: NonNullable<Awaited<ReturnType<typeof getOrder>>> }
  | { status: "not_found" }
  | { status: "not_allowed"; from: OrderStatus }
  | { status: "changed" };

export const updateOrderStatus = async (id: number, next: OrderStatus): Promise<StatusResult> => {
  const order = await prisma.order.findUnique({ where: { id }, select: { status: true } });

  if (!order) {
    return { status: "not_found" };
  }
  if (!canChangeOrderStatus(order.status, next)) {
    return { status: "not_allowed", from: order.status };
  }

  // "Only if it is still in the status we just read": if another admin
  // changed it in between, nothing is updated and we say so.
  const { count } = await prisma.order.updateMany({
    where: { id, status: order.status },
    data: { status: next },
  });

  if (count === 0) {
    return { status: "changed" };
  }

  const updated = await getOrder(id);
  return updated ? { status: "updated", order: updated } : { status: "not_found" };
};
