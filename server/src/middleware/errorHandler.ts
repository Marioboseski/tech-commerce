import type { ErrorRequestHandler } from "express";
import { HttpError } from "../lib/httpError.js";
import { Prisma } from "../../generated/prisma/client.js";

// express.json() throws errors with a `type`, e.g. for broken JSON.
const isBodyParserError = (error: unknown): error is { type: string } =>
  typeof error === "object" &&
  error !== null &&
  "type" in error &&
  typeof error.type === "string";

// Prisma error codes we can explain to the user.
// https://www.prisma.io/docs/orm/reference/error-reference
const prismaErrors: Record<string, { status: number; message: string }> = {
  // Unique constraint failed (e.g. the same email twice at the same moment).
  P2002: { status: 409, message: "This already exists" },
  // Foreign key failed (e.g. deleting a user who still has orders).
  P2003: { status: 409, message: "This is still used by other data" },
  // Record to update or delete was not found.
  P2025: { status: 404, message: "Not found" },
};

// THE one place where every error ends up. Express knows this is an error
// handler because it has 4 parameters (error, req, res, next).
// Express 5 sends errors from async routes here by itself, so controllers
// do not need try/catch.
export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  // The answer was already (partly) sent, e.g. a stream broke halfway.
  // Then we cannot send JSON any more; let Express close the connection.
  if (res.headersSent) {
    return next(error);
  }

  // 1. Our own expected errors: throw new HttpError(404, "...").
  if (error instanceof HttpError) {
    return res.status(error.status).json({
      message: error.message,
      // Only add "errors" when there are field errors.
      ...(error.errors && { errors: error.errors }),
    });
  }

  // 2. Bad request body from express.json().
  if (isBodyParserError(error)) {
    if (error.type === "entity.parse.failed") {
      return res.status(400).json({ message: "Invalid JSON in request body" });
    }
    if (error.type === "entity.too.large") {
      return res.status(413).json({ message: "Request body is too large" });
    }
  }

  // 3. Known database errors.
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const known = prismaErrors[error.code];
    if (known) {
      return res.status(known.status).json({ message: known.message });
    }
  }

  // 4. Everything else is a bug or a broken database connection.
  // Log the full error for us in the terminal, but never send details
  // (stack trace, SQL, file paths) to the client: they help attackers.
  console.error(error);
  return res.status(500).json({ message: "Something went wrong" });
};
