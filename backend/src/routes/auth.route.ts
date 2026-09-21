import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";
import { requireTrustedOrigin } from "../middleware/origin.middleware.js";
import {
  registerController,
  resendVerificationController,
  verifyEmailController,
  loginController,
  adminLoginController,
  refreshController,
  adminRefreshController,
  logoutController,
  adminLogoutController,
  logoutAllController,
  meController,
  forgotPasswordController,
  resetPasswordController,
} from "../controllers/auth.controller.js";

export const authRouter = Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 12,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

authRouter.use(requireTrustedOrigin);
authRouter.post("/register", authLimiter, registerController);
authRouter.post("/verify-email", otpLimiter, verifyEmailController);
authRouter.post(
  "/resend-verification",
  otpLimiter,
  resendVerificationController,
);
authRouter.post("/login", authLimiter, loginController);
authRouter.post("/admin/login", authLimiter, adminLoginController);
authRouter.post("/refresh", authLimiter, refreshController);
authRouter.post("/admin/refresh", authLimiter, adminRefreshController);
authRouter.post("/logout", logoutController);
authRouter.post("/admin/logout", adminLogoutController);
authRouter.post("/forgot-password", otpLimiter, forgotPasswordController);
authRouter.post("/reset-password", otpLimiter, resetPasswordController);
authRouter.get("/me", requireAuth, meController);
authRouter.get("/admin/me", requireAuth, requireAdmin, meController);
authRouter.post("/logout-all", requireAuth, logoutAllController);
