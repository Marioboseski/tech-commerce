import { prisma } from "../../src/lib/prisma.js";

// Empties every table (except Prisma's migration history), so each test
// starts from a known, empty database.
export const resetDatabase = async () => {
  const tables = await prisma.$queryRaw<{ name: string }[]>`
    SELECT TABLE_NAME AS name
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME <> '_prisma_migrations'
  `;

  // One transaction = one connection, so the foreign key switch applies to
  // all the deletes.
  await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 0");
    for (const { name } of tables) {
      await tx.$executeRawUnsafe(`DELETE FROM \`${name}\``);
    }
    await tx.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 1");
  });
};
