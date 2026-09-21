import { OrderStatus, ShipmentStatus, ProductCategory } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { env } from '../config/env.js';
import { sendCustomerActivityEmail } from './mail.service.js';

const orderInclude = {
  user: { select: { id: true, name: true, email: true, mobile: true } },
  items: true,
  payment: true,
  shipment: { include: { trackingEvents: { orderBy: { timestamp: 'asc' as const } } } },
} as const;

function money(value: unknown) {
  return Number(value || 0);
}

function titleForShipmentStatus(status: ShipmentStatus) {
  switch (status) {
    case ShipmentStatus.PACKING_SCHEDULED: return 'Packing Scheduled';
    case ShipmentStatus.SHIPPED: return 'Shipped / Dispatched';
    case ShipmentStatus.TRACKING_ADDED: return 'Tracking Code Added';
    case ShipmentStatus.RECEIVED: return 'Order Received';
    case ShipmentStatus.DELIVERY_FAILED: return 'Delivery Failed';
    case ShipmentStatus.RETURNED: return 'Returned';
    default: return 'Order Update';
  }
}

export function serializeOrder(order: any) {
  const address = (order.deliveryAddressSnapshot || {}) as Record<string, any>;
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    customerName: order.user?.name || address.fullName || '',
    customerEmail: order.user?.email || '',
    customerPhone: order.user?.mobile || address.mobile || '',
    items: order.items.map((item: any) => ({
      productId: item.productId,
      productName: item.productName,
      productImage: item.imageUrl || '',
      category: item.category === 'GUPPY' ? 'guppies' : item.category === 'FISH_FOOD' ? 'fish-food' : item.category === 'COMBO_PACK' ? 'combo-packs' : 'wholesale',
      quantity: item.quantity,
      unitPrice: money(item.unitPrice),
      totalPrice: money(item.lineTotal),
    })),
    subtotal: money(order.subtotal),
    shippingFee: money(order.shippingCharge),
    totalAmount: money(order.total),
    deliveryAddress: {
      id: order.addressId || 'order-address',
      fullName: address.fullName || order.user?.name || '',
      phone: address.mobile || order.user?.mobile || '',
      addressLine: address.line1 || '',
      area: address.area || address.line2 || '',
      city: address.city || '',
      district: address.district || '',
      state: address.state || 'Tamil Nadu',
      pincode: address.pincode || '',
    },
    paymentMethod: 'UPI',
    paymentStatus: order.paymentStatus === 'PAID' ? 'PAID' : order.paymentStatus === 'FAILED' ? 'FAILED' : 'PENDING',
    paymentId: order.payment?.utrNumber || undefined,
    orderStatus:
      order.status === OrderStatus.PAYMENT_VERIFICATION_PENDING ? 'ORDER_PLACED' :
      order.status === OrderStatus.ORDER_CONFIRMED ? 'PAYMENT_CONFIRMED' :
      order.status === OrderStatus.PACKING_SCHEDULED ? 'PROCESSING' :
      order.status === OrderStatus.SHIPPED || order.status === OrderStatus.TRACKING_ADDED ? 'SHIPPED' :
      order.status === OrderStatus.RECEIVED ? 'DELIVERED' :
      order.status === OrderStatus.CANCELLED ? 'CANCELLED' : 'PAYMENT_CONFIRMED',
    createdAt: order.createdAt.toISOString(),
    packingScheduledAt: order.packingScheduledAt?.toISOString(),
    dispatchedAt: order.shippedAt?.toISOString(),
    receivedAt: order.receivedAt?.toISOString(),
    receivedConfirmedBy: order.receivedConfirmedBy || undefined,
    shipment: order.shipment ? {
      id: order.shipment.id,
      courierName: order.shipment.courierName || '',
      awbNumber: order.shipment.trackingNumber || '',
      trackingUrl: order.shipment.trackingUrl || '',
      shippedDate: order.shipment.shippedAt?.toISOString(),
      estimatedDelivery: order.shipment.estimatedDeliveryTo?.toISOString() || order.shipment.estimatedDeliveryFrom?.toISOString(),
      currentStatus:
        order.shipment.status === ShipmentStatus.RECEIVED ? 'DELIVERED' :
        [ShipmentStatus.SHIPPED, ShipmentStatus.TRACKING_ADDED].includes(order.shipment.status) ? 'SHIPPED' :
        order.shipment.status === ShipmentStatus.PACKING_SCHEDULED ? 'PROCESSING' : 'PAYMENT_CONFIRMED',
      trackingEvents: order.shipment.trackingEvents.map((event: any) => ({
        id: event.id,
        status:
          event.status === ShipmentStatus.RECEIVED ? 'DELIVERED' :
          [ShipmentStatus.SHIPPED, ShipmentStatus.TRACKING_ADDED].includes(event.status) ? 'SHIPPED' :
          event.status === ShipmentStatus.PACKING_SCHEDULED ? 'PROCESSING' : 'PAYMENT_CONFIRMED',
        title: titleForShipmentStatus(event.status),
        location: event.location || '',
        description: event.description || '',
        timestamp: event.timestamp.toISOString(),
      })),
    } : undefined,
  };
}

