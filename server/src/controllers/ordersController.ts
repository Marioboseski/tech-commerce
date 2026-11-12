import * as ordersService from "../services/ordersService.js";
import type { DeliveryAddress } from "../services/ordersService.js";
import { isValidId } from "../lib/validation.js";
import { HttpError } from "../lib/httpError.js";
import { getAuthUserId } from "../middleware/requireAuth.js";
import type { Request, Response } from "express";

// Same lengths as the columns in the orders table (schema.prisma).
const ADDRESS_MAX_LENGTHS: Record<keyof DeliveryAddress, number> = {
  fullName: 100,
  street: 255,
  city: 100,
  postalCode: 20,
};

// Checks the delivery address from the body and returns it cleaned.
// Throws a 400 when a field is missing or too long.
const readDeliveryAddress = (body: unknown): DeliveryAddress => {
  const input = (body ?? {}) as Record<string, unknown>;
  const address = {} as DeliveryAddress;

  for (const [field, maxLength] of Object.entries(ADDRESS_MAX_LENGTHS)) {
    const value = input[field];
    if (typeof value !== "string") {
      throw new HttpError(400, `${field} is required`);
    }

    const trimmed = value.trim();
    if (trimmed.length === 0 || trimmed.length > maxLength) {
      throw new HttpError(400, `${field} must be between 1 and ${maxLength} characters`);
    }

    address[field as keyof DeliveryAddress] = trimmed;
  }

  return address;
};

// POST /api/orders   body: { fullName, street, city, postalCode }
// No products and no prices: the server takes them from the user's cart.
export const createOrder = async (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const address = readDeliveryAddress(req.body);

  const created = await ordersService.createOrder(userId, address);

  if (created.status === "empty_cart") {
    throw new HttpError(400, "Your cart is empty");
  }

  if (created.status === "cart_changed") {
    // 409 Conflict: the cart changed at the same moment (e.g. a double click).
    throw new HttpError(409, "Your cart changed while ordering. Please check it and try again.");
  }

  // 201 Created: a new order exists now.
  return res.status(201).json(created.order);
};

// GET /api/orders
export const getOrders = async (req: Request, res: Response) => {
  const orders = await ordersService.getOrders(getAuthUserId(req));
  return res.status(200).json(orders);
};

// GET /api/orders/:orderId
export const getOrder = async (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  // Values from the URL are always text ("12"), so turn them into a number.
  const orderId = Number(req.params.orderId);

  if (!isValidId(orderId)) {
    throw new HttpError(400, "orderId must be a positive integer");
  }

  const order = await ordersService.getOrderById(userId, orderId);

  // 404 also for someone else's order: we do not even say that it exists.
  if (!order) {
    throw new HttpError(404, "Order not found");
  }

  return res.status(200).json(order);
};
