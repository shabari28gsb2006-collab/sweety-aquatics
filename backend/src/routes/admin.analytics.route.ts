import { Router } from 'express';
import { requireAdmin, requireAuth } from '../middleware/auth.middleware.js';
import { analyticsCsv, analyticsOverview } from '../controllers/analytics.controller.js';
export const adminAnalyticsRouter = Router();
adminAnalyticsRouter.use(requireAuth, requireAdmin);
adminAnalyticsRouter.get('/overview', analyticsOverview);
adminAnalyticsRouter.get('/sales.csv', analyticsCsv);
