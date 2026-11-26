import { describe, expect, it } from "vitest";
import { canChangeOrderStatus } from "./orderStatus.js";

describe("canChangeOrderStatus", () => {
  it.each([
    ["PENDING", "PROCESSING"],
    ["PENDING", "CANCELLED"],
    ["PROCESSING", "SHIPPED"],
    ["PROCESSING", "CANCELLED"],
    ["SHIPPED", "DELIVERED"],
  ] as const)("allows %s -> %s", (from, to) => {
    expect(canChangeOrderStatus(from, to)).toBe(true);
  });

  it.each([
    ["PENDING", "SHIPPED"],
    ["PENDING", "DELIVERED"],
    ["PROCESSING", "PENDING"],
    ["PROCESSING", "DELIVERED"],
    ["SHIPPED", "CANCELLED"],
    ["SHIPPED", "PROCESSING"],
    ["DELIVERED", "CANCELLED"],
    ["DELIVERED", "PENDING"],
    ["CANCELLED", "PENDING"],
    ["CANCELLED", "PROCESSING"],
  ] as const)("refuses %s -> %s", (from, to) => {
    expect(canChangeOrderStatus(from, to)).toBe(false);
  });
});
