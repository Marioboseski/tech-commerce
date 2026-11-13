const API_URL = import.meta.env.VITE_API_URL;

export type FieldError = {
  field: string;
  message: string;
};

export class ApiError extends Error {
  readonly status: number;
  readonly errors: FieldError[];

  constructor(status: number, message: string, errors: FieldError[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
};

// The only function that talks to the API; every services/*Api.ts uses it.
export const apiRequest = async <T>(
  path: string,
  { method = 'GET', body }: ApiRequestOptions = {},
): Promise<T> => {
  if (!API_URL) {
    throw new Error('Missing VITE_API_URL environment variable');
  }

  // Files are sent as FormData. The browser then sets the Content-Type
  // itself (multipart/form-data with a "boundary"), so we must not set it.
  const requestBody =
    body === undefined
      ? {}
      : body instanceof FormData
        ? { body }
        : {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          };

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      credentials: 'include',
      ...requestBody,
    });
  } catch {
    // fetch itself only fails when there is no answer at all:
    // the server is down, no internet, CORS blocked... Status 0 = "no answer".
    throw new ApiError(0, 'Cannot reach the server. Please try again.');
  }

  if (!res.ok) {
    // Our server always answers { message, errors? }. The body may still not
    // be JSON (e.g. a proxy error page), so parsing can fail.
    const data = await res.json().catch(() => null);
    throw new ApiError(
      res.status,
      data?.message ?? `Request failed (${res.status})`,
      Array.isArray(data?.errors) ? data.errors : [],
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
};
