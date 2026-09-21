import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { AppError } from "../middleware/errorHandler.js";
import { sendOtpEmail } from "./mail.service.js";

const ACCESS_COOKIE = "sbf_access_token";
const REFRESH_COOKIE = "sbf_refresh_token";
const ADMIN_ACCESS_COOKIE = "sbf_admin_access_token";
const ADMIN_REFRESH_COOKIE = "sbf_admin_refresh_token";
const MAX_OTP_ATTEMPTS = 5;

export const authCookieNames = {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}
export function normalizeIndianMobile(value: string): string {
  const digits = value.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
  if (!/^[6-9]\d{9}$/.test(digits))
    throw new AppError(422, "Enter a valid 10-digit Indian mobile number");
  return `+91${digits}`;
}

function otpHash(userId: string, purpose: string, otp: string) {
  return crypto
    .createHmac("sha256", env.JWT_ACCESS_SECRET)
    .update(`${userId}|${purpose}|${otp}`)
    .digest("hex");
}
function tokenHash(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
function randomOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}
function randomRefreshToken() {
  return crypto.randomBytes(48).toString("base64url");
}

function signAccessToken(user: { id: string; role: "CUSTOMER" | "ADMIN" }) {
  return jwt.sign({ role: user.role, type: "access" }, env.JWT_ACCESS_SECRET, {
    subject: user.id,
    expiresIn: env.ACCESS_TOKEN_TTL as jwt.SignOptions["expiresIn"],
  });
}

async function createRefreshToken(userId: string) {
  const raw = randomRefreshToken();
  const expiresAt = new Date(
    Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  );
  await prisma.refreshToken.create({
    data: { userId, tokenHash: tokenHash(raw), expiresAt },
  });
  return { raw, expiresAt };
}

async function issueSession(user: { id: string; role: "CUSTOMER" | "ADMIN" }) {
  const accessToken = signAccessToken(user);
  const refreshToken = await createRefreshToken(user.id);
  return {
    accessToken,
    refreshToken: refreshToken.raw,
    refreshExpiresAt: refreshToken.expiresAt,
  };
}

async function createOtp(
  user: { id: string; name: string; email: string },
  purpose: "EMAIL_VERIFICATION" | "PASSWORD_RESET",
) {
  const latest = await prisma.emailOtp.findFirst({
    where: { userId: user.id, purpose },
    orderBy: { createdAt: "desc" },
  });
  if (
    latest &&
    Date.now() - latest.createdAt.getTime() < env.OTP_RESEND_SECONDS * 1000
  ) {
    const wait = Math.ceil(
      (env.OTP_RESEND_SECONDS * 1000 -
        (Date.now() - latest.createdAt.getTime())) /
        1000,
    );
    throw new AppError(
      429,
      `Please wait ${wait} seconds before requesting another OTP`,
    );
  }
  const otp = randomOtp();
  await prisma.emailOtp.updateMany({
    where: { userId: user.id, purpose, consumedAt: null },
    data: { consumedAt: new Date() },
  });
  await prisma.emailOtp.create({
    data: {
      userId: user.id,
      purpose,
      otpHash: otpHash(user.id, purpose, otp),
      expiresAt: new Date(Date.now() + env.OTP_TTL_MINUTES * 60_000),
    },
  });
  const mail = await sendOtpEmail({
    to: user.email,
    name: user.name,
    otp,
    purpose,
  });
  return env.NODE_ENV === "development" ? mail : {};
}

async function verifyOtp(
  userId: string,
  purpose: "EMAIL_VERIFICATION" | "PASSWORD_RESET",
  otp: string,
) {
  const record = await prisma.emailOtp.findFirst({
    where: { userId, purpose, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (!record || record.expiresAt <= new Date())
    throw new AppError(400, "OTP has expired. Request a new code.");
  if (record.attempts >= MAX_OTP_ATTEMPTS)
    throw new AppError(
      429,
      "Too many incorrect OTP attempts. Request a new code.",
    );
  const expected = otpHash(userId, purpose, otp);
  const valid = crypto.timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(record.otpHash, "hex"),
  );
  if (!valid) {
    await prisma.emailOtp.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    throw new AppError(400, "Invalid OTP code");
  }
  await prisma.emailOtp.update({
    where: { id: record.id },
    data: { verifiedAt: new Date(), consumedAt: new Date() },
  });
}

function publicUser(user: any) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
  };
}

