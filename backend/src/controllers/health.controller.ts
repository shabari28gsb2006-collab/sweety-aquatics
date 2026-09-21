import type { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

export async function getHealth(_req: Request, res: Response) {
  const started = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.json({
      success: true,
      message: 'Sweety Birds & Fishes API is running',
      data: {
        api: 'ok',
        database: 'ok',
        responseMs: Date.now() - started,
        timestamp: new Date().toISOString(),
      },
    });
  } catch {
    return res.status(503).json({
      success: false,
      message: 'API is running but database is unavailable',
      data: {
        api: 'ok',
        database: 'unavailable',
        responseMs: Date.now() - started,
        timestamp: new Date().toISOString(),
      },
    });
  }
}

export function getLiveness(_req: Request, res: Response) { return res.json({ success: true, data: { api: 'ok', uptimeSeconds: Math.round(process.uptime()), timestamp: new Date().toISOString() } }); }