async function notify(userId: string, title: string, message: string) {
  await prisma.notification.create({ data: { userId, title, message, channel: 'WEBSITE', sentAt: new Date() } });
}

function emailOrderActivity(order: any, subject: string, eyebrow: string, title: string, message: string, detail?: string) {
  if (!order.user?.email) return;
  void sendCustomerActivityEmail({ to: order.user.email, name: order.user.name || 'Customer', subject, eyebrow, title, message, detail, ctaLabel: 'View order tracking', ctaUrl: `${env.FRONTEND_URL}/track-order/${encodeURIComponent(order.orderNumber)}` }).catch(error => console.error('Customer order email failed', error));
}

export async function listCustomerOrders(userId: string) {
  const orders = await prisma.order.findMany({ where: { userId }, include: orderInclude, orderBy: { createdAt: 'desc' } });
  return orders.map(serializeOrder);
}

export async function getCustomerOrder(userId: string, idOrNumber: string) {
  const order = await prisma.order.findFirst({
    where: { userId, OR: [{ id: idOrNumber }, { orderNumber: idOrNumber }] },
    include: orderInclude,
  });
  if (!order) throw new AppError(404, 'Order not found');
  return serializeOrder(order);
}

export async function listAdminOrders() {
  const orders = await prisma.order.findMany({ where: { NOT: { status: 'CANCELLED', paymentStatus: 'FAILED' } }, include: orderInclude, orderBy: { createdAt: 'desc' } });
  return orders.map(serializeOrder);
}

async function getAdminOrderRaw(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: orderInclude });
  if (!order) throw new AppError(404, 'Order not found');
  if (order.paymentStatus !== 'PAID') throw new AppError(409, 'Only paid orders can be fulfilled');
  if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.RECEIVED) {
    throw new AppError(409, 'This order can no longer be changed');
  }
  return order;
}

export async function schedulePacking(orderId: string, packingScheduledAt: Date) {
  const order = await getAdminOrderRaw(orderId);
  if (order.status !== OrderStatus.ORDER_CONFIRMED && order.status !== OrderStatus.PACKING_SCHEDULED) {
    throw new AppError(409, 'Packing can only be scheduled before dispatch');
  }
  if (packingScheduledAt.getTime() < Date.now() - 5 * 60_000) {
    throw new AppError(422, 'Packing time cannot be in the past');
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status: OrderStatus.PACKING_SCHEDULED, packingScheduledAt } });
    const shipment = await tx.shipment.upsert({
      where: { orderId },
      create: { orderId, status: ShipmentStatus.PACKING_SCHEDULED, packingScheduledAt },
      update: { status: ShipmentStatus.PACKING_SCHEDULED, packingScheduledAt },
    });
    await tx.trackingEvent.create({
      data: { shipmentId: shipment.id, status: ShipmentStatus.PACKING_SCHEDULED, description: `Packing scheduled for ${packingScheduledAt.toISOString()}` },
    });
  });
  await notify(order.userId, 'Packing scheduled', `Your order ${order.orderNumber} is scheduled for packing.`);
  emailOrderActivity(order, `Packing scheduled: ${order.orderNumber}`, 'Order preparation update', 'Your aquarium order is being prepared', `The seller scheduled packing for your order ${order.orderNumber}.`, `Packing time: ${packingScheduledAt.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })}`);
  return getCustomerOrder(order.userId, orderId);
}

