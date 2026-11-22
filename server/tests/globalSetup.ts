import { execSync } from "node:child_process";
import { assertTestDatabase, testEnv } from "./testEnv.js";

// Runs once before all tests: brings the test database up to the latest
// migrations, exactly like production does on start.
export default function setup() {
  assertTestDatabase(testEnv.DATABASE_URL);
  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: { ...process.env, ...testEnv },
  });
}
