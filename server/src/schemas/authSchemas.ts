import { z } from "zod";
import { requiredText } from "./commonSchemas.js";

const MIN_PASSWORD_LENGTH = 8;
// bcrypt only uses the first 72 bytes of a password.
const MAX_PASSWORD_LENGTH = 72;

// Lower case first, so Marko@Gmail.com and marko@gmail.com are one account.
const emailSchema = z
  .string("Email is required")
  .trim()
  .toLowerCase()
  .pipe(
    z
      .email("Email must be a valid email address")
      .max(255, "Email can be at most 255 characters"),
  );

// z.object drops unknown keys, so a client cannot send role, id, etc.
export const registerSchema = z.object({
  fullName: requiredText("Full name", 100),
  email: emailSchema,
  // Not trimmed: spaces can be part of a password.
  password: z
    .string("Password is required")
    .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
    .max(MAX_PASSWORD_LENGTH, `Password can be at most ${MAX_PASSWORD_LENGTH} characters`),
});

// No length rules on login: we only compare with the saved hash.
export const loginSchema = z.object({
  email: z
    .string("Email is required")
    .trim()
    .toLowerCase()
    .min(1, "Email is required"),
  password: z.string("Password is required").min(1, "Password is required"),
});
