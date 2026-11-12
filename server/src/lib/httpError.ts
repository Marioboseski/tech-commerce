// One problem with one field, e.g. { field: "email", message: "..." }.
// Used for validation errors (Zod in the next step).
export type FieldError = {
  field: string;
  message: string;
};

// An EXPECTED error with an HTTP status, e.g. "Product not found" (404).
// Throw it anywhere in a route:  throw new HttpError(404, "Product not found")
// and the global errorHandler turns it into the JSON answer.
export class HttpError extends Error {
  readonly status: number;
  readonly errors: FieldError[] | undefined;

  constructor(status: number, message: string, errors?: FieldError[]) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.errors = errors;
  }
}
