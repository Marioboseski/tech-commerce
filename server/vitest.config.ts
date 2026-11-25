import { defineConfig } from "vitest/config";
import { testEnv } from "./tests/testEnv.js";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
    // Set before the app is loaded, so it never sees the values from .env.
    env: testEnv,
    globalSetup: ["./tests/globalSetup.ts"],
    setupFiles: ["./tests/setup.ts"],
    // All test files share one database, so they run one after another.
    fileParallelism: false,
    testTimeout: 15_000,
    hookTimeout: 30_000,
  },
});
