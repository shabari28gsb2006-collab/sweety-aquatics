import type { NextFunction, Request, Response } from 'express';
import { getPublicProductBySlug, listPublicProducts, listSellerProducts, createSellerProduct, updateSellerProduct } from '../services/product.service.js';
import { AppError } from '../middleware/errorHandler.js';
import { ok } from '../utils/apiResponse.js';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { storeProductImage } from '../services/image-storage.service.js';
import { sendOfferAnnouncementEmail } from '../services/mail.service.js';

export async function getProducts(_req: Request, res: Response) {
  const products = await listPublicProducts();
  return ok(res, products, 'Products loaded');
}

export async function getProductBySlug(req: Request, res: Response) {
  const product = await getPublicProductBySlug(req.params.slug);
  if (!product) throw new AppError(404, 'Product not found');
  return ok(res, product, 'Product loaded');
}

const productInput = z.object({
  name: z.string().trim().min(2).max(160), slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(180),
  category: z.enum(['GUPPY', 'FISH_FOOD', 'COMBO_PACK', 'WHOLESALE']), status: z.enum(['ACTIVE', 'OUT_OF_STOCK', 'COMING_SOON', 'DRAFT', 'ARCHIVED']),
  description: z.string().trim().min(1).max(10000), shortDescription: z.string().trim().max(500).nullish(),
  price: z.coerce.number().positive().max(10000000), mrp: z.coerce.number().positive().max(10000000).nullish(), stock: z.coerce.number().int().min(0).max(1000000),
  offerPrice: z.coerce.number().positive().max(10000000).nullish(), offerEndsAt: z.string().datetime().nullish(),
  sellerRating: z.coerce.number().min(0).max(5).multipleOf(0.1).nullish(),
  sellerRatingCount: z.coerce.number().int().min(0).max(1000000).nullish(),
  isFeatured: z.boolean().default(false), isBestSeller: z.boolean().default(false), isNewArrival: z.boolean().default(false),
  variety: z.string().trim().max(120).nullish(), color: z.string().trim().max(120).nullish(), gender: z.string().trim().max(40).nullish(), size: z.string().trim().max(80).nullish(), age: z.string().trim().max(80).nullish(), temperature: z.string().trim().max(80).nullish(), ph: z.string().trim().max(80).nullish(),
  foodPackSize: z.string().trim().max(80).nullish(), foodIngredients: z.string().trim().max(1000).nullish(), feedingDirections: z.string().trim().max(1000).nullish(),
  images: z.array(z.object({ url: z.string().trim().min(1).max(2048), isPrimary: z.boolean().optional(), sortOrder: z.number().int().min(0).optional() })).max(12).default([]),
});

function dbProduct(input: z.infer<typeof productInput>) {
  const { images, ...data } = input;
  if (data.mrp != null && data.mrp < data.price) throw new AppError(422, 'MRP cannot be lower than price');
  if ((data.offerPrice == null) !== (data.offerEndsAt == null)) throw new AppError(422, 'Offer price and offer end time must be set together');
  if (data.offerPrice != null && data.offerPrice >= data.price) throw new AppError(422, 'Offer price must be lower than the regular selling price');
  if (data.offerEndsAt && new Date(data.offerEndsAt) <= new Date()) throw new AppError(422, 'Offer end time must be in the future');
  if (data.status === 'ACTIVE' && data.stock === 0) data.status = 'OUT_OF_STOCK';
  return { data: { ...data, offerEndsAt: data.offerEndsAt ? new Date(data.offerEndsAt) : null }, images: images.map((image, index) => ({ url: image.url, isPrimary: image.isPrimary ?? index === 0, sortOrder: image.sortOrder ?? index })) };
}

