import * as adminOrdersService from "../services/adminOrdersService.js";
import { HttpError } from "../lib/httpError.js";
import { parseInput } from "../lib/validate.js";
import {
  adminOrderParamsSchema,
  adminOrdersQuerySchema,
  orderStatusSchema,
} from "../schemas/adminOrderSchemas.js";
import type { Request, Response } from "express";

export const listOrders = async (req: Request, res: Response) => {
  const filters = parseInput(adminOrdersQuerySchema, req.query);
  const result = await adminOrdersService.listOrders(filters);
  return res.status(200).json(result);
};

export const getOrder = async (req: Request, res: Response) => {
  const { orderId } = parseInput(adminOrderParamsSchema, req.params);
  const order = await adminOrdersService.getOrder(orderId);

  if (!order) {
    throw new HttpError(404, "Order not found");
  }

  return res.status(200).json(order);
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const { orderId } = parseInput(adminOrderParamsSchema, req.params);
  const { status } = parseInput(orderStatusSchema, req.body);

  const result = await adminOrdersService.updateOrderStatus(orderId, status);

  switch (result.status) {
    case "updated":
      return res.status(200).json(result.order);
    case "not_found":
      throw new HttpError(404, "Order not found");
    case "not_allowed":
      // 409 Conflict: the request is valid, but not for the order's current state.
      throw new HttpError(
        409,
        `A ${result.from.toLowerCase()} order cannot become ${status.toLowerCase()}`,
      );
    case "changed":
      throw new HttpError(409, "This order was just changed by someone else. Reload it and try again.");
  }
};
