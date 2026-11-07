import bcrypt from "bcryptjs";
import { signAuthToken } from "../lib/authToken.js";
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

type LoginInput = {
  email: string;
  password: string;
};

// A real bcrypt hash of a random value. Used when the email does not exist,
// so the answer takes as long as for a wrong password and an attacker
// cannot guess from the response time which emails are registered.
const DUMMY_PASSWORD_HASH = bcrypt.hashSync(crypto.randomUUID(), PASSWORD_SALT_ROUNDS);

// Checks email + password and creates a login token.
// Returns null when the email or the password is wrong.
export const loginUser = async ({ email, password }: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { ...publicUserSelect, passwordHash: true },
  });

  const passwordMatches = await bcrypt.compare(
    password,
    user?.passwordHash ?? DUMMY_PASSWORD_HASH,
  );

  if (!user || !passwordMatches) {
    return null;
  }

  // Take passwordHash out so it is never sent to the client.
  const { passwordHash: _passwordHash, ...publicUser } = user;
  const token = signAuthToken({ userId: user.id, role: user.role });

  return { user: publicUser, token };
};
