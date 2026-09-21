import { Router } from 'express';
import { requireAuth,requireCustomer } from '../middleware/auth.middleware.js';
import { requireTrustedOrigin } from '../middleware/origin.middleware.js';
import { checkoutReadinessController } from '../controllers/checkout.controller.js';
export const checkoutRouter=Router();
checkoutRouter.use(requireAuth,requireCustomer,requireTrustedOrigin);
checkoutRouter.post('/readiness',checkoutReadinessController);
