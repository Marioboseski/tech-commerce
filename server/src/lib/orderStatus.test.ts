import { describe, expect, it } from "vitest";
import { canChangeOrderStatus } from "./orderStatus.js";

describe("canChangeOrderStatus", () => {
  it.each([
    ["PENDING", "SHIPPED"],
    ["PENDING", "CANCELLED"],
    ["SHIPPED", "DELIVERED"],
  ] as const)("allows %s -> %s", (from, to) => {
    expect(canChangeOrderStatus(from, to)).toBe(true);
  });

  it.each([
    ["PENDING", "DELIVERED"],
    ["SHIPPED", "CANCELLED"],
    ["SHIPPED", "PENDING"],
    ["DELIVERED", "CANCELLED"],
    ["DELIVERED", "PENDING"],
    ["CANCELLED", "PENDING"],
    ["CANCELLED", "SHIPPED"],
  ] as const)("refuses %s -> %s", (from, to) => {
    expect(canChangeOrderStatus(from, to)).toBe(false);
  });
});
