import type { NextFunction, Request, Response } from 'express';
import { ReviewStatus } from '@prisma/client';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { ok } from '../utils/apiResponse.js';
import * as reviewService from '../services/review.service.js';

const rating = z.number().int().min(1).max(5);
const createSchema = z.object({
  orderId: z.string().min(1),
  productId: z.string().min(1),
  rating,
  title: z.string().trim().max(120).optional(),
  comment: z.string().trim().min(3).max(2000),
  productQuality: rating.optional(),
  packingRating: rating.optional(),
  deliveryRating: rating.optional(),
  imageUrl: z.string().url().max(500).optional(),
});
const moderateSchema = z.object({
  status: z.nativeEnum(ReviewStatus).optional(),
  sellerReply: z.string().trim().max(1500).nullable().optional(),
}).refine((value) => value.status !== undefined || value.sellerReply !== undefined, { message: 'Nothing to update' });

export async function publicProductReviews(req: Request, res: Response, next: NextFunction) {
  try { return ok(res, await reviewService.getPublicProductReviews(req.params.productId), 'Reviews loaded'); } catch (e) { next(e); }
}
export async function publicApprovedReviews(req: Request, res: Response, next: NextFunction) {
  try { const limit = Number(req.query.limit || 20); return ok(res, await reviewService.getApprovedReviews(limit), 'Reviews loaded'); } catch (e) { next(e); }
}
export async function myReviews(req: Request, res: Response, next: NextFunction) {
  try { return ok(res, await reviewService.getMyReviews((req as AuthenticatedRequest).auth.userId), 'My reviews loaded'); } catch (e) { next(e); }
}
export async function createReview(req: Request, res: Response, next: NextFunction) {
  try { const body = createSchema.parse(req.body); return ok(res, await reviewService.submitReview((req as AuthenticatedRequest).auth.userId, body), 'Review submitted for seller approval', 201); } catch (e) { next(e); }
}
export async function adminReviews(_req: Request, res: Response, next: NextFunction) {
  try { return ok(res, await reviewService.listAdminReviews(), 'Seller reviews loaded'); } catch (e) { next(e); }
}
export async function adminUpdateReview(req: Request, res: Response, next: NextFunction) {
  try { const body = moderateSchema.parse(req.body); return ok(res, await reviewService.updateReviewModeration(req.params.reviewId, body), 'Review updated'); } catch (e) { next(e); }
}
export async function adminDeleteReview(req: Request, res: Response, next: NextFunction) {
  try { return ok(res, await reviewService.deleteReview(req.params.reviewId), 'Review deleted'); } catch (e) { next(e); }
}