export async function markDispatched(orderId: string, input: { courierName: string; trackingNumber?: string; trackingUrl?: string; estimatedDeliveryFrom?: Date; estimatedDeliveryTo?: Date }) {
  const order = await getAdminOrderRaw(orderId);
  if (!order.packingScheduledAt) throw new AppError(409, 'Schedule packing before dispatching the order');
  if (order.status !== OrderStatus.PACKING_SCHEDULED && order.status !== OrderStatus.SHIPPED && order.status !== OrderStatus.TRACKING_ADDED) {
    throw new AppError(409, 'Order is not ready for dispatch');
  }
  const now = new Date();
  const trackingNumber = input.trackingNumber?.trim() || null;
  const nextOrderStatus = trackingNumber ? OrderStatus.TRACKING_ADDED : OrderStatus.SHIPPED;
  const nextShipmentStatus = trackingNumber ? ShipmentStatus.TRACKING_ADDED : ShipmentStatus.SHIPPED;

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status: nextOrderStatus, shippedAt: now } });
    const shipment = await tx.shipment.upsert({
      where: { orderId },
      create: {
        orderId,
        status: nextShipmentStatus,
        courierName: input.courierName.trim(),
        trackingNumber,
        trackingUrl: input.trackingUrl?.trim() || null,
        packingScheduledAt: order.packingScheduledAt,
        shippedAt: now,
        estimatedDeliveryFrom: input.estimatedDeliveryFrom,
        estimatedDeliveryTo: input.estimatedDeliveryTo,
        lastTrackingUpdate: now,
      },
      update: {
        status: nextShipmentStatus,
        courierName: input.courierName.trim(),
        trackingNumber,
        trackingUrl: input.trackingUrl?.trim() || null,
        shippedAt: now,
        estimatedDeliveryFrom: input.estimatedDeliveryFrom,
        estimatedDeliveryTo: input.estimatedDeliveryTo,
        lastTrackingUpdate: now,
      },
    });
    await tx.trackingEvent.create({
      data: {
        shipmentId: shipment.id,
        status: ShipmentStatus.SHIPPED,
        location: input.courierName.trim(),
        description: 'The seller marked the order as shipped / dispatched.',
        timestamp: now,
      },
    });
    if (trackingNumber) {
      await tx.trackingEvent.create({
        data: {
          shipmentId: shipment.id,
          status: ShipmentStatus.TRACKING_ADDED,
          location: input.courierName.trim(),
          description: `Tracking code: ${trackingNumber}`,
          timestamp: now,
        },
      });
    }
  });
  await notify(order.userId, 'Order dispatched', `Your order ${order.orderNumber} has been dispatched.`);
  emailOrderActivity(order, `Order dispatched: ${order.orderNumber}`, 'Delivery update', 'Your order is on its way', `The seller dispatched your order through ${input.courierName.trim()}.`, trackingNumber ? `Tracking / AWB: ${trackingNumber}` : 'The seller will add the tracking code when it becomes available.');
  return getCustomerOrder(order.userId, orderId);
}

