import "dotenv/config";
import jwt from "jsonwebtoken";
import type { CookieOptions } from "express";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Missing required environment variable: JWT_SECRET");
}

export const AUTH_COOKIE_NAME = "auth_token";

const AUTH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// Only ids, never personal data: a JWT is signed (cannot be changed) but
// NOT encrypted (anyone can read it).
export type AuthTokenPayload = {
  userId: number;
  role: "CUSTOMER" | "ADMIN";
};

export const signAuthToken = ({ userId, role }: AuthTokenPayload): string =>
  jwt.sign({ role }, JWT_SECRET, {
    // "sub" is the standard JWT field for who the token belongs to.
    subject: String(userId),
    expiresIn: AUTH_TOKEN_MAX_AGE_MS / 1000,
  });

// Returns null when the token is fake, changed or expired.
export const verifyAuthToken = (token: string): AuthTokenPayload | null => {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (typeof payload === "string") {
      return null;
    }

    const userId = Number(payload.sub);
    const { role } = payload;
    if (!Number.isInteger(userId) || (role !== "CUSTOMER" && role !== "ADMIN")) {
      return null;
    }

    return { userId, role };
  } catch {
    // jwt.verify throws for a bad signature or an expired token.
    return null;
  }
};

// clearCookie must get the same options (except maxAge) as when the cookie
// was set, otherwise the browser treats it as a different cookie.
export const clearAuthCookieOptions: CookieOptions = {
  // Browser JavaScript cannot read it, so an injected script cannot steal it.
  httpOnly: true,
  // Not sent on requests started by other sites (CSRF protection).
  sameSite: "lax",
  // https only in production; localhost has no https.
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export const authCookieOptions: CookieOptions = {
  ...clearAuthCookieOptions,
  maxAge: AUTH_TOKEN_MAX_AGE_MS,
};
