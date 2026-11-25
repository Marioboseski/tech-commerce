import { describe, expect, it } from "vitest";
import { registerSchema } from "./authSchemas.js";

const valid = { fullName: "Marko Petrov", email: "marko@example.com", password: "Password123" };

describe("registerSchema", () => {
  it("trims and lower-cases the email, so one person has one account", () => {
    const result = registerSchema.parse({ ...valid, email: "  Marko@Example.COM " });

    expect(result.email).toBe("marko@example.com");
  });

  it("drops fields the client must not set, such as the role", () => {
    const result = registerSchema.parse({ ...valid, role: "ADMIN", id: 1 });

    expect(result).toEqual(valid);
  });

  it("keeps spaces in the password", () => {
    const result = registerSchema.parse({ ...valid, password: " pass word " });

    expect(result.password).toBe(" pass word ");
  });

  it.each([
    ["shorter than 8 characters", "short12"],
    ["longer than 72 characters (bcrypt limit)", "a".repeat(73)],
  ])("refuses a password %s", (_case, password) => {
    expect(registerSchema.safeParse({ ...valid, password }).success).toBe(false);
  });

  it("refuses an invalid email", () => {
    const result = registerSchema.safeParse({ ...valid, email: "not-an-email" });

    expect(result.success).toBe(false);
  });
});
