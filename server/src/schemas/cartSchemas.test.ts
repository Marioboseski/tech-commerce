import { describe, expect, it } from "vitest";
import { MAX_CART_QUANTITY, updateCartItemSchema } from "./cartSchemas.js";

describe("updateCartItemSchema", () => {
  it.each([1, 5, MAX_CART_QUANTITY])("accepts quantity %s", (quantity) => {
    expect(updateCartItemSchema.safeParse({ quantity }).success).toBe(true);
  });

  it.each([
    ["0 (removing is DELETE)", 0],
    ["more than the limit", MAX_CART_QUANTITY + 1],
    ["a decimal", 1.5],
    ["text", "2"],
  ])("refuses %s", (_case, quantity) => {
    expect(updateCartItemSchema.safeParse({ quantity }).success).toBe(false);
  });
});
