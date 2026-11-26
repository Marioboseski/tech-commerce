import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../../src/lib/prisma.js";
import { resetDatabase } from "../helpers/database.js";
import { createProduct, deliveryAddress, signUp } from "../helpers/factories.js";

beforeEach(resetDatabase);

const shipment = { carrier: "DHL", trackingNumber: "1Z999AA10123456784" };

// A customer with one placed order, and an admin.
const setUp = async () => {
  const customer = await signUp();
  const admin = await signUp({ role: "ADMIN" });
  const product = await createProduct();
  await customer.agent.post("/api/cart").send({ productId: product.id }).expect(200);
  const order = await customer.agent.post("/api/orders").send(deliveryAddress).expect(201);

  const setStatus = (body: object) =>
    admin.agent.patch(`/api/admin/orders/${order.body.id}/status`).send(body);

  return { customer, admin, order: order.body, setStatus };
};

describe("order tracking", () => {
  it("starts a new order with a PENDING history entry and no shipment", async () => {
    const { order } = await setUp();

    expect(order).toMatchObject({ status: "PENDING", carrier: null, trackingNumber: null });
    expect(order.statusHistory).toEqual([
      { status: "PENDING", createdAt: expect.any(String) },
    ]);
  });

  it("records every step, and the customer sees the carrier and tracking number", async () => {
    const { customer, order, setStatus } = await setUp();

    await setStatus({ status: "PROCESSING" }).expect(200);
    await setStatus({ status: "SHIPPED", ...shipment }).expect(200);
    await setStatus({ status: "DELIVERED" }).expect(200);

    const res = await customer.agent.get(`/api/orders/${order.id}`).expect(200);

    expect(res.body).toMatchObject({ status: "DELIVERED", ...shipment });
    expect(res.body.statusHistory.map((step: { status: string }) => step.status)).toEqual([
      "PENDING",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
    ]);
  });

  it("shows the admin who made each change, but not the customer", async () => {
    const { customer, admin, order, setStatus } = await setUp();
    await setStatus({ status: "PROCESSING" }).expect(200);

    const adminView = await admin.agent.get(`/api/admin/orders/${order.id}`).expect(200);
    const customerView = await customer.agent.get(`/api/orders/${order.id}`).expect(200);

    expect(adminView.body.statusHistory[1]).toMatchObject({
      status: "PROCESSING",
      changedBy: { fullName: "Test User" },
    });
    expect(customerView.body.statusHistory[1]).not.toHaveProperty("changedBy");
  });

  it("refuses to ship without a tracking number and changes nothing", async () => {
    const { order, setStatus } = await setUp();
    await setStatus({ status: "PROCESSING" }).expect(200);

    const res = await setStatus({ status: "SHIPPED", carrier: "DHL" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Enter a tracking number");

    const saved = await prisma.order.findUniqueOrThrow({
      where: { id: order.id },
      select: { status: true, _count: { select: { statusHistory: true } } },
    });
    expect(saved).toEqual({ status: "PROCESSING", _count: { statusHistory: 2 } });
  });

  it("does not skip the PROCESSING step", async () => {
    const { setStatus } = await setUp();

    const res = await setStatus({ status: "SHIPPED", ...shipment });

    expect(res.status).toBe(409);
  });

  it("can still cancel an order while it is being processed", async () => {
    const { setStatus } = await setUp();
    await setStatus({ status: "PROCESSING" }).expect(200);

    const res = await setStatus({ status: "CANCELLED" });

    expect(res.status).toBe(200);
    expect(res.body.nextStatuses).toEqual([]);
  });
});
