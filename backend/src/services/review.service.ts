import { ReviewStatus } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

function serializeReview(review: any) {
  return {
    id: review.id,
    userId: review.userId,
    orderId: review.orderId,
    productId: review.productId,
    productName: review.product?.name || review.order?.items?.find((i: any) => i.productId === review.productId)?.productName || '',
    customerName: review.user?.name || 'Customer',
    customerCity: (review.order?.deliveryAddressSnapshot as any)?.city || '',
    rating: review.rating,
    title: review.title || '',
    comment: review.comment,
    productQuality: review.productQuality || undefined,
    packingRating: review.packingRating || undefined,
    deliveryRating: review.deliveryRating || undefined,
    imageUrl: review.imageUrl || undefined,
    sellerReply: review.sellerReply || undefined,
    isVerifiedPurchase: review.isVerifiedPurchase,
    status: review.status,
    createdAt: review.createdAt.toISOString(),
  };
}

const includeReview = {
  user: { select: { name: true } },
  product: { select: { id: true, name: true } },
  order: { select: { id: true, deliveryAddressSnapshot: true, items: true } },
} as const;

export async function getPublicProductReviews(productId: string) {
  const reviews = await prisma.review.findMany({
    where: { productId, status: ReviewStatus.APPROVED, isVerifiedPurchase: true },
    include: includeReview,
    orderBy: { createdAt: 'desc' },
  });
  return reviews.map(serializeReview);
}

export async function getApprovedReviews(limit = 20) {
  const reviews = await prisma.review.findMany({
    where: { status: ReviewStatus.APPROVED, isVerifiedPurchase: true },
    include: includeReview,
    orderBy: { createdAt: 'desc' },
    take: Math.max(1, Math.min(limit, 100)),
  });
  return reviews.map(serializeReview);
}

export async function getMyReviews(userId: string) {
  const reviews = await prisma.review.findMany({ where: { userId }, include: includeReview, orderBy: { createdAt: 'desc' } });
  return reviews.map(serializeReview);
}

export async function submitReview(userId: string, input: {
  orderId: string;
  productId: string;
  rating: number;
  title?: string;
  comment: string;
  productQuality?: number;
  packingRating?: number;
  deliveryRating?: number;
  imageUrl?: string;
}) {
  const order = await prisma.order.findFirst({
    where: { id: input.orderId, userId, status: 'RECEIVED', paymentStatus: 'PAID' },
    include: { items: true },
  });
  if (!order) throw new AppError(409, 'You can review products only after the order is received');
  if (!order.items.some((item) => item.productId === input.productId)) throw new AppError(422, 'This product was not part of the selected order');

  const existing = await prisma.review.findUnique({ where: { userId_orderId_productId: { userId, orderId: input.orderId, productId: input.productId } } });
  if (existing) throw new AppError(409, 'You have already reviewed this product for this order');

  const review = await prisma.review.create({
    data: {
      userId,
      orderId: input.orderId,
      productId: input.productId,
      rating: input.rating,
      title: input.title?.trim() || null,
      comment: input.comment.trim(),
      productQuality: input.productQuality,
      packingRating: input.packingRating,
      deliveryRating: input.deliveryRating,
      imageUrl: input.imageUrl?.trim() || null,
      status: ReviewStatus.PENDING,
      isVerifiedPurchase: true,
    },
    include: includeReview,
  });
  return serializeReview(review);
}

export async function listAdminReviews() {
  const reviews = await prisma.review.findMany({ include: includeReview, orderBy: { createdAt: 'desc' } });
  return reviews.map(serializeReview);
}

export async function updateReviewModeration(reviewId: string, input: { status?: ReviewStatus; sellerReply?: string | null }) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new AppError(404, 'Review not found');
  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: {
      ...(input.status ? { status: input.status } : {}),
      ...(input.sellerReply !== undefined ? { sellerReply: input.sellerReply?.trim() || null } : {}),
    },
    include: includeReview,
  });
  return serializeReview(updated);
}

export async function deleteReview(reviewId: string) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new AppError(404, 'Review not found');
  await prisma.review.delete({ where: { id: reviewId } });
  return { deleted: true };
}