export async function updateTracking(orderId: string, input: { courierName?: string; trackingNumber: string; trackingUrl?: string; estimatedDeliveryFrom?: Date; estimatedDeliveryTo?: Date }) {
  const order = await getAdminOrderRaw(orderId);
  if (order.status !== OrderStatus.SHIPPED && order.status !== OrderStatus.TRACKING_ADDED) throw new AppError(409, 'Dispatch the order before adding tracking');
  const trackingNumber = input.trackingNumber.trim();
  if (!trackingNumber) throw new AppError(422, 'Tracking code is required');
  const shipment = await prisma.shipment.findUnique({ where: { orderId } });
  if (!shipment) throw new AppError(409, 'Shipment record not found');
  const now = new Date();

  await prisma.$transaction([
    prisma.order.update({ where: { id: orderId }, data: { status: OrderStatus.TRACKING_ADDED } }),
    prisma.shipment.update({
      where: { orderId },
      data: {
        status: ShipmentStatus.TRACKING_ADDED,
        courierName: input.courierName?.trim() || shipment.courierName,
        trackingNumber,
        trackingUrl: input.trackingUrl?.trim() || shipment.trackingUrl,
        estimatedDeliveryFrom: input.estimatedDeliveryFrom,
        estimatedDeliveryTo: input.estimatedDeliveryTo,
        lastTrackingUpdate: now,
      },
    }),
    prisma.trackingEvent.create({
      data: { shipmentId: shipment.id, status: ShipmentStatus.TRACKING_ADDED, location: input.courierName?.trim() || shipment.courierName, description: `Tracking code: ${trackingNumber}`, timestamp: now },
    }),
  ]);
  await notify(order.userId, 'Tracking code added', `Tracking is now available for order ${order.orderNumber}.`);
  emailOrderActivity(order, `Tracking available: ${order.orderNumber}`, 'Courier tracking update', 'Your tracking code is ready', `Use the tracking details below to follow order ${order.orderNumber}.`, `Tracking / AWB: ${trackingNumber}${input.courierName ? ` • Courier: ${input.courierName}` : ''}`);
  return getCustomerOrder(order.userId, orderId);
}

async function createAquariumProfilesForDeliveredOrder(orderId: string, userId: string) {
  const items = await prisma.orderItem.findMany({ where: { orderId, category: ProductCategory.GUPPY } });
  for (const item of items) {
    const existing = await prisma.aquariumProfile.findFirst({ where: { userId, sourceOrderId: orderId, productId: item.productId } });
    if (!existing) {
      await prisma.aquariumProfile.create({
        data: { userId, productId: item.productId, sourceOrderId: orderId, variety: item.productName, purchasedAt: new Date() },
      });
    }
  }
}

export async function confirmReceived(orderId: string, confirmedBy: 'CUSTOMER' | 'SELLER', customerUserId?: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: orderInclude });
  if (!order) throw new AppError(404, 'Order not found');
  if (customerUserId && order.userId !== customerUserId) throw new AppError(404, 'Order not found');
  if (order.paymentStatus !== 'PAID') throw new AppError(409, 'Order payment is not complete');
  if (order.status === OrderStatus.RECEIVED) return serializeOrder(order);
  if (order.status !== OrderStatus.SHIPPED && order.status !== OrderStatus.TRACKING_ADDED) throw new AppError(409, 'Only a dispatched order can be marked received');
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status: OrderStatus.RECEIVED, receivedAt: now, receivedConfirmedBy: confirmedBy } });
    const shipment = await tx.shipment.upsert({
      where: { orderId },
      create: { orderId, status: ShipmentStatus.RECEIVED, shippedAt: order.shippedAt, lastTrackingUpdate: now },
      update: { status: ShipmentStatus.RECEIVED, lastTrackingUpdate: now },
    });
    await tx.trackingEvent.create({ data: { shipmentId: shipment.id, status: ShipmentStatus.RECEIVED, location: (order.deliveryAddressSnapshot as any)?.city || null, description: `Receipt confirmed by ${confirmedBy.toLowerCase()}.`, timestamp: now } });
  });
  await createAquariumProfilesForDeliveredOrder(orderId, order.userId);
  await notify(order.userId, 'Order received', `Order ${order.orderNumber} is marked received. You can now rate and review your purchase.`);
  emailOrderActivity(order, `Delivery completed: ${order.orderNumber}`, 'Verified delivery update', 'Your order is marked received', `Order ${order.orderNumber} has been marked received. You can now share a verified-purchase review from your account.`, 'Thank you for choosing Sweety Birds & Fishes.');
  return getCustomerOrder(order.userId, orderId);
}
