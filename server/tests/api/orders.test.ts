import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../../src/lib/prisma.js";
import { resetDatabase } from "../helpers/database.js";
import { createProduct, deliveryAddress, signUp } from "../helpers/factories.js";

beforeEach(resetDatabase);

describe("placing an order", () => {
  it("calculates the totals on the server and adds shipping under 75 €", async () => {
    const { agent } = await signUp();
    const product = await createProduct({ price: 30 });
    await agent.post("/api/cart").send({ productId: product.id }).expect(200);
    await agent.post("/api/cart").send({ productId: product.id }).expect(200);

    const res = await agent.post("/api/orders").send(deliveryAddress);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      status: "PENDING",
      subtotal: 60,
      shippingCost: 9.9,
      total: 69.9,
    });
    expect(res.body.items).toEqual([
      expect.objectContaining({ productName: product.name, unitPrice: 30, quantity: 2 }),
    ]);
  });

  it("ships for free from 75 €", async () => {
    const { agent } = await signUp();
    const product = await createProduct({ price: 75 });
    await agent.post("/api/cart").send({ productId: product.id }).expect(200);

    const res = await agent.post("/api/orders").send(deliveryAddress);

    expect(res.body).toMatchObject({ subtotal: 75, shippingCost: 0, total: 75 });
  });

  it("ignores prices sent by the client", async () => {
    const { agent } = await signUp();
    const product = await createProduct({ price: 500 });
    await agent.post("/api/cart").send({ productId: product.id }).expect(200);

    const res = await agent
      .post("/api/orders")
      .send({ ...deliveryAddress, subtotal: 1, total: 1 });

    expect(res.body.total).toBe(500);
  });

  it("empties the cart after the order", async () => {
    const { agent } = await signUp();
    const product = await createProduct();
    await agent.post("/api/cart").send({ productId: product.id }).expect(200);

    await agent.post("/api/orders").send(deliveryAddress).expect(201);

    const cart = await agent.get("/api/cart");
    expect(cart.body).toEqual([]);
  });

  it("refuses an empty cart", async () => {
    const { agent } = await signUp();

    const res = await agent.post("/api/orders").send(deliveryAddress);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Your cart is empty");
  });

  it("does not order a product that was archived after it was put in the cart", async () => {
    const { agent } = await signUp();
    const product = await createProduct();
    await agent.post("/api/cart").send({ productId: product.id }).expect(200);
    await prisma.product.update({ where: { id: product.id }, data: { isActive: false } });

    const res = await agent.post("/api/orders").send(deliveryAddress);

    expect(res.status).toBe(400);
  });

  it("keeps the price from the moment of ordering", async () => {
    const { agent } = await signUp();
    const product = await createProduct({ price: 100 });
    await agent.post("/api/cart").send({ productId: product.id }).expect(200);
    const order = await agent.post("/api/orders").send(deliveryAddress).expect(201);

    await prisma.product.update({ where: { id: product.id }, data: { price: 999 } });

    const res = await agent.get(`/api/orders/${order.body.id}`);
    expect(res.body.items[0].unitPrice).toBe(100);
    expect(res.body.total).toBe(100);
  });
});

describe("reading orders", () => {
  it("answers 404 for someone else's order, so its existence stays hidden", async () => {
    const owner = await signUp();
    const stranger = await signUp();
    const product = await createProduct();
    await owner.agent.post("/api/cart").send({ productId: product.id }).expect(200);
    const order = await owner.agent.post("/api/orders").send(deliveryAddress).expect(201);

    const own = await owner.agent.get(`/api/orders/${order.body.id}`);
    const foreign = await stranger.agent.get(`/api/orders/${order.body.id}`);

    expect(own.status).toBe(200);
    expect(foreign.status).toBe(404);
  });
});
