// Environment for the automated tests. The tests create and delete data, so
// they must never run against the development or production database.

// Local default: the MySQL from compose.test.yaml. CI sets TEST_DATABASE_URL.
const databaseUrl =
  process.env.TEST_DATABASE_URL ?? "mysql://root:test@localhost:3308/tech_commerce_test";

export const testEnv = {
  DATABASE_URL: databaseUrl,
  JWT_SECRET: "test-secret-only-for-automated-tests",
  IMAGE_BASE_URL: "http://localhost:5000/images",
  CLIENT_URL: "http://localhost:5173",
};

// Safety net: refuse to run when the database name does not end with "_test".
export const assertTestDatabase = (url: string | undefined) => {
  const name = url ? new URL(url).pathname.slice(1) : "";
  if (!name.endsWith("_test")) {
    throw new Error(
      `Tests must use a database whose name ends with "_test" (got "${name}"). ` +
        "They delete all data before each test.",
    );
  }
};
