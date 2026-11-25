import { beforeEach, describe, expect, it } from "vitest";
import { MAX_CART_QUANTITY } from "../../src/schemas/cartSchemas.js";
import { resetDatabase } from "../helpers/database.js";
import { createProduct, signUp } from "../helpers/factories.js";

beforeEach(resetDatabase);

describe("cart", () => {
  it("adds a product and raises the quantity when it is added again", async () => {
    const { agent } = await signUp();
    const product = await createProduct();

    await agent.post("/api/cart").send({ productId: product.id }).expect(200);
    const res = await agent.post("/api/cart").send({ productId: product.id });

    expect(res.body).toEqual({ productId: product.id, quantity: 2 });
  });

  it(`stops at ${MAX_CART_QUANTITY} pieces of one product`, async () => {
    const { agent } = await signUp();
    const product = await createProduct();

    for (let i = 0; i < MAX_CART_QUANTITY; i++) {
      await agent.post("/api/cart").send({ productId: product.id }).expect(200);
    }
    const res = await agent.post("/api/cart").send({ productId: product.id });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(`You can add at most ${MAX_CART_QUANTITY} of one product`);
  });

  it("refuses a product that does not exist or is archived", async () => {
    const { agent } = await signUp();
    const archived = await createProduct({ isActive: false });

    const missing = await agent.post("/api/cart").send({ productId: 999999 });
    const hidden = await agent.post("/api/cart").send({ productId: archived.id });

    expect(missing.status).toBe(404);
    expect(hidden.status).toBe(404);
  });

  it("refuses a quantity above the limit", async () => {
    const { agent } = await signUp();
    const product = await createProduct();
    await agent.post("/api/cart").send({ productId: product.id }).expect(200);

    const res = await agent
      .patch(`/api/cart/${product.id}`)
      .send({ quantity: MAX_CART_QUANTITY + 1 });

    expect(res.status).toBe(400);
  });

  it("keeps every user's cart separate", async () => {
    const first = await signUp();
    const second = await signUp();
    const product = await createProduct();
    await first.agent.post("/api/cart").send({ productId: product.id }).expect(200);

    const res = await second.agent.get("/api/cart");

    expect(res.body).toEqual([]);
  });
});
