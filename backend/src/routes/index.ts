import { Router } from 'express';
import { healthRouter } from './health.route.js';
import { productRouter } from './product.route.js';
import { serviceabilityRouter } from './serviceability.route.js';
import { paymentRouter } from './payment.route.js';
import { authRouter } from './auth.route.js';
import { cartRouter } from './cart.route.js';
import { wishlistRouter } from './wishlist.route.js';
import { addressRouter } from './address.route.js';
import { checkoutRouter } from './checkout.route.js';
import { adminServiceabilityRouter } from './admin.serviceability.route.js';
import { orderRouter } from './order.route.js';
import { adminOrderRouter } from './admin.order.route.js';
import { reviewRouter } from './review.route.js';
import { adminReviewRouter } from './admin.review.route.js';
import { customerExperienceRouter, adminCustomerExperienceRouter } from './customer-experience.route.js';
import { adminProductRouter } from './admin.product.route.js';
import { adminAnalyticsRouter } from './admin.analytics.route.js';


export const apiRouter = Router();
apiRouter.use('/health', healthRouter);
apiRouter.use('/products', productRouter);
apiRouter.use('/serviceability', serviceabilityRouter);

apiRouter.use('/payments', paymentRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/cart', cartRouter);
apiRouter.use('/wishlist', wishlistRouter);
apiRouter.use('/addresses', addressRouter);
apiRouter.use('/checkout', checkoutRouter);
apiRouter.use('/admin/serviceability', adminServiceabilityRouter);

apiRouter.use('/orders', orderRouter);
apiRouter.use('/admin/orders', adminOrderRouter);
apiRouter.use('/reviews', reviewRouter);
apiRouter.use('/admin/reviews', adminReviewRouter);
apiRouter.use('/customer-experience', customerExperienceRouter);
apiRouter.use('/admin/customer-experience', adminCustomerExperienceRouter);
apiRouter.use('/admin/products', adminProductRouter);
apiRouter.use('/admin/analytics', adminAnalyticsRouter);
