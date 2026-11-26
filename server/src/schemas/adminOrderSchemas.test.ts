import { describe, expect, it } from "vitest";
import { orderStatusSchema } from "./adminOrderSchemas.js";

const messages = (value: unknown) =>
  orderStatusSchema.safeParse(value).error?.issues.map((issue) => issue.message) ?? [];

describe("orderStatusSchema", () => {
  it("accepts a shipped order with carrier and tracking number, trimmed", () => {
    const result = orderStatusSchema.parse({
      status: "SHIPPED",
      carrier: "DHL",
      trackingNumber: "  1Z999AA10123456784  ",
    });

    expect(result).toEqual({
      status: "SHIPPED",
      carrier: "DHL",
      trackingNumber: "1Z999AA10123456784",
    });
  });

  it("requires a carrier and a tracking number for a shipped order", () => {
    expect(messages({ status: "SHIPPED" })).toEqual([
      "Choose a carrier",
      "Enter a tracking number",
    ]);
  });

  it("does not accept a blank tracking number", () => {
    expect(messages({ status: "SHIPPED", carrier: "UPS", trackingNumber: "   " })).toEqual([
      "Enter a tracking number",
    ]);
  });

  it("refuses an unknown carrier", () => {
    expect(messages({ status: "SHIPPED", carrier: "POST", trackingNumber: "123" })).toEqual([
      "carrier must be DHL, UPS, FEDEX, MK_POST or OTHER",
    ]);
  });

  it("does not take a carrier for any other status", () => {
    expect(messages({ status: "PROCESSING", carrier: "DHL" })).toEqual([
      "Carrier and tracking number are only set when an order is shipped",
    ]);
  });

  it("accepts the other statuses on their own", () => {
    expect(orderStatusSchema.safeParse({ status: "PROCESSING" }).success).toBe(true);
  });
});
