// Gives or removes the ADMIN role. This is the only way to create the first
// admin: the website never lets anyone register or promote themselves.
//
// The user must already have an account (register on the website first).
//
// Usage:
//   npm run admin:create -- marko@example.com
//   npm run admin:remove -- marko@example.com
import { prisma } from "../src/lib/prisma.js";

// The flag can come before or after the email (npm puts it first).
const args = process.argv.slice(2);
const remove = args.includes("--remove");
const email = args.find((arg) => !arg.startsWith("--"));

if (!email) {
  console.error("Usage: npm run admin:create -- <email>   (or admin:remove)");
  process.exit(1);
}

// Same normalization as register and login.
const normalizedEmail = email.trim().toLowerCase();

try {
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, fullName: true, role: true },
  });

  if (!user) {
    console.error(`No account with the email ${normalizedEmail}. Register on the website first.`);
    process.exitCode = 1;
  } else if (remove) {
    if (user.role !== "ADMIN") {
      console.log(`${user.fullName} is not an admin. Nothing changed.`);
    } else {
      // Never leave the shop without any admin.
      const admins = await prisma.user.count({ where: { role: "ADMIN" } });
      if (admins <= 1) {
        console.error("This is the last admin. Make someone else admin first.");
        process.exitCode = 1;
      } else {
        await prisma.user.update({ where: { id: user.id }, data: { role: "CUSTOMER" } });
        console.log(`${user.fullName} (${normalizedEmail}) is no longer an admin.`);
      }
    }
  } else if (user.role === "ADMIN") {
    console.log(`${user.fullName} is already an admin. Nothing changed.`);
  } else {
    await prisma.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
    console.log(`${user.fullName} (${normalizedEmail}) is now an admin.`);
  }
} finally {
  await prisma.$disconnect();
}
