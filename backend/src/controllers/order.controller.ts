import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { ok } from '../utils/apiResponse.js';
import * as orderService from '../services/order.service.js';
import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

const packingSchema = z.object({ packingScheduledAt: z.coerce.date() });
const dispatchSchema = z.object({
  courierName: z.string().trim().min(2).max(100),
  trackingNumber: z.string().trim().max(120).optional(),
  trackingUrl: z.string().url().max(500).optional().or(z.literal('')),
  estimatedDeliveryFrom: z.coerce.date().optional(),
  estimatedDeliveryTo: z.coerce.date().optional(),
});
const trackingSchema = z.object({
  courierName: z.string().trim().min(2).max(100).optional(),
  trackingNumber: z.string().trim().min(2).max(120),
  trackingUrl: z.string().url().max(500).optional().or(z.literal('')),
  estimatedDeliveryFrom: z.coerce.date().optional(),
  estimatedDeliveryTo: z.coerce.date().optional(),
});

export async function listMyOrders(req: Request, res: Response, next: NextFunction) {
  try { return ok(res, await orderService.listCustomerOrders((req as AuthenticatedRequest).auth.userId), 'Orders loaded'); } catch (e) { next(e); }
}
export async function getMyOrder(req: Request, res: Response, next: NextFunction) {
  try { return ok(res, await orderService.getCustomerOrder((req as AuthenticatedRequest).auth.userId, req.params.orderId), 'Order loaded'); } catch (e) { next(e); }
}
export async function customerConfirmReceived(req: Request, res: Response, next: NextFunction) {
  try { return ok(res, await orderService.confirmReceived(req.params.orderId, 'CUSTOMER', (req as AuthenticatedRequest).auth.userId), 'Order marked received'); } catch (e) { next(e); }
}
export async function buyAgain(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).auth.userId;
    const order = await prisma.order.findFirst({ where: { userId, OR: [{ id: req.params.orderId }, { orderNumber: req.params.orderId }] }, include: { items: { include: { product: true } } } });
    if (!order) throw new AppError(404, 'Order not found');
    const unavailable = order.items.filter(item => item.product.status !== 'ACTIVE' || item.product.stock < item.quantity);
    if (unavailable.length) throw new AppError(409, 'Some items are no longer available in the required quantity', unavailable.map(item => ({ productId: item.productId, productName: item.productName })));
    const cart = await prisma.cart.upsert({ where: { userId }, create: { userId }, update: {} });
    await prisma.$transaction(async tx => {
      for (const item of order.items) {
        const current = await tx.cartItem.findUnique({ where: { cartId_productId: { cartId: cart.id, productId: item.productId } } });
        const quantity = (current?.quantity || 0) + item.quantity;
        if (quantity > item.product.stock) throw new AppError(409, `${item.productName} is unavailable in the requested quantity`);
        await tx.cartItem.upsert({ where: { cartId_productId: { cartId: cart.id, productId: item.productId } }, create: { cartId: cart.id, productId: item.productId, quantity: item.quantity }, update: { quantity } });
      }
    });
    const result = await prisma.cart.findUnique({ where: { userId }, include: { items: { orderBy: { createdAt: 'asc' }, include: { product: { include: { images: { orderBy: { sortOrder: 'asc' } } } } } } } });
    return ok(res, result, 'Order items added to cart');
  } catch (e) { next(e); }
}
export async function getInvoice(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).auth.userId;
    const order = await prisma.order.findFirst({
      where: { userId, OR: [{ id: req.params.orderId }, { orderNumber: req.params.orderId }], paymentStatus: 'PAID' },
      include: { user: { select: { name: true, email: true, mobile: true } }, items: true, payment: true },
    });
    if (!order) throw new AppError(404, 'Paid order invoice not found');
    return ok(res, {
      invoiceNumber: `INV-${order.orderNumber}`,
      issuedAt: order.payment?.paidAt || order.createdAt,
      business: { name: 'Sweety Birds & Fishes' },
      customer: order.user,
      deliveryAddress: order.deliveryAddressSnapshot,
      items: order.items.map(item => ({ productId: item.productId, name: item.productName, quantity: item.quantity, unitPrice: Number(item.unitPrice), lineTotal: Number(item.lineTotal) })),
      subtotal: Number(order.subtotal), shippingCharge: Number(order.shippingCharge), discount: Number(order.discount), total: Number(order.total),
      currency: order.payment?.currency || 'INR', paymentProvider: order.payment?.method || 'MANUAL_UPI', paymentId: order.payment?.utrNumber || null,
    }, 'Invoice loaded');
  } catch (e) { next(e); }
}
export async function listSellerOrders(_req: Request, res: Response, next: NextFunction) {
  try { return ok(res, await orderService.listAdminOrders(), 'Seller orders loaded'); } catch (e) { next(e); }
}
export async function sellerSchedulePacking(req: Request, res: Response, next: NextFunction) {
  try { const body = packingSchema.parse(req.body); return ok(res, await orderService.schedulePacking(req.params.orderId, body.packingScheduledAt), 'Packing scheduled'); } catch (e) { next(e); }
}
export async function sellerDispatch(req: Request, res: Response, next: NextFunction) {
  try { const body = dispatchSchema.parse(req.body); return ok(res, await orderService.markDispatched(req.params.orderId, { ...body, trackingUrl: body.trackingUrl || undefined }), 'Order dispatched'); } catch (e) { next(e); }
}
export async function sellerUpdateTracking(req: Request, res: Response, next: NextFunction) {
  try { const body = trackingSchema.parse(req.body); return ok(res, await orderService.updateTracking(req.params.orderId, { ...body, trackingUrl: body.trackingUrl || undefined }), 'Tracking updated'); } catch (e) { next(e); }
}
export async function sellerConfirmReceived(req: Request, res: Response, next: NextFunction) {
  try { return ok(res, await orderService.confirmReceived(req.params.orderId, 'SELLER'), 'Order marked received'); } catch (e) { next(e); }
}
