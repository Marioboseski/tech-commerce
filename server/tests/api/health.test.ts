import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../../src/app.js";
import { resetDatabase } from "../helpers/database.js";

beforeEach(resetDatabase);

describe("GET /api/health", () => {
  it("answers ok when the database is reachable", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("unknown API routes", () => {
  it("answer 404 with a JSON message", async () => {
    const res = await request(app).get("/api/does-not-exist");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Route not found: GET /api/does-not-exist" });
  });
});
