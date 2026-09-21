import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
import { AppError } from './errorHandler.js';

/**
 * Defense-in-depth for cookie-authenticated state-changing endpoints.
 * Browsers send Origin on cross-origin POST requests; only the configured storefront is allowed.
 * Requests without Origin (server-to-server/test clients) are allowed and still require auth.
 */
export function requireTrustedOrigin(req: Request, _res: Response, next: NextFunction) {
  const origin = req.header('origin');
  const expected = new URL(env.FRONTEND_URL).origin;
  const fetchSite = req.header('sec-fetch-site');
  if (fetchSite === 'cross-site') return next(new AppError(403, 'Cross-site request blocked'));
  if (!origin) {
    const referer = req.header('referer');
    if (referer && new URL(referer).origin !== expected) return next(new AppError(403, 'Untrusted request origin'));
    return next();
  }
  if (origin !== expected) return next(new AppError(403, 'Untrusted request origin'));
  next();
}
