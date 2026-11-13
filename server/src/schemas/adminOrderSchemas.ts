import { z } from "zod";
import { idTextSchema, paginationFields } from "./commonSchemas.js";

const ORDER_STATUSES = ["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

// GET /api/admin/orders?page=&pageSize=&status=&search=
export const adminOrdersQuerySchema = z.object({
  ...paginationFields,
  status: z
    .enum([...ORDER_STATUSES, "ALL"], "status must be ALL or an order status")
    .default("ALL"),
  // An order number ("12" or "#12"), or part of the customer's name / email.
  search: z.string().trim().max(100).optional(),
});

export const adminOrderParamsSchema = z.object({
  orderId: idTextSchema("orderId"),
});

// PATCH /api/admin/orders/:orderId/status   body: { "status": "SHIPPED" }
export const orderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES, "status must be PENDING, SHIPPED, DELIVERED or CANCELLED"),
});
