import { z } from "zod";
import { requiredText } from "./commonSchemas.js";

const MIN_PASSWORD_LENGTH = 8;
// bcrypt only uses the first 72 bytes of a password.
const MAX_PASSWORD_LENGTH = 72;

// trim + lower case first, so Marko@Gmail.com and marko@gmail.com are the
// same account; then check that it looks like an email.
const emailSchema = z
  .string("Email is required")
  .trim()
  .toLowerCase()
  .pipe(
    z
      .email("Email must be a valid email address")
      .max(255, "Email can be at most 255 characters"),
  );

// POST /api/auth/register
// Only these 3 fields are kept: role, id, createdAt... from the client are
// silently dropped, because z.object ignores unknown keys.
export const registerSchema = z.object({
  fullName: requiredText("Full name", 100),
  email: emailSchema,
  // Not trimmed: spaces can be part of a password.
  password: z
    .string("Password is required")
    .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
    .max(MAX_PASSWORD_LENGTH, `Password can be at most ${MAX_PASSWORD_LENGTH} characters`),
});

// POST /api/auth/login
// No length rules here: we only compare with the saved hash.
export const loginSchema = z.object({
  email: z
    .string("Email is required")
    .trim()
    .toLowerCase()
    .min(1, "Email is required"),
  password: z.string("Password is required").min(1, "Password is required"),
});
