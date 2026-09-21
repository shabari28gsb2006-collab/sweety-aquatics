import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { AppError } from '../middleware/errorHandler.js';
import { ok } from '../utils/apiResponse.js';

const itemSchema = z.object({ productId: z.string().min(1), quantity: z.coerce.number().int().min(1).max(99).default(1) });
const quantitySchema = z.object({ quantity: z.coerce.number().int().min(1).max(99) });

async function getCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
    include: { items: { orderBy: { createdAt: 'asc' }, include: { product: { include: { images: { orderBy: { sortOrder: 'asc' } } } } } } },
  });
}

export async function getCartController(req: Request, res: Response, next: NextFunction) {
  try { return ok(res, await getCart((req as AuthenticatedRequest).auth.userId), 'Cart'); } catch (e) { next(e); }
}
export async function addCartItemController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).auth.userId;
    const body = itemSchema.parse(req.body);
    const product = await prisma.product.findUnique({ where: { id: body.productId } });
    if (!product || product.status !== 'ACTIVE') throw new AppError(409, 'Product is not currently orderable');
    const cart = await prisma.cart.upsert({ where: { userId }, create: { userId }, update: {} });
    const existing = await prisma.cartItem.findUnique({ where: { cartId_productId: { cartId: cart.id, productId: product.id } } });
    const nextQty = (existing?.quantity || 0) + body.quantity;
    if (nextQty > product.stock) throw new AppError(409, 'Requested quantity exceeds available stock');
    await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId: product.id } },
      create: { cartId: cart.id, productId: product.id, quantity: body.quantity },
      update: { quantity: nextQty },
    });
    return ok(res, await getCart(userId), 'Added to cart', 201);
  } catch (e) { next(e); }
}
export async function updateCartItemController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).auth.userId;
    const body = quantitySchema.parse(req.body);
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new AppError(404, 'Cart item not found');
    const item = await prisma.cartItem.findUnique({ where: { cartId_productId: { cartId: cart.id, productId: req.params.productId } }, include: { product: true } });
    if (!item) throw new AppError(404, 'Cart item not found');
    if (item.product.status !== 'ACTIVE') throw new AppError(409, 'Product is no longer orderable');
    if (body.quantity > item.product.stock) throw new AppError(409, 'Requested quantity exceeds available stock');
    await prisma.cartItem.update({ where: { id: item.id }, data: { quantity: body.quantity } });
    return ok(res, await getCart(userId), 'Cart updated');
  } catch (e) { next(e); }
}
export async function removeCartItemController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).auth.userId;
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId: req.params.productId } });
    return ok(res, await getCart(userId), 'Removed from cart');
  } catch (e) { next(e); }
}
export async function clearCartController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).auth.userId;
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return ok(res, await getCart(userId), 'Cart cleared');
  } catch (e) { next(e); }
}
