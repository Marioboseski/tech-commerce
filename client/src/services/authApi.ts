import type { ApiUser, LoginInput, RegisterInput } from '../types/auth';

const API_URL = import.meta.env.VITE_API_URL;

// One place for all auth requests.
// credentials: 'include' tells the browser to send and accept the httpOnly
// login cookie, even though the API is on another port (5000 vs 5173).
const authRequest = async (path: string, init: RequestInit = {}) => {
  if (!API_URL) {
    throw new Error('Missing VITE_API_URL environment variable');
  }

  return fetch(`${API_URL}/api/auth${path}`, {
    ...init,
    credentials: 'include',
  });
};

// fetch does not throw on 400/401/409/500, so we turn them into an Error
// with the server's message (e.g. "Email or password is incorrect").
const throwServerError = async (res: Response, fallback: string) => {
  // The body may not be JSON (e.g. an HTML 500 page), so parsing can fail.
  const body = await res.json().catch(() => null);
  throw new Error(body?.message ?? `${fallback}: ${res.status}`);
};

const jsonBody = (data: unknown): RequestInit => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});

// Creates a new account (does not log in).
export const registerUser = async (data: RegisterInput): Promise<ApiUser> => {
  const res = await authRequest('/register', jsonBody(data));
  if (!res.ok) {
    await throwServerError(res, 'Registration failed');
  }
  return res.json();
};

// Logs in. The server puts the login token in an httpOnly cookie;
// we only get the user back.
export const loginUser = async (data: LoginInput): Promise<ApiUser> => {
  const res = await authRequest('/login', jsonBody(data));
  if (!res.ok) {
    await throwServerError(res, 'Login failed');
  }
  return res.json();
};

// Who is logged in? Resolves to null when nobody is (401).
export const getCurrentUser = async (): Promise<ApiUser | null> => {
  const res = await authRequest('/me');
  if (res.status === 401) {
    return null;
  }
  if (!res.ok) {
    await throwServerError(res, 'Failed to load current user');
  }
  return res.json();
};

// Asks the server to delete the login cookie.
export const logoutUser = async (): Promise<void> => {
  const res = await authRequest('/logout', { method: 'POST' });
  if (!res.ok) {
    await throwServerError(res, 'Logout failed');
  }
};
