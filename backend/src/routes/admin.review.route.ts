import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';
import { requireTrustedOrigin } from '../middleware/origin.middleware.js';
import { adminReviews, adminUpdateReview, adminDeleteReview } from '../controllers/review.controller.js';

export const adminReviewRouter = Router();
adminReviewRouter.use(requireAuth, requireAdmin);
adminReviewRouter.get('/', adminReviews);
adminReviewRouter.patch('/:reviewId', requireTrustedOrigin, adminUpdateReview);
adminReviewRouter.delete('/:reviewId', requireTrustedOrigin, adminDeleteReview);
