import "dotenv/config";
import jwt from "jsonwebtoken";
import type { CookieOptions } from "express";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Missing required environment variable: JWT_SECRET");
}

// Name of the cookie that carries the login token.
export const AUTH_COOKIE_NAME = "auth_token";

// How long a login lasts: 7 days, in milliseconds.
const AUTH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// What we put inside the token. Only ids, never personal data or passwords:
// a JWT is signed (cannot be changed) but NOT encrypted (anyone can read it).
export type AuthTokenPayload = {
  userId: number;
  role: "CUSTOMER" | "ADMIN";
};

export const signAuthToken = ({ userId, role }: AuthTokenPayload): string =>
  jwt.sign({ role }, JWT_SECRET, {
    // "sub" (subject) is the standard JWT field for "who this token is for".
    subject: String(userId),
    expiresIn: AUTH_TOKEN_MAX_AGE_MS / 1000,
  });

// Checks the signature and the expiry date.
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
  // JavaScript in the browser cannot read the cookie, so an injected
  // script cannot steal the token.
  httpOnly: true,
  // The browser does not send the cookie on requests started by other sites.
  sameSite: "lax",
  // Only over https in production (localhost has no https).
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export const authCookieOptions: CookieOptions = {
  ...clearAuthCookieOptions,
  maxAge: AUTH_TOKEN_MAX_AGE_MS,
};
