import { ApiError, apiRequest } from '../lib/apiClient';
import type { ApiUser, LoginInput, RegisterInput } from '../types/auth';

// Creates a new account (does not log in).
export const registerUser = (data: RegisterInput) =>
  apiRequest<ApiUser>('/api/auth/register', { method: 'POST', body: data });

// Logs in. The server puts the login token in an httpOnly cookie;
// we only get the user back.
export const loginUser = (data: LoginInput) =>
  apiRequest<ApiUser>('/api/auth/login', { method: 'POST', body: data });

// Who is logged in? Resolves to null when nobody is (401).
export const getCurrentUser = async (): Promise<ApiUser | null> => {
  try {
    return await apiRequest<ApiUser>('/api/auth/me');
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
};

export const logoutUser = () =>
  apiRequest<void>('/api/auth/logout', { method: 'POST' });
