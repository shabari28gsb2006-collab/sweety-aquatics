import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';
import { Prisma } from '@prisma/client';

export class AppError extends Error {
  constructor(public statusCode: number, message: string, public details?: unknown) {
    super(message);
  }
}

export function notFound(req: Request, _res: Response, next: NextFunction) {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      details: err.flatten(),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    const target = Array.isArray(err.meta?.target) ? err.meta.target.join(',') : String(err.meta?.target || 'value');
    return res.status(409).json({ success: false, message: target.includes('utrNumber') ? 'This Transaction ID has already been submitted' : 'A unique value is already in use' });
  }

  logger.error('unhandled_error', { requestId: (req as Request & { requestId?: string }).requestId, method: req.method, path: req.originalUrl.split('?')[0], error: err instanceof Error ? err.message : String(err), stack: process.env.NODE_ENV === 'production' ? undefined : err instanceof Error ? err.stack : undefined });
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
}
