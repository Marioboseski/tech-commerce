import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client.js";

const getRequiredEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const databaseUrl = new URL(getRequiredEnv("DATABASE_URL"));

if (databaseUrl.protocol !== "mysql:") {
  throw new Error("DATABASE_URL must use the mysql:// protocol");
}

const databaseName = databaseUrl.pathname.slice(1);

if (!databaseName) {
  throw new Error("DATABASE_URL must include a database name");
}

const adapter = new PrismaMariaDb({
  host: databaseUrl.hostname,
  port: Number(databaseUrl.port || 3306),
  user: decodeURIComponent(databaseUrl.username),
  password: decodeURIComponent(databaseUrl.password),
  database: databaseName,
  connectionLimit: 5,
});

export const prisma = new PrismaClient({ adapter });
