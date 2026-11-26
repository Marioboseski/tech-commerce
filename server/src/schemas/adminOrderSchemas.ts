import { z } from "zod";
import { idTextSchema, paginationFields } from "./commonSchemas.js";

const ORDER_STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
const CARRIERS = ["DHL", "UPS", "FEDEX", "MK_POST", "OTHER"] as const;

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

// Carrier and tracking number are required when an order is shipped, and
// not accepted for any other status.
export const orderStatusSchema = z
  .object({
    status: z.enum(ORDER_STATUSES, "status must be PENDING, PROCESSING, SHIPPED, DELIVERED or CANCELLED"),
    carrier: z.enum(CARRIERS, "carrier must be DHL, UPS, FEDEX, MK_POST or OTHER").optional(),
    trackingNumber: z
      .string("trackingNumber must be text")
      .trim()
      .min(1, "Enter a tracking number")
      .max(100, "Tracking number can be at most 100 characters")
      .optional(),
  })
  .superRefine(({ status, carrier, trackingNumber }, ctx) => {
    if (status === "SHIPPED") {
      // Only when missing: a blank value already got its message above.
      if (carrier === undefined) {
        ctx.addIssue({ code: "custom", path: ["carrier"], message: "Choose a carrier" });
      }
      if (trackingNumber === undefined) {
        ctx.addIssue({ code: "custom", path: ["trackingNumber"], message: "Enter a tracking number" });
      }
    } else if (carrier !== undefined || trackingNumber !== undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["carrier"],
        message: "Carrier and tracking number are only set when an order is shipped",
      });
    }
  });

export type OrderStatusInput = z.output<typeof orderStatusSchema>;
