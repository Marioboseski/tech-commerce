import type { RequestHandler } from "express";
import { HttpError } from "../lib/httpError.js";

// Runs only when no route above matched, e.g. GET /api/nope.
// Without it Express answers with an HTML page instead of JSON.
export const notFound: RequestHandler = (req) => {
  throw new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`);
};
