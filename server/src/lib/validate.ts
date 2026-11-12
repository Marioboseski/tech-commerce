import type { z } from "zod";
import { HttpError } from "./httpError.js";

// Checks `value` (req.body, req.params or req.query) against a Zod schema.
// - valid:   returns the cleaned value, with the right TypeScript type
//            (trimmed strings, numbers instead of "5", ...)
// - invalid: throws a 400 HttpError with one message per wrong field;
//            the global errorHandler sends it as
//            { message, errors: [{ field, message }] }
export const parseInput = <Schema extends z.ZodType>(
  schema: Schema,
  value: unknown,
): z.output<Schema> => {
  // A request without a JSON body has req.body === undefined.
  const result = schema.safeParse(value ?? {});

  if (result.success) {
    return result.data;
  }

  const errors = result.error.issues.map((issue) => ({
    // ["productId"] → "productId"; a problem with the whole object → "".
    field: issue.path.join("."),
    message: issue.message,
  }));

  // The first problem is also the main message, so a client that only
  // shows `message` still says something useful.
  throw new HttpError(400, errors[0]?.message ?? "Invalid request", errors);
};
