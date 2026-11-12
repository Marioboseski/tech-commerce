export type FieldError = {
  field: string;
  message: string;
};

// An expected error with an HTTP status, e.g. 404 "Product not found".
// The global errorHandler turns it into the JSON response.
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
