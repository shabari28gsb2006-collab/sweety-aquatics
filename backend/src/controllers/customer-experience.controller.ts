import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { AppError } from '../middleware/errorHandler.js';
import { ok } from '../utils/apiResponse.js';
import { env } from '../config/env.js';
import { sendCustomerActivityEmail } from '../services/mail.service.js';

const id = z.string().trim().min(1).max(128);
const reminderInput = z.object({
  aquariumProfileId: id.nullish(),
  type: z.enum(['FEEDING', 'WATER_CHANGE', 'CARE']),
  title: z.string().trim().min(2).max(120),
  schedule: z.string().trim().max(120).nullish(),
  nextDueAt: z.string().datetime().nullish(),
  isActive: z.boolean().optional(),
});

const ticketInput = z.object({
  orderId: id.nullish(),
  subject: z.string().trim().min(4).max(160),
  message: z.string().trim().min(10).max(5000),
});

const settingsInput = z.object({
  businessName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  whatsapp: z.string().trim().regex(/^\+91[6-9]\d{9}$/, 'WhatsApp must use +91 followed by a valid 10-digit Indian mobile number'),
  phone: z.string().trim().max(20).nullish(),
  businessHours: z.string().trim().max(160).nullish(),
  courierPackingCharge: z.coerce.number().min(0).max(100000),
  upiId: z.string().trim().regex(/^[\w.-]{2,256}@[A-Za-z]{2,64}$/, 'Enter a valid UPI ID').nullish(),
  upiPayeeName: z.string().trim().min(2).max(120).nullish(),
  guppiesCategoryImage: z.string().trim().max(2048).nullish(),
  fishFoodCategoryImage: z.string().trim().max(2048).nullish(),
  comboPacksCategoryImage: z.string().trim().max(2048).nullish(),
  customCategories: z.array(z.object({ id: z.string().trim().min(1).max(80), name: z.string().trim().min(2).max(60), description: z.string().trim().max(180).default(''), image: z.string().trim().min(1).max(2048), targetCategory: z.enum(['GUPPY','FISH_FOOD','COMBO_PACK','WHOLESALE']), published: z.boolean().default(true) })).max(24).default([]),
});

const DEFAULT_SETTINGS = {
  id: 'store', businessName: 'Sweety Birds & Fishes', email: 'shabari28gsb2006@gmail.com',
  whatsapp: '+919976894662', phone: null, businessHours: null, courierPackingCharge: 60, upiId: null, upiPayeeName: null,
  guppiesCategoryImage: null, fishFoodCategoryImage: null, comboPacksCategoryImage: null, customCategories: [],
};

function userId(req: Request) { return (req as AuthenticatedRequest).auth.userId; }

export async function getContactSettings(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await prisma.contactSettings.findUnique({ where: { id: 'store' } });
    return ok(res, data || DEFAULT_SETTINGS);
  } catch (error) { next(error); }
}

export async function updateContactSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const input = settingsInput.parse(req.body);
    const data = await prisma.contactSettings.upsert({ where: { id: 'store' }, create: { id: 'store', ...input }, update: input });
    return ok(res, data, 'Contact settings published');
  } catch (error) { next(error); }
}

export async function listAvailabilityAlerts(req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await prisma.availabilityAlert.findMany({ where: { userId: userId(req), isActive: true }, include: { product: { include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } } } }, orderBy: { createdAt: 'desc' } });
    return ok(res, rows);
  } catch (error) { next(error); }
}

export async function subscribeAvailability(req: Request, res: Response, next: NextFunction) {
  try {
    const productId = id.parse(req.params.productId);
    const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true, status: true, stock: true } });
    if (!product) throw new AppError(404, 'Product not found');
    if (product.status === 'ACTIVE' && product.stock > 0) throw new AppError(409, 'This product is currently available');
    const data = await prisma.availabilityAlert.upsert({
      where: { userId_productId: { userId: userId(req), productId } },
      create: { userId: userId(req), productId }, update: { isActive: true, notifiedAt: null },
      include: { product: true },
    });
    return ok(res, data, 'Availability alert enabled', 201);
  } catch (error) { next(error); }
}

export async function unsubscribeAvailability(req: Request, res: Response, next: NextFunction) {
  try {
    const productId = id.parse(req.params.productId);
    await prisma.availabilityAlert.updateMany({ where: { userId: userId(req), productId }, data: { isActive: false } });
    return ok(res, { productId }, 'Availability alert disabled');
  } catch (error) { next(error); }
}

export async function availabilityAlertCounts(_req: Request, res: Response, next: NextFunction) {
  try {
    const groups = await prisma.availabilityAlert.groupBy({ by: ['productId'], where: { isActive: true }, _count: { _all: true } });
    return ok(res, groups.map(group => ({ productId: group.productId, count: group._count._all })));
  } catch (error) { next(error); }
}

