import * as authService from "../services/authService.js";
import { AUTH_COOKIE_NAME, authCookieOptions, clearAuthCookieOptions } from "../lib/authToken.js";
import { HttpError } from "../lib/httpError.js";
import { parseInput } from "../lib/validate.js";
import { loginSchema, registerSchema } from "../schemas/authSchemas.js";
import type { Request, Response } from "express";

// POST /api/auth/register   body: { fullName, email, password }
export const register = async (req: Request, res: Response) => {
  // Already trimmed, email in lower case; role etc. from the client dropped.
  const input = parseInput(registerSchema, req.body);

  const user = await authService.registerUser(input);

  if (!user) {
    throw new HttpError(409, "An account with this email already exists");
  }

  return res.status(201).json(user);
};

// POST /api/auth/login   body: { email, password }
export const login = async (req: Request, res: Response) => {
  const input = parseInput(loginSchema, req.body);

  const result = await authService.loginUser(input);

  // Same message for "no such email" and "wrong password", so nobody can
  // find out which emails have an account.
  if (!result) {
    throw new HttpError(401, "Email or password is incorrect");
  }

  res.cookie(AUTH_COOKIE_NAME, result.token, authCookieOptions);
  // The token is only in the httpOnly cookie, never in the JSON body.
  return res.status(200).json(result.user);
};

// Runs after requireAuth, which sets req.auth.
export const me = async (req: Request, res: Response) => {
  // The token only has the id, so we load fresh data (name, email...)
  // from the database.
  const user = req.auth ? await authService.getUserById(req.auth.userId) : null;

  // No req.auth (route without requireAuth) or the account no longer exists.
  if (!user) {
    res.clearCookie(AUTH_COOKIE_NAME, clearAuthCookieOptions);
    throw new HttpError(401, "Not logged in");
  }

  return res.status(200).json(user);
};

// Works even without a cookie, so logging out twice is not an error.
export const logout = (_req: Request, res: Response) => {
  res.clearCookie(AUTH_COOKIE_NAME, clearAuthCookieOptions);
  // 204 = success, no body to send back.
  return res.status(204).end();
};
