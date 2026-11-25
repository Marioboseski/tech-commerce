import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../../src/app.js";
import { prisma } from "../../src/lib/prisma.js";
import { resetDatabase } from "../helpers/database.js";
import { signUp } from "../helpers/factories.js";

beforeEach(resetDatabase);

describe("routes that need a login", () => {
  it.each(["/api/cart", "/api/favorites", "/api/orders", "/api/admin/stats"])(
    "%s answers 401 for a guest",
    async (path) => {
      const res = await request(app).get(path);

      expect(res.status).toBe(401);
    },
  );
});

describe("admin routes", () => {
  it("answer 403 for a logged-in customer", async () => {
    const { agent } = await signUp();

    const res = await agent.get("/api/admin/stats");

    expect(res.status).toBe(403);
  });

  it("answer 200 for an admin", async () => {
    const { agent } = await signUp({ role: "ADMIN" });

    const res = await agent.get("/api/admin/stats");

    expect(res.status).toBe(200);
  });

  it("lock out a removed admin at once, even with a still valid login cookie", async () => {
    const { agent, email } = await signUp({ role: "ADMIN" });
    await agent.get("/api/admin/stats").expect(200);

    await prisma.user.update({ where: { email }, data: { role: "CUSTOMER" } });

    const res = await agent.get("/api/admin/stats");
    expect(res.status).toBe(403);
  });
});
