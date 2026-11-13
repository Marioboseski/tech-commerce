import type { ErrorRequestHandler } from "express";
import multer from "multer";
import { HttpError } from "../lib/httpError.js";
import { MAX_UPLOAD_BYTES } from "../lib/productImages.js";
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

// Must have 4 parameters, so Express treats it as the error handler.
// Express 5 forwards errors from async routes here, so controllers need
// no try/catch.
export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  // Too late for a JSON answer (already partly sent): let Express close it.
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof HttpError) {
    return res.status(error.status).json({
      message: error.message,
      ...(error.errors && { errors: error.errors }),
    });
  }

  if (isBodyParserError(error)) {
    if (error.type === "entity.parse.failed") {
      return res.status(400).json({ message: "Invalid JSON in request body" });
    }
    if (error.type === "entity.too.large") {
      return res.status(413).json({ message: "Request body is too large" });
    }
  }

  // File uploads (multer): too big, too many files, wrong field name.
  if (error instanceof multer.MulterError) {
    const tooLarge = error.code === "LIMIT_FILE_SIZE";
    const message = tooLarge
      ? `The image can be at most ${MAX_UPLOAD_BYTES / 1024 / 1024} MB`
      : 'Send exactly one image in the field "image"';
    return res.status(tooLarge ? 413 : 400).json({
      message,
      errors: [{ field: "image", message }],
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const known = prismaErrors[error.code];
    if (known) {
      return res.status(known.status).json({ message: known.message });
    }
  }

  // A bug or a broken database connection: log it for us, but never send
  // details (stack trace, SQL, file paths) to the client.
  console.error(error);
  return res.status(500).json({ message: "Something went wrong" });
};