export const authService = {
  async register(input: {
    name: string;
    email: string;
    mobile: string;
    password: string;
  }) {
    const email = normalizeEmail(input.email);
    const mobile = normalizeIndianMobile(input.mobile);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing?.isEmailVerified)
      throw new AppError(409, "An account already exists for this email");
    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = existing
      ? await prisma.user.update({
          where: { id: existing.id },
          data: {
            name: input.name.trim(),
            mobile,
            passwordHash,
            status: "ACTIVE",
          },
        })
      : await prisma.user.create({
          data: {
            name: input.name.trim(),
            email,
            mobile,
            passwordHash,
            role: "CUSTOMER",
          },
        });
    const mail = await createOtp(user, "EMAIL_VERIFICATION");
    return { user: publicUser(user), ...mail };
  },

  async resendVerification(emailInput: string) {
    const email = normalizeEmail(emailInput);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.isEmailVerified) return {};
    return createOtp(user, "EMAIL_VERIFICATION");
  },

  async verifyEmail(emailInput: string, otp: string) {
    const user = await prisma.user.findUnique({
      where: { email: normalizeEmail(emailInput) },
    });
    if (!user) throw new AppError(400, "Invalid verification request");
    if (!user.isEmailVerified)
      await verifyOtp(user.id, "EMAIL_VERIFICATION", otp);
    const updated = user.isEmailVerified
      ? user
      : await prisma.user.update({
          where: { id: user.id },
          data: { isEmailVerified: true, emailVerifiedAt: new Date() },
        });
    const session = await issueSession({ id: updated.id, role: updated.role });
    return { user: publicUser(updated), ...session };
  },

  async login(
    emailInput: string,
    password: string,
    requiredRole?: "CUSTOMER" | "ADMIN",
  ) {
    const user = await prisma.user.findUnique({
      where: { email: normalizeEmail(emailInput) },
    });
    const generic = new AppError(401, "Invalid email or password");
    if (!user) throw generic;
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw generic;
    if (user.status !== "ACTIVE")
      throw new AppError(403, "This account is not active");
    if (!user.isEmailVerified)
      throw new AppError(403, "Verify your email before signing in");
    if (requiredRole && user.role !== requiredRole) throw generic;
    const session = await issueSession({ id: user.id, role: user.role });
    return { user: publicUser(user), ...session };
  },

  async refresh(rawRefreshToken: string) {
    const hash = tokenHash(rawRefreshToken);
    const stored = await prisma.refreshToken.findUnique({
      where: { tokenHash: hash },
      include: { user: true },
    });
    if (
      !stored ||
      stored.revokedAt ||
      stored.expiresAt <= new Date() ||
      stored.user.status !== "ACTIVE"
    ) {
      throw new AppError(401, "Refresh session is invalid or expired");
    }
    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });
    const session = await issueSession({
      id: stored.user.id,
      role: stored.user.role,
    });
    return { user: publicUser(stored.user), ...session };
  },

  async logout(rawRefreshToken?: string) {
    if (!rawRefreshToken) return;
    await prisma.refreshToken.updateMany({
      where: { tokenHash: tokenHash(rawRefreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  async logoutAll(userId: string) {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] },
      },
    });
    if (!user) throw new AppError(404, "Account not found");
    return { ...publicUser(user), addresses: user.addresses };
  },

  async forgotPassword(emailInput: string) {
    const user = await prisma.user.findUnique({
      where: { email: normalizeEmail(emailInput) },
    });
    if (!user || !user.isEmailVerified) return {};
    return createOtp(user, "PASSWORD_RESET");
  },

  async resetPassword(emailInput: string, otp: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email: normalizeEmail(emailInput) },
    });
    if (!user) throw new AppError(400, "Invalid password reset request");
    await verifyOtp(user.id, "PASSWORD_RESET", otp);
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
      prisma.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
    return { reset: true };
  },
};
