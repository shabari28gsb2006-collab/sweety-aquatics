import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "./errorHandler.js";

export interface AuthenticatedRequest extends Request {
  auth: {
    userId: string;
    role: "CUSTOMER" | "ADMIN";
  };
}

type AccessPayload = {
  sub: string;
  role: "CUSTOMER" | "ADMIN";
  type?: string;
};

function readCookie(req: Request, name: string): string | undefined {
  const raw = req.headers.cookie;
  if (!raw) return undefined;
  for (const pair of raw.split(";")) {
    const [key, ...rest] = pair.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

function readAccessToken(req: Request): string | undefined {
  const authorization = req.headers.authorization;
  if (authorization?.startsWith("Bearer "))
    return authorization.slice(7).trim();
  const isAdminRequest = /(^|\/)admin(\/|$)/.test(req.originalUrl || req.url);
  return readCookie(
    req,
    isAdminRequest ? "sbf_admin_access_token" : "sbf_access_token",
  );
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = readAccessToken(req);
  if (!token) return next(new AppError(401, "Authentication required"));

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessPayload;
    if (
      !payload.sub ||
      !payload.role ||
      (payload.type && payload.type !== "access")
    ) {
      throw new Error("Invalid token payload");
    }
    (req as AuthenticatedRequest).auth = {
      userId: payload.sub,
      role: payload.role,
    };
    next();
  } catch {
    next(new AppError(401, "Your session has expired. Please sign in again."));
  }
}

export function requireCustomer(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const auth = (req as AuthenticatedRequest).auth;
  if (!auth || auth.role !== "CUSTOMER")
    return next(new AppError(403, "Customer account required"));
  next();
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const auth = (req as AuthenticatedRequest).auth;
  if (!auth || auth.role !== "ADMIN")
    return next(new AppError(403, "Seller administrator access required"));
  next();
}
