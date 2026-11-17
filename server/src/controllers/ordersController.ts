import * as ordersService from "../services/ordersService.js";
import { HttpError } from "../lib/httpError.js";
import { parseInput } from "../lib/validate.js";
import { getAuthUserId } from "../middleware/requireAuth.js";
import { deliveryAddressSchema, orderParamsSchema } from "../schemas/ordersSchemas.js";
import type { Request, Response } from "express";

export const createOrder = async (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const address = parseInput(deliveryAddressSchema, req.body);

  const created = await ordersService.createOrder(userId, address);

  if (created.status === "empty_cart") {
    throw new HttpError(400, "Your cart is empty");
  }

  if (created.status === "cart_changed") {
    // The cart changed at the same moment, e.g. "Place order" clicked twice.
    throw new HttpError(409, "Your cart changed while ordering. Please check it and try again.");
  }

  return res.status(201).json(created.order);
};

export const getOrders = async (req: Request, res: Response) => {
  const orders = await ordersService.getOrders(getAuthUserId(req));
  return res.status(200).json(orders);
};

export const getOrder = async (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const { orderId } = parseInput(orderParamsSchema, req.params);

  const order = await ordersService.getOrderById(userId, orderId);

  // 404 also for someone else's order, so we do not reveal that it exists.
  if (!order) {
    throw new HttpError(404, "Order not found");
  }

  return res.status(200).json(order);
};
