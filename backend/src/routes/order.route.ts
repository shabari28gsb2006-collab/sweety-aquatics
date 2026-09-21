import { Router } from 'express';
import { requireAuth, requireCustomer } from '../middleware/auth.middleware.js';
import { requireTrustedOrigin } from '../middleware/origin.middleware.js';
import { listMyOrders, getMyOrder, customerConfirmReceived, buyAgain, getInvoice } from '../controllers/order.controller.js';

export const orderRouter = Router();
orderRouter.use(requireAuth, requireCustomer);
orderRouter.get('/', listMyOrders);
orderRouter.get('/:orderId', getMyOrder);
orderRouter.get('/:orderId/invoice', getInvoice);
orderRouter.post('/:orderId/buy-again', requireTrustedOrigin, buyAgain);
orderRouter.patch('/:orderId/received', requireTrustedOrigin, customerConfirmReceived);
