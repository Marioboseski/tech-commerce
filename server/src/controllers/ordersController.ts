import * as ordersService from "../services/ordersService.js";
import type { DeliveryAddress } from "../services/ordersService.js";
import { isValidId } from "../lib/validation.js";
import type { Request, Response } from "express";

// Same lengths as the columns in the orders table (schema.prisma).
const ADDRESS_MAX_LENGTHS: Record<keyof DeliveryAddress, number> = {
  fullName: 100,
  street: 255,
  city: 100,
  postalCode: 20,
};

// Checks the delivery address from the body.
// Returns the cleaned address, or an error message for a 400.
const readDeliveryAddress = (
  body: unknown,
): { address: DeliveryAddress } | { error: string } => {
  const input = (body ?? {}) as Record<string, unknown>;
  const address = {} as DeliveryAddress;

  for (const [field, maxLength] of Object.entries(ADDRESS_MAX_LENGTHS)) {
    const value = input[field];
    if (typeof value !== "string") {
      return { error: `${field} is required` };
    }

    const trimmed = value.trim();
    if (trimmed.length === 0 || trimmed.length > maxLength) {
      return { error: `${field} must be between 1 and ${maxLength} characters` };
    }

    address[field as keyof DeliveryAddress] = trimmed;
  }

  return { address };
};

// All orders routes run after requireAuth, which sets req.auth.
// The user always comes from the login token, NEVER from the body or the URL.

// POST /api/orders   body: { fullName, street, city, postalCode }
// No products and no prices: the server takes them from the user's cart.
export const createOrder = async (req: Request, res: Response) => {
  if (!req.auth) {
    return res.status(401).json({ message: "Not logged in" });
  }

  const result = readDeliveryAddress(req.body);
  if ("error" in result) {
    return res.status(400).json({ message: result.error });
  }

  const created = await ordersService.createOrder(req.auth.userId, result.address);

  if (created.status === "empty_cart") {
    return res.status(400).json({ message: "Your cart is empty" });
  }

  if (created.status === "cart_changed") {
    // 409 Conflict: the cart changed at the same moment (e.g. a double click).
    return res.status(409).json({
      message: "Your cart changed while ordering. Please check it and try again.",
    });
  }

  // 201 Created: a new order exists now.
  return res.status(201).json(created.order);
};

// GET /api/orders
export const getOrders = async (req: Request, res: Response) => {
  if (!req.auth) {
    return res.status(401).json({ message: "Not logged in" });
  }

  const orders = await ordersService.getOrders(req.auth.userId);
  return res.status(200).json(orders);
};

// GET /api/orders/:orderId
export const getOrder = async (req: Request, res: Response) => {
  if (!req.auth) {
    return res.status(401).json({ message: "Not logged in" });
  }

  // Values from the URL are always text ("12"), so turn them into a number.
  const orderId = Number(req.params.orderId);

  if (!isValidId(orderId)) {
    return res.status(400).json({ message: "orderId must be a positive integer" });
  }

  const order = await ordersService.getOrderById(req.auth.userId, orderId);

  // 404 also for someone else's order: we do not even say that it exists.
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  return res.status(200).json(order);
};
