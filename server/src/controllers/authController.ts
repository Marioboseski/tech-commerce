import * as authService from "../services/authService.js";
import { AUTH_COOKIE_NAME, authCookieOptions, clearAuthCookieOptions } from "../lib/authToken.js";
import type { Request, Response } from "express";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FULL_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 255;
const MIN_PASSWORD_LENGTH = 8;
// bcrypt only uses the first 72 bytes of a password.
const MAX_PASSWORD_LENGTH = 72;

export const register = async (req: Request, res: Response) => {
  // req.body is undefined when the request has no JSON body.
  const { fullName, email, password } = req.body ?? {};

  if (typeof fullName !== "string" || typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({
      message: "fullName, email and password are required"
    })
  }

  const normalizedFullName = fullName.trim();
  // Marko@Gmail.com and marko@gmail.com are the same account.
  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedFullName.length === 0 || normalizedFullName.length > MAX_FULL_NAME_LENGTH) {
    return res.status(400).json({
      message: `fullName must be between 1 and ${MAX_FULL_NAME_LENGTH} characters`
    })
  }

  if (!EMAIL_PATTERN.test(normalizedEmail) || normalizedEmail.length > MAX_EMAIL_LENGTH) {
    return res.status(400).json({
      message: "email must be a valid email address"
    })
  }

  if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    return res.status(400).json({
      message: `password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters`
    })
  }

  const user = await authService.registerUser({
    fullName: normalizedFullName,
    email: normalizedEmail,
    password,
  });

  if (!user) {
    return res.status(409).json({
      message: "An account with this email already exists"
    })
  }

  return res.status(201).json(user);
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};

  if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
    return res.status(400).json({
      message: "email and password are required"
    })
  }

  const result = await authService.loginUser({
    // Same normalization as register, so Marko@Gmail.com can log in.
    email: email.trim().toLowerCase(),
    password,
  });

  // Same message for "no such email" and "wrong password", so nobody can
  // find out which emails have an account.
  if (!result) {
    return res.status(401).json({
      message: "Email or password is incorrect"
    })
  }

  res.cookie(AUTH_COOKIE_NAME, result.token, authCookieOptions);
  // The token is only in the httpOnly cookie, never in the JSON body.
  return res.status(200).json(result.user);
}

// Runs after requireAuth, which sets req.auth.
export const me = async (req: Request, res: Response) => {
  // The token only has the id, so we load fresh data (name, email...)
  // from the database.
  const user = req.auth ? await authService.getUserById(req.auth.userId) : null;

  // No req.auth (route without requireAuth) or the account no longer exists.
  if (!user) {
    res.clearCookie(AUTH_COOKIE_NAME, clearAuthCookieOptions);
    return res.status(401).json({ message: "Not logged in" });
  }

  return res.status(200).json(user);
}

// Works even without a cookie, so logging out twice is not an error.
export const logout = (_req: Request, res: Response) => {
  res.clearCookie(AUTH_COOKIE_NAME, clearAuthCookieOptions);
  // 204 = success, no body to send back.
  return res.status(204).end();
}
