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
type AuthTokenPayload = {
  userId: number;
  role: "CUSTOMER" | "ADMIN";
};

export const signAuthToken = ({ userId, role }: AuthTokenPayload): string =>
  jwt.sign({ role }, JWT_SECRET, {
    // "sub" (subject) is the standard JWT field for "who this token is for".
    subject: String(userId),
    expiresIn: AUTH_TOKEN_MAX_AGE_MS / 1000,
  });

export const authCookieOptions: CookieOptions = {
  // JavaScript in the browser cannot read the cookie, so an injected
  // script cannot steal the token.
  httpOnly: true,
  // The browser does not send the cookie on requests started by other sites.
  sameSite: "lax",
  // Only over https in production (localhost has no https).
  secure: process.env.NODE_ENV === "production",
  maxAge: AUTH_TOKEN_MAX_AGE_MS,
  path: "/",
};
