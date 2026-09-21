import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { env } from "../config/env.js";
import { AppError } from "../middleware/errorHandler.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { authCookieNames, authService } from "../services/auth.service.js";
import { ok } from "../utils/apiResponse.js";

const passwordSchema = z
  .string()
  .min(6, "Password must contain at least 6 characters")
  .max(128);
const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().email(),
  mobile: z.string().min(10).max(18),
  password: passwordSchema,
});
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(128),
});
const otpSchema = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/),
});
const emailSchema = z.object({ email: z.string().email() });
const resetSchema = otpSchema.extend({ password: passwordSchema });

function cookieBase() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production" || env.COOKIE_SAME_SITE === "none",
    sameSite: env.COOKIE_SAME_SITE,
    path: "/",
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  };
}
function setSessionCookies(
  res: Response,
  session: {
    accessToken: string;
    refreshToken: string;
    refreshExpiresAt: Date;
  },
  admin = false,
) {
  const accessCookie = admin
    ? authCookieNames.ADMIN_ACCESS_COOKIE
    : authCookieNames.ACCESS_COOKIE;
  const refreshCookie = admin
    ? authCookieNames.ADMIN_REFRESH_COOKIE
    : authCookieNames.REFRESH_COOKIE;
  res.cookie(accessCookie, session.accessToken, {
    ...cookieBase(),
    maxAge: 15 * 60 * 1000,
  });
  res.cookie(refreshCookie, session.refreshToken, {
    ...cookieBase(),
    maxAge: Math.max(0, session.refreshExpiresAt.getTime() - Date.now()),
  });
}
function clearSessionCookies(res: Response, admin = false) {
  res.clearCookie(
    admin ? authCookieNames.ADMIN_ACCESS_COOKIE : authCookieNames.ACCESS_COOKIE,
    cookieBase(),
  );
  res.clearCookie(
    admin
      ? authCookieNames.ADMIN_REFRESH_COOKIE
      : authCookieNames.REFRESH_COOKIE,
    cookieBase(),
  );
}
function readCookie(req: Request, name: string) {
  const raw = req.headers.cookie;
  if (!raw) return undefined;
  return raw
    .split(";")
    .map((x) => x.trim())
    .find((x) => x.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

export async function registerController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    return ok(
      res,
      await authService.register(registerSchema.parse(req.body)),
      "Verification OTP sent",
      201,
    );
  } catch (e) {
    next(e);
  }
}
export async function resendVerificationController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await authService.resendVerification(emailSchema.parse(req.body).email);
    return ok(res, {}, "If verification is required, a new OTP has been sent");
  } catch (e) {
    next(e);
  }
}
export async function verifyEmailController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = otpSchema.parse(req.body);
    const result = await authService.verifyEmail(body.email, body.otp);
    setSessionCookies(res, result);
    return ok(res, { user: result.user }, "Email verified");
  } catch (e) {
    next(e);
  }
}
export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = loginSchema.parse(req.body);
    const result = await authService.login(
      body.email,
      body.password,
      "CUSTOMER",
    );
    setSessionCookies(res, result);
    return ok(res, { user: result.user }, "Signed in");
  } catch (e) {
    next(e);
  }
}
export async function adminLoginController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = loginSchema.parse(req.body);
    const result = await authService.login(body.email, body.password, "ADMIN");
    setSessionCookies(res, result, true);
    return ok(res, { user: result.user }, "Seller signed in");
  } catch (e) {
    next(e);
  }
}
export async function refreshController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = readCookie(req, authCookieNames.REFRESH_COOKIE);
    if (!token) throw new AppError(401, "Refresh session not found");
    const result = await authService.refresh(decodeURIComponent(token));
    setSessionCookies(res, result);
    return ok(res, { user: result.user }, "Session refreshed");
  } catch (e) {
    clearSessionCookies(res);
    next(e);
  }
}
export async function adminRefreshController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = readCookie(req, authCookieNames.ADMIN_REFRESH_COOKIE);
    if (!token) throw new AppError(401, "Admin refresh session not found");
    const result = await authService.refresh(decodeURIComponent(token));
    if (result.user.role !== "ADMIN")
      throw new AppError(403, "Seller administrator access required");
    setSessionCookies(res, result, true);
    return ok(res, { user: result.user }, "Admin session refreshed");
  } catch (e) {
    clearSessionCookies(res, true);
    next(e);
  }
}
export async function logoutController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = readCookie(req, authCookieNames.REFRESH_COOKIE);
    await authService.logout(token ? decodeURIComponent(token) : undefined);
    clearSessionCookies(res);
    return ok(res, {}, "Signed out");
  } catch (e) {
    clearSessionCookies(res);
    next(e);
  }
}
export async function adminLogoutController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = readCookie(req, authCookieNames.ADMIN_REFRESH_COOKIE);
    await authService.logout(token ? decodeURIComponent(token) : undefined);
    clearSessionCookies(res, true);
    return ok(res, {}, "Seller signed out");
  } catch (e) {
    clearSessionCookies(res, true);
    next(e);
  }
}
export async function logoutAllController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await authService.logoutAll((req as AuthenticatedRequest).auth.userId);
    clearSessionCookies(res);
    return ok(res, {}, "Signed out on all devices");
  } catch (e) {
    next(e);
  }
}
export async function meController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    return ok(
      res,
      await authService.me((req as AuthenticatedRequest).auth.userId),
      "Current account",
    );
  } catch (e) {
    next(e);
  }
}
export async function forgotPasswordController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await authService.forgotPassword(emailSchema.parse(req.body).email);
    return ok(
      res,
      {},
      "If the account exists, a password-reset OTP has been sent",
    );
  } catch (e) {
    next(e);
  }
}
export async function resetPasswordController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = resetSchema.parse(req.body);
    await authService.resetPassword(body.email, body.otp, body.password);
    clearSessionCookies(res);
    return ok(res, {}, "Password reset successfully");
  } catch (e) {
    next(e);
  }
}
