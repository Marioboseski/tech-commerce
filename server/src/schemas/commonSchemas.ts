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

const MAX_PAGE_SIZE = 100;

// ?page=2&pageSize=20 for admin tables. Both optional (page 1, 20 rows).
export const paginationFields = {
  page: z
    .string()
    .regex(/^\d+$/, "page must be a positive integer")
    .transform(Number)
    .pipe(z.number().min(1, "page must be a positive integer"))
    .default(1),
  pageSize: z
    .string()
    .regex(/^\d+$/, `pageSize must be between 1 and ${MAX_PAGE_SIZE}`)
    .transform(Number)
    .pipe(z.number().min(1).max(MAX_PAGE_SIZE, `pageSize must be between 1 and ${MAX_PAGE_SIZE}`))
    .default(20),
};
