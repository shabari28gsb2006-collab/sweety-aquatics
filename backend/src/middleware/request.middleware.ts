import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger.js';

export function requestContext(req: Request, res: Response, next: NextFunction) {
  const requestId = req.header('x-request-id')?.slice(0, 128) || crypto.randomUUID(); const started = process.hrtime.bigint();
  res.setHeader('x-request-id', requestId); (req as Request & { requestId: string }).requestId = requestId;
  res.on('finish', () => { const durationMs = Number(process.hrtime.bigint() - started) / 1_000_000; logger.info('http_request', { requestId, method: req.method, path: req.originalUrl.split('?')[0], status: res.statusCode, durationMs: Number(durationMs.toFixed(2)), ip: req.ip }); });
  next();
}
