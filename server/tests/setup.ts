import { afterAll } from "vitest";
import { prisma } from "../src/lib/prisma.js";
import { assertTestDatabase } from "./testEnv.js";

// Runs in every test file, before it is loaded.
assertTestDatabase(process.env.DATABASE_URL);

afterAll(async () => {
  await prisma.$disconnect();
});
