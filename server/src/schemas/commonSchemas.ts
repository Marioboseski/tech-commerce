import { z } from "zod";

// The biggest value of a MySQL INT column (our ids). A bigger number would
// make the database query fail with a 500 instead of a clear 400.
export const MAX_INT_ID = 2_147_483_647;

// For JSON bodies: "5" as text is not accepted.
export const idSchema = (name: string) =>
  z
    .number(`${name} must be a positive integer`)
    .int(`${name} must be a positive integer`)
    .min(1, `${name} must be a positive integer`)
    .max(MAX_INT_ID, `${name} is too big`);

// For URL and query values, which are always text.
// The regex stops " 5", "1e3", "0x10" and "-1", which Number() would accept.
export const idTextSchema = (name: string) =>
  z
    .string(`${name} must be a positive integer`)
    .regex(/^\d+$/, `${name} must be a positive integer`)
    .transform(Number)
    .pipe(idSchema(name));

export const requiredText = (name: string, maxLength: number) =>
  z
    .string(`${name} is required`)
    .trim()
    .min(1, `${name} is required`)
    .max(maxLength, `${name} can be at most ${maxLength} characters`);
