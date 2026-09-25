import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import path from 'node:path';
import { requestContext } from './middleware/request.middleware.js';

const app = express();

export { app };
export default app;

app.disable('x-powered-by');
if (env.TRUST_PROXY) app.set('trust proxy', env.TRUST_PROXY);
app.use(requestContext);
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  strictTransportSecurity: env.NODE_ENV === 'production' ? { maxAge: 31_536_000, includeSubDomains: true, preload: true } : false,
}));
app.use(cors({ origin: env.FRONTEND_URL, credentials: true, methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization','Idempotency-Key','X-Request-Id','Cache-Control','Pragma'], exposedHeaders: ['X-Request-Id','RateLimit','RateLimit-Policy'], maxAge: 86400 }));

app.use(express.json({ limit: '8mb', strict: true }));
app.use(express.urlencoded({ extended: false, limit: '64kb', parameterLimit: 100 }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false, skip: req => req.path.startsWith('/api/health') }));
app.use('/api', (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  next();
});

app.get('/', (_req, res) => {
  res.json({ success: true, message: 'Sweety Birds & Fishes backend', docs: '/api/health' });
});
app.use('/uploads', express.static(path.resolve(process.cwd(), env.UPLOAD_DIR), { fallthrough: false, maxAge: '30d', immutable: true, dotfiles: 'deny', index: false, etag: true, lastModified: true }));

app.use('/api', apiRouter);
app.use(notFound);
app.use(errorHandler);
