import type { ApiUser, RegisterInput } from '../types/auth';

const API_URL = import.meta.env.VITE_API_URL;

// Creates a new account. Throws an Error with the server's message
// (e.g. "An account with this email already exists") when it fails.
export const registerUser = async (data: RegisterInput): Promise<ApiUser> => {
  if (!API_URL) {
    throw new Error('Missing VITE_API_URL environment variable');
  }

  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  // fetch does not throw on 400/409/500, so we check the status ourselves.
  if (!res.ok) {
    // The body may not be JSON (e.g. an HTML 500 page), so parsing can fail.
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `Registration failed: ${res.status}`);
  }

  return res.json();
};