export async function recordRecentlyViewed(req: Request, res: Response, next: NextFunction) {
  try {
    const productId = id.parse(req.params.productId);
    const exists = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
    if (!exists) throw new AppError(404, 'Product not found');
    await prisma.recentlyViewed.upsert({ where: { userId_productId: { userId: userId(req), productId } }, create: { userId: userId(req), productId }, update: { viewedAt: new Date() } });
    return ok(res, { productId });
  } catch (error) { next(error); }
}

export async function listRecentlyViewed(req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await prisma.recentlyViewed.findMany({ where: { userId: userId(req) }, orderBy: { viewedAt: 'desc' }, take: 8, include: { product: { include: { images: { orderBy: { sortOrder: 'asc' } } } } } });
    return ok(res, rows);
  } catch (error) { next(error); }
}

export async function listAquarium(req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await prisma.aquariumProfile.findMany({ where: { userId: userId(req) }, include: { product: { include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } } }, reminders: { orderBy: { createdAt: 'desc' } } }, orderBy: { createdAt: 'desc' } });
    return ok(res, rows);
  } catch (error) { next(error); }
}

export async function updateAquarium(req: Request, res: Response, next: NextFunction) {
  try {
    const profileId = id.parse(req.params.id);
    const input = z.object({ fishName: z.string().trim().min(1).max(80).nullish(), notes: z.string().trim().max(2000).nullish() }).parse(req.body);
    const owned = await prisma.aquariumProfile.findFirst({ where: { id: profileId, userId: userId(req) } });
    if (!owned) throw new AppError(404, 'Aquarium profile not found');
    return ok(res, await prisma.aquariumProfile.update({ where: { id: profileId }, data: input, include: { product: { include: { images: { take: 1 } } }, reminders: true } }), 'Aquarium profile updated');
  } catch (error) { next(error); }
}

export async function listReminders(req: Request, res: Response, next: NextFunction) {
  try { return ok(res, await prisma.careReminder.findMany({ where: { userId: userId(req) }, orderBy: [{ isActive: 'desc' }, { nextDueAt: 'asc' }] })); }
  catch (error) { next(error); }
}

export async function createReminder(req: Request, res: Response, next: NextFunction) {
  try {
    const input = reminderInput.parse(req.body);
    if (input.aquariumProfileId) {
      const profile = await prisma.aquariumProfile.findFirst({ where: { id: input.aquariumProfileId, userId: userId(req) }, select: { id: true } });
      if (!profile) throw new AppError(404, 'Aquarium profile not found');
    }
    const data = await prisma.careReminder.create({ data: { ...input, userId: userId(req), nextDueAt: input.nextDueAt ? new Date(input.nextDueAt) : null } });
    return ok(res, data, 'Care reminder created', 201);
  } catch (error) { next(error); }
}

export async function updateReminder(req: Request, res: Response, next: NextFunction) {
  try {
    const reminderId = id.parse(req.params.id);
    const owned = await prisma.careReminder.findFirst({ where: { id: reminderId, userId: userId(req) } });
    if (!owned) throw new AppError(404, 'Reminder not found');
    const input = reminderInput.partial().parse(req.body);
    if (input.aquariumProfileId) {
      const profile = await prisma.aquariumProfile.findFirst({ where: { id: input.aquariumProfileId, userId: userId(req) }, select: { id: true } });
      if (!profile) throw new AppError(404, 'Aquarium profile not found');
    }
    const data = await prisma.careReminder.update({ where: { id: reminderId }, data: { ...input, nextDueAt: input.nextDueAt ? new Date(input.nextDueAt) : input.nextDueAt } });
    return ok(res, data, 'Care reminder updated');
  } catch (error) { next(error); }
}

export async function deleteReminder(req: Request, res: Response, next: NextFunction) {
  try {
    const reminderId = id.parse(req.params.id);
    const deleted = await prisma.careReminder.deleteMany({ where: { id: reminderId, userId: userId(req) } });
    if (!deleted.count) throw new AppError(404, 'Reminder not found');
    return ok(res, { id: reminderId }, 'Reminder deleted');
  } catch (error) { next(error); }
}

export async function listNotifications(req: Request, res: Response, next: NextFunction) {
  try { return ok(res, await prisma.notification.findMany({ where: { userId: userId(req) }, orderBy: { createdAt: 'desc' }, take: 100 })); }
  catch (error) { next(error); }
}

