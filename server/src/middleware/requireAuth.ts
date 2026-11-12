import type { NextFunction, Request, Response } from "express";
import { AUTH_COOKIE_NAME, clearAuthCookieOptions, verifyAuthToken } from "../lib/authToken.js";
import type { AuthTokenPayload } from "../lib/authToken.js";
import { HttpError } from "../lib/httpError.js";

declare global {
  namespace Express {
    interface Request {
      auth?: AuthTokenPayload;
    }
  }
}

// Lets the request through only with a valid login cookie; sets req.auth.
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token: unknown = req.cookies?.[AUTH_COOKIE_NAME];

  if (typeof token !== "string") {
    throw new HttpError(401, "Not logged in");
  }

  const auth = verifyAuthToken(token);

  if (!auth) {
    // The cookie is fake or expired, so remove it from the browser.
    res.clearCookie(AUTH_COOKIE_NAME, clearAuthCookieOptions);
    throw new HttpError(401, "Not logged in");
  }

  req.auth = auth;
  next();
};

// Throws 401 if the route was (by mistake) added without requireAuth.
export const getAuthUserId = (req: Request): number => {
  if (!req.auth) {
    throw new HttpError(401, "Not logged in");
  }
  return req.auth.userId;
};
