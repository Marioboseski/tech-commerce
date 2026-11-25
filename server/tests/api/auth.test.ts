import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../../src/app.js";
import { resetDatabase } from "../helpers/database.js";
import { TEST_PASSWORD, signUp } from "../helpers/factories.js";

beforeEach(resetDatabase);

const newUser = { fullName: "Ana Test", email: "ana@example.com", password: TEST_PASSWORD };

describe("POST /api/auth/register", () => {
  it("creates a customer and never returns the password hash", async () => {
    const res = await request(app).post("/api/auth/register").send(newUser);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ fullName: "Ana Test", email: "ana@example.com", role: "CUSTOMER" });
    expect(res.body).not.toHaveProperty("passwordHash");
  });

  it("ignores a role sent by the client", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...newUser, role: "ADMIN" });

    expect(res.status).toBe(201);
    expect(res.body.role).toBe("CUSTOMER");
  });

  it("refuses the same email twice, even in other letter case", async () => {
    await request(app).post("/api/auth/register").send(newUser).expect(201);

    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...newUser, email: "ANA@example.com" });

    expect(res.status).toBe(409);
  });

  it("answers 400 with field errors for invalid input", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...newUser, password: "short" });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual([
      { field: "password", message: "Password must be at least 8 characters" },
    ]);
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send(newUser).expect(201);
  });

  it("sets an httpOnly login cookie and does not put the token in the body", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: newUser.email, password: TEST_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.headers["set-cookie"]?.[0]).toMatch(/^auth_token=.+HttpOnly/);
    expect(res.body).not.toHaveProperty("token");
  });

  it("gives the same answer for a wrong password and an unknown email", async () => {
    const wrongPassword = await request(app)
      .post("/api/auth/login")
      .send({ email: newUser.email, password: "WrongPassword1" });
    const unknownEmail = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: TEST_PASSWORD });

    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.body).toEqual(unknownEmail.body);
  });
});

describe("GET /api/auth/me and POST /api/auth/logout", () => {
  it("knows the logged-in user until they log out", async () => {
    const { agent, email } = await signUp();

    const me = await agent.get("/api/auth/me");
    expect(me.status).toBe(200);
    expect(me.body.email).toBe(email);

    await agent.post("/api/auth/logout").expect(204);

    const afterLogout = await agent.get("/api/auth/me");
    expect(afterLogout.status).toBe(401);
  });

  it("answers 401 without a login cookie", async () => {
    const res = await request(app).get("/api/auth/me");

    expect(res.status).toBe(401);
  });
});
