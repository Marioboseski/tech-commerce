import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";

// How many times bcrypt repeats its work; higher is slower for attackers.
const PASSWORD_SALT_ROUNDS = 12;

// Only what the user decides. id, role, createdAt and updatedAt are set by
// the database / Prisma, never by the client.
type RegisterInput = {
  fullName: string;
  email: string;
  password: string;
};

// Fields that are safe to send to the client (never passwordHash).
const publicUserSelect = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  createdAt: true,
} as const;

// Creates a user with a hashed password.
// Returns null when the email is already registered.
export const registerUser = async ({ fullName, email, password }: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return null;
  }

  const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

  return prisma.user.create({
    data: { fullName, email, passwordHash },
    select: publicUserSelect,
  });
};
