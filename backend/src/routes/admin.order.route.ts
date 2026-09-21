import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';
import { requireTrustedOrigin } from '../middleware/origin.middleware.js';
import { listSellerOrders, sellerSchedulePacking, sellerDispatch, sellerUpdateTracking, sellerConfirmReceived } from '../controllers/order.controller.js';

export const adminOrderRouter = Router();
adminOrderRouter.use(requireAuth, requireAdmin);
adminOrderRouter.get('/', listSellerOrders);
adminOrderRouter.patch('/:orderId/packing', requireTrustedOrigin, sellerSchedulePacking);
adminOrderRouter.patch('/:orderId/dispatch', requireTrustedOrigin, sellerDispatch);
adminOrderRouter.patch('/:orderId/tracking', requireTrustedOrigin, sellerUpdateTracking);
adminOrderRouter.patch('/:orderId/received', requireTrustedOrigin, sellerConfirmReceived);
