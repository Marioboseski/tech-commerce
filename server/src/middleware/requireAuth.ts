import type { NextFunction, Request, Response } from "express";
import { AUTH_COOKIE_NAME, clearAuthCookieOptions, verifyAuthToken } from "../lib/authToken.js";
import type { AuthTokenPayload } from "../lib/authToken.js";

// Teach TypeScript that req.auth exists (it is set below).
declare global {
  namespace Express {
    interface Request {
      auth?: AuthTokenPayload;
    }
  }
}

// Put this in front of any route that needs a logged-in user.
// It lets the request through only with a valid login cookie and stores
// who the user is in req.auth.
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token: unknown = req.cookies?.[AUTH_COOKIE_NAME];

  if (typeof token !== "string") {
    return res.status(401).json({ message: "Not logged in" });
  }

  const auth = verifyAuthToken(token);

  if (!auth) {
    // The cookie is fake or expired, so remove it from the browser.
    res.clearCookie(AUTH_COOKIE_NAME, clearAuthCookieOptions);
    return res.status(401).json({ message: "Not logged in" });
  }

  req.auth = auth;
  next();
};