export async function getSellerProducts(_req: Request, res: Response, next: NextFunction) { try { return ok(res, await listSellerProducts()); } catch (error) { next(error); } }
export async function createProduct(req: Request, res: Response, next: NextFunction) { try { const parsed = dbProduct(productInput.parse(req.body)); const created = await createSellerProduct(parsed.data, parsed.images); if (parsed.data.offerPrice != null && parsed.data.offerEndsAt instanceof Date && parsed.data.offerEndsAt > new Date() && parsed.data.status === 'ACTIVE') void sendOfferAnnouncementEmail({ productId: created.id, productName: String(parsed.data.name), category: String(parsed.data.category), regularPrice: Number(parsed.data.price), offerPrice: Number(parsed.data.offerPrice), offerEndsAt: parsed.data.offerEndsAt }).catch(error => console.error('Offer announcement email failed', error)); return ok(res, created, 'Product created', 201); } catch (error) { next(error); } }
export async function updateProduct(req: Request, res: Response, next: NextFunction) { try { const before = await prisma.product.findUnique({ where: { id: req.params.id }, select: { offerPrice: true, offerEndsAt: true } }); const parsed = dbProduct(productInput.parse(req.body)); const updated = await updateSellerProduct(req.params.id, parsed.data, parsed.images); const nextOffer = parsed.data.offerPrice == null ? null : Number(parsed.data.offerPrice); const announce = nextOffer != null && parsed.data.offerEndsAt instanceof Date && parsed.data.offerEndsAt > new Date() && (before?.offerPrice == null || Number(before.offerPrice) !== nextOffer || before.offerEndsAt?.getTime() !== parsed.data.offerEndsAt.getTime()); if (announce) void sendOfferAnnouncementEmail({ productId: updated.id, productName: String(parsed.data.name), category: String(parsed.data.category), regularPrice: Number(parsed.data.price), offerPrice: nextOffer, offerEndsAt: parsed.data.offerEndsAt as Date }).catch(error => console.error('Offer announcement email failed', error)); return ok(res, updated, 'Product updated'); } catch (error) { next(error); } }
export async function duplicateProduct(req: Request, res: Response, next: NextFunction) {
  try { const source = await prisma.product.findUnique({ where: { id: req.params.id }, include: { images: true } }); if (!source) throw new AppError(404, 'Product not found'); const stamp = Date.now().toString().slice(-7); const { id: _id, createdAt: _created, updatedAt: _updated, images, ...raw } = source; const data = { ...raw, name: `${source.name} Copy`, slug: `${source.slug}-copy-${stamp}`, status: 'DRAFT' as const, isFeatured: false, offerPrice: null, offerEndsAt: null }; return ok(res, await createSellerProduct(data, images.map((image, index) => ({ url: image.url, isPrimary: image.isPrimary, sortOrder: index }))), 'Product duplicated', 201); } catch (error) { next(error); }
}
export async function archiveProduct(req: Request, res: Response, next: NextFunction) { try { const data = await prisma.product.update({ where: { id: req.params.id }, data: { status: 'ARCHIVED' } }); return ok(res, data, 'Product archived'); } catch (error) { next(error); } }
export async function bulkProducts(req: Request, res: Response, next: NextFunction) {
  try { const input = z.object({ ids: z.array(z.string().min(1)).min(1).max(500), status: z.enum(['ACTIVE', 'OUT_OF_STOCK', 'COMING_SOON', 'DRAFT', 'ARCHIVED']).optional(), stockDelta: z.number().int().min(-100000).max(100000).optional(), pricePercent: z.number().min(-99).max(1000).optional() }).refine(value => value.status !== undefined || value.stockDelta !== undefined || value.pricePercent !== undefined, 'An update is required').parse(req.body); const products = await prisma.product.findMany({ where: { id: { in: input.ids } } }); await prisma.$transaction(products.map(product => { const stock = input.stockDelta === undefined ? product.stock : Math.max(0, product.stock + input.stockDelta); const price = input.pricePercent === undefined ? product.price : Math.max(1, Number(product.price) * (1 + input.pricePercent / 100)); let status = input.status || product.status; if (stock === 0 && status === 'ACTIVE') status = 'OUT_OF_STOCK'; return prisma.product.update({ where: { id: product.id }, data: { stock, price, status } }); })); return ok(res, { updated: products.length }, 'Products updated'); } catch (error) { next(error); }
}
export async function uploadProductImage(req: Request, res: Response, next: NextFunction) {
  try { const input = z.object({ dataUrl: z.string().max(7_100_000) }).parse(req.body); const match = /^data:(image\/(jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(input.dataUrl); if (!match) throw new AppError(422, 'Only JPG, PNG or WebP image data is accepted'); const bytes = Buffer.from(match[3], 'base64'); if (!bytes.length || bytes.length > 5 * 1024 * 1024) throw new AppError(422, 'Image must be no larger than 5 MB'); const signatures = { jpeg: bytes[0] === 0xff && bytes[1] === 0xd8, png: bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])), webp: bytes.subarray(0,4).toString() === 'RIFF' && bytes.subarray(8,12).toString() === 'WEBP' }; const ext = match[2] as keyof typeof signatures; if (!signatures[ext]) throw new AppError(422, 'Image content does not match its declared format'); const url = await storeProductImage(bytes, ext, match[1]); return ok(res, { url }, 'Image uploaded', 201); } catch (error) { next(error); }
}
