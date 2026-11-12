import { z } from 'zod';

// Same rules and messages as the server (server/src/schemas/authSchemas.ts).
// The client checks first, so the user sees mistakes without waiting for
// the server; the server still checks again, because the client can be
// changed or skipped (e.g. with Postman).
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'Full name is required')
    .max(100, 'Full name can be at most 100 characters'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .pipe(
      z
        .email('Email must be a valid email address')
        .max(255, 'Email can be at most 255 characters'),
    ),
  // Not trimmed: spaces can be part of a password.
  password: z
    .string()
    .min(
      MIN_PASSWORD_LENGTH,
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    )
    .max(
      MAX_PASSWORD_LENGTH,
      `Password can be at most ${MAX_PASSWORD_LENGTH} characters`,
    ),
});

// Login only checks that something was typed: the length rules are for
// choosing a new password, not for logging in.
export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});
