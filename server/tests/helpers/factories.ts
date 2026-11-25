import request from "supertest";
import { app } from "../../src/app.js";
import { prisma } from "../../src/lib/prisma.js";

// Small helpers that create test data, so every test only shows what matters.

let counter = 0;
const next = () => ++counter;

export const TEST_PASSWORD = "Password123";

export const createProduct = async ({
  price = 100,
  isActive = true,
}: { price?: number; isActive?: boolean } = {}) => {
  const category = await prisma.category.upsert({
    where: { slug: "laptops" },
    update: {},
    create: { name: "Laptops", slug: "laptops" },
  });
  const n = next();

  return prisma.product.create({
    data: {
      sku: `TEST-${n}`,
      name: `Test laptop ${n}`,
      description: "A product created by the tests",
      price,
      isActive,
      categoryId: category.id,
    },
  });
};

// Registers and logs in through the real API. The returned agent keeps the
// login cookie, like a browser, so later requests are made as this user.
export const signUp = async ({ role = "CUSTOMER" }: { role?: "CUSTOMER" | "ADMIN" } = {}) => {
  const email = `user${next()}@example.com`;
  const agent = request.agent(app);

  await agent
    .post("/api/auth/register")
    .send({ fullName: "Test User", email, password: TEST_PASSWORD })
    .expect(201);

  if (role === "ADMIN") {
    await prisma.user.update({ where: { email }, data: { role: "ADMIN" } });
  }

  await agent.post("/api/auth/login").send({ email, password: TEST_PASSWORD }).expect(200);

  return { agent, email };
};

export const deliveryAddress = {
  fullName: "Test User",
  street: "Test Street 1",
  city: "Skopje",
  postalCode: "1000",
};
