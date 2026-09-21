import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  TRUST_PROXY: z.coerce.number().int().min(0).max(2).default(0),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  COOKIE_DOMAIN: z.string().optional().or(z.literal('')),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_ACCESS_SECRET: z.string().min(16).default('development-access-secret-change-me'),
  JWT_REFRESH_SECRET: z.string().min(16).default('development-refresh-secret-change-me'),
  APP_ENCRYPTION_KEY: z.string().regex(/^[a-fA-F0-9]{64}$/, 'APP_ENCRYPTION_KEY must be a 32-byte hex value').optional().or(z.literal('')),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),
  ADMIN_EMAIL: z.string().email().optional().or(z.literal('')),
  ADMIN_PASSWORD: z.string().min(8).optional().or(z.literal('')),
  BUSINESS_EMAIL: z.string().email().default('shabari28gsb2006@gmail.com'),
  BUSINESS_WHATSAPP: z.string().min(8).default('919976894662'),
  STANDARD_SHIPPING_FEE: z.coerce.number().nonnegative().default(60),
  FREE_SHIPPING_THRESHOLD: z.coerce.number().positive().default(999),
  PAYMENT_SESSION_TTL_MINUTES: z.coerce.number().int().min(5).max(60).default(15),
  SMTP_HOST: z.string().optional().or(z.literal('')),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: z.preprocess((value) => value === true || value === 'true' || value === '1', z.boolean()).default(false),
  SMTP_USER: z.string().optional().or(z.literal('')),
  SMTP_PASS: z.string().optional().or(z.literal('')),
  SMTP_FROM: z.string().default('Sweety Birds & Fishes <no-reply@example.com>'),
  OTP_TTL_MINUTES: z.coerce.number().int().min(5).max(30).default(10),
  OTP_RESEND_SECONDS: z.coerce.number().int().min(30).max(300).default(45),
  UPLOAD_DIR: z.string().default('uploads'),
  UPLOAD_PUBLIC_BASE_URL: z.string().url().optional().or(z.literal('')),
  IMAGE_STORAGE_PROVIDER: z.enum(['local', 'cloudinary']).default('local'),
  CLOUDINARY_CLOUD_NAME: z.string().optional().or(z.literal('')),
  CLOUDINARY_API_KEY: z.string().optional().or(z.literal('')),
  CLOUDINARY_API_SECRET: z.string().optional().or(z.literal('')),
}).superRefine((value, ctx) => {
  if (value.NODE_ENV !== 'production') return;
  const insecure = ['development-access-secret-change-me', 'development-refresh-secret-change-me'];
  if (insecure.includes(value.JWT_ACCESS_SECRET) || value.JWT_ACCESS_SECRET.length < 32) ctx.addIssue({ code: 'custom', path: ['JWT_ACCESS_SECRET'], message: 'Use a unique production secret of at least 32 characters' });
  if (insecure.includes(value.JWT_REFRESH_SECRET) || value.JWT_REFRESH_SECRET.length < 32 || value.JWT_ACCESS_SECRET === value.JWT_REFRESH_SECRET) ctx.addIssue({ code: 'custom', path: ['JWT_REFRESH_SECRET'], message: 'Use a different production secret of at least 32 characters' });
  if (!value.APP_ENCRYPTION_KEY) ctx.addIssue({ code: 'custom', path: ['APP_ENCRYPTION_KEY'], message: 'A 32-byte hex encryption key is required in production' });
  if (!value.FRONTEND_URL.startsWith('https://')) ctx.addIssue({ code: 'custom', path: ['FRONTEND_URL'], message: 'Production frontend URL must use HTTPS' });
  for (const key of ['SMTP_HOST','SMTP_USER','SMTP_PASS'] as const) if (!value[key]) ctx.addIssue({ code: 'custom', path: [key], message: `${key} is required in production` });
  if (value.IMAGE_STORAGE_PROVIDER === 'local' && !value.UPLOAD_PUBLIC_BASE_URL) ctx.addIssue({ code: 'custom', path: ['UPLOAD_PUBLIC_BASE_URL'], message: 'A durable public upload origin is required for local production storage' });
  if (value.IMAGE_STORAGE_PROVIDER === 'cloudinary') for (const key of ['CLOUDINARY_CLOUD_NAME','CLOUDINARY_API_KEY','CLOUDINARY_API_SECRET'] as const) if (!value[key]) ctx.addIssue({ code: 'custom', path: [key], message: `${key} is required for Cloudinary storage` });
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  throw new Error('Environment validation failed');
}

export const env = parsed.data;
