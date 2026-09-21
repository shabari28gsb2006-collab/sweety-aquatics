import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { AppError } from '../middleware/errorHandler.js';
import { ok } from '../utils/apiResponse.js';

async function list(userId: string) {
  return prisma.wishlistItem.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, include: { product: { include: { images: { orderBy: { sortOrder: 'asc' } } } } } });
}
export async function getWishlistController(req: Request, res: Response, next: NextFunction) { try { return ok(res, await list((req as AuthenticatedRequest).auth.userId), 'Wishlist'); } catch(e){ next(e); } }
export async function addWishlistController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId=(req as AuthenticatedRequest).auth.userId; const productId=req.params.productId;
    const product=await prisma.product.findUnique({where:{id:productId}}); if(!product || ['DRAFT','ARCHIVED'].includes(product.status)) throw new AppError(404,'Product not found');
    await prisma.wishlistItem.upsert({where:{userId_productId:{userId,productId}},create:{userId,productId},update:{}});
    return ok(res,await list(userId),'Added to wishlist',201);
  } catch(e){ next(e); }
}
export async function removeWishlistController(req: Request,res: Response,next: NextFunction){try{const userId=(req as AuthenticatedRequest).auth.userId;await prisma.wishlistItem.deleteMany({where:{userId,productId:req.params.productId}});return ok(res,await list(userId),'Removed from wishlist');}catch(e){next(e);}}
