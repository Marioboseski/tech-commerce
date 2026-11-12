import { z } from "zod";
import { idTextSchema, requiredText } from "./commonSchemas.js";

// Same lengths as the columns in the orders table (schema.prisma).
// No products and no prices: the server takes them from the user's cart.
export const deliveryAddressSchema = z.object({
  fullName: requiredText("Full name", 100),
  street: requiredText("Street", 255),
  city: requiredText("City", 100),
  postalCode: requiredText("Postal code", 20),
});

// The address type comes from the schema, so they can never differ.
export type DeliveryAddress = z.output<typeof deliveryAddressSchema>;

export const orderParamsSchema = z.object({
  orderId: idTextSchema("orderId"),
});
