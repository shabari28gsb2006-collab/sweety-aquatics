import { Router } from 'express';
import { requireAuth, requireCustomer } from '../middleware/auth.middleware.js';
import { requireTrustedOrigin } from '../middleware/origin.middleware.js';
import { publicProductReviews, publicApprovedReviews, myReviews, createReview } from '../controllers/review.controller.js';

export const reviewRouter = Router();
reviewRouter.get('/approved', publicApprovedReviews);
reviewRouter.get('/product/:productId', publicProductReviews);
reviewRouter.get('/mine', requireAuth, requireCustomer, myReviews);
reviewRouter.post('/', requireAuth, requireCustomer, requireTrustedOrigin, createReview);
