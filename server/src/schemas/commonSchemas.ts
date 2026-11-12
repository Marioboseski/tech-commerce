import { z } from "zod";

// The biggest value of a MySQL INT column (our ids). A bigger number would
// make the database query fail with a 500 instead of a clear 400.
export const MAX_INT_ID = 2_147_483_647;

// An id sent as a JSON number in the body: { "productId": 5 }.
// "5" (text) is NOT accepted, like before.
export const idSchema = (name: string) =>
  z
    .number(`${name} must be a positive integer`)
    .int(`${name} must be a positive integer`)
    .min(1, `${name} must be a positive integer`)
    .max(MAX_INT_ID, `${name} is too big`);

// An id from the URL or the query string. These are always text ("5"),
// so: only digits → turn into a number → same checks as above.
// The regex stops " 5", "1e3", "0x10" and "-1", which Number() would accept.
export const idTextSchema = (name: string) =>
  z
    .string(`${name} must be a positive integer`)
    .regex(/^\d+$/, `${name} must be a positive integer`)
    .transform(Number)
    .pipe(idSchema(name));

// Text that must not be empty after trimming and has a maximum length
// (the size of the database column).
export const requiredText = (name: string, maxLength: number) =>
  z
    .string(`${name} is required`)
    .trim()
    .min(1, `${name} is required`)
    .max(maxLength, `${name} can be at most ${maxLength} characters`);