export async function markNotificationRead(req: Request, res: Response, next: NextFunction) {
  try {
    const notificationId = id.parse(req.params.id);
    const result = await prisma.notification.updateMany({ where: { id: notificationId, userId: userId(req) }, data: { isRead: true } });
    if (!result.count) throw new AppError(404, 'Notification not found');
    return ok(res, { id: notificationId });
  } catch (error) { next(error); }
}

export async function markAllNotificationsRead(req: Request, res: Response, next: NextFunction) {
  try { const result = await prisma.notification.updateMany({ where: { userId: userId(req), isRead: false }, data: { isRead: true } }); return ok(res, { updated: result.count }); }
  catch (error) { next(error); }
}

export async function listTickets(req: Request, res: Response, next: NextFunction) {
  try { return ok(res, await prisma.supportTicket.findMany({ where: { userId: userId(req) }, include: { order: { select: { orderNumber: true } } }, orderBy: { createdAt: 'desc' } })); }
  catch (error) { next(error); }
}

export async function createTicket(req: Request, res: Response, next: NextFunction) {
  try {
    const input = ticketInput.parse(req.body);
    if (input.orderId) {
      const order = await prisma.order.findFirst({ where: { id: input.orderId, userId: userId(req) }, select: { id: true } });
      if (!order) throw new AppError(404, 'Order not found');
    }
    const data = await prisma.supportTicket.create({ data: { ...input, userId: userId(req) } });
    await prisma.notification.create({ data: { userId: userId(req), title: 'Support request received', message: `Your support ticket “${data.subject}” was created.` } });
    return ok(res, data, 'Support ticket created', 201);
  } catch (error) { next(error); }
}

export async function listAdminTickets(_req: Request, res: Response, next: NextFunction) {
  try { return ok(res, await prisma.supportTicket.findMany({ include: { user: { select: { id: true, name: true, email: true, mobile: true } }, order: { select: { id: true, orderNumber: true } } }, orderBy: { createdAt: 'desc' } })); }
  catch (error) { next(error); }
}

export async function replyTicket(req: Request, res: Response, next: NextFunction) {
  try {
    const ticketId = id.parse(req.params.id);
    const input = z.object({ sellerReply: z.string().trim().min(2).max(5000), status: z.enum(['IN_REVIEW', 'RESOLVED', 'CLOSED']).default('IN_REVIEW') }).parse(req.body);
    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId }, include: { user: { select: { name: true, email: true } } } });
    if (!ticket) throw new AppError(404, 'Support ticket not found');
    const data = await prisma.$transaction(async tx => {
      const updated = await tx.supportTicket.update({ where: { id: ticketId }, data: input });
      await tx.notification.create({ data: { userId: ticket.userId, title: 'Support replied', message: `The seller replied to “${ticket.subject}”.` } });
      return updated;
    });
    void sendCustomerActivityEmail({ to: ticket.user.email, name: ticket.user.name, subject: `Response to your enquiry: ${ticket.subject}`, eyebrow: 'Customer support update', title: 'The seller replied to your enquiry', message: input.sellerReply, detail: `Ticket: ${ticket.subject}`, ctaLabel: 'View support response', ctaUrl: `${env.FRONTEND_URL}/account` }).catch(error => console.error('Support reply email failed', error));
    return ok(res, data, 'Reply sent');
  } catch (error) { next(error); }
}

export function getArrivalCareGuide(_req: Request, res: Response) {
  return ok(res, {
    title: 'Arrival care guide',
    disclaimer: 'General care guidance only. Follow any seller instructions supplied for the specific order and adapt to your aquarium conditions.',
    steps: [
      { title: 'Prepare before arrival', body: 'Have a stable, conditioned aquarium ready. Check temperature and water quality before opening the transport bag.' },
      { title: 'Keep lighting low', body: 'Dim the aquarium lights and avoid sudden movement while the fish settle.' },
      { title: 'Equalize temperature gradually', body: 'Keep the sealed bag at the aquarium surface briefly and avoid sudden temperature changes.' },
      { title: 'Transfer carefully', body: 'Use a clean net or suitable container. Avoid adding transport water to the main aquarium where practical.' },
      { title: 'Observe quietly', body: 'Feed lightly only after the fish settle, and contact support if you notice a concern.' },
    ],
  });
}

export async function listCareArticles(_req: Request, res: Response, next: NextFunction) { try { return ok(res, await prisma.careArticle.findMany({ where: { isPublished: true }, orderBy: { publishedAt: 'desc' } })); } catch (error) { next(error); } }
export async function getCareArticle(req: Request, res: Response, next: NextFunction) { try { const article = await prisma.careArticle.findFirst({ where: { slug: req.params.slug, isPublished: true } }); if (!article) throw new AppError(404, 'Care article not found'); return ok(res, article); } catch (error) { next(error); } }
