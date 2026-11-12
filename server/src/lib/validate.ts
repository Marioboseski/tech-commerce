import type { z } from "zod";
import { HttpError } from "./httpError.js";

// Returns the parsed (typed, trimmed) value, or throws a 400 HttpError
// with one { field, message } per invalid field.
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
    field: issue.path.join("."),
    message: issue.message,
  }));

  // The first problem is also the main message, so a client that only
  // shows `message` still says something useful.
  throw new HttpError(400, errors[0]?.message ?? "Invalid request", errors);
};
