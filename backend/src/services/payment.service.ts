import crypto from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { AppError } from "../middleware/errorHandler.js";
import { sendCustomerActivityEmail, sendManualPaymentReviewEmail } from "./mail.service.js";
import { decryptSensitive, encryptSensitive } from "../utils/encryption.js";

type CheckoutAddressInput = {
  fullName: string;
  mobile: string;
  line1: string;
  line2?: string | null;
  area?: string | null;
  city: string;
  district: string;
  state: string;
  pincode: string;
};
type Item = {
  productId: string;
  productName: string;
  category: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};
type Address = {
  id: string;
  fullName: string;
  mobile: string;
  line1: string;
  line2: string | null;
  area: string | null;
  city: string;
  district: string;
  state: string;
  pincode: string;
  courierName: string | null;
  estimatedDeliveryDays: number | null;
};
const money = (v: Prisma.Decimal | number | string) => Number(v);
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);
// Neon/serverless PostgreSQL can take several seconds to wake a pooled connection.
// Keep payment writes atomic, but allow enough time for legitimate cold starts.
const paymentTransactionOptions = { maxWait: 15_000, timeout: 30_000 } as const;
async function newOrderNumber() {
  for (let i = 0; i < 5; i++) {
    const value = `SBF-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;
    if (
      !(await prisma.manualPaymentAttempt.findUnique({
        where: { orderNumber: value },
        select: { id: true },
      }))
    )
      return value;
  }
  throw new AppError(
    503,
    "Unable to allocate a secure order reference. Please retry.",
  );
}

async function releaseAttempt(
  id: string,
  status: "UNSUCCESSFUL" | "EXPIRED" | "CANCELLED",
  reason?: string,
) {
  return prisma.$transaction(
    async (tx) => {
      const claim = await tx.manualPaymentAttempt.updateMany({
        where: { id, status: { in: ["CREATED", "VERIFICATION_PENDING"] } },
        data: {
          status,
          failureReason: reason || null,
          reviewedAt: status === "UNSUCCESSFUL" ? new Date() : undefined,
        },
      });
      if (!claim.count) return false;
      const rows = await tx.stockReservation.findMany({
        where: { sessionId: id, status: "ACTIVE" },
      });
      for (const row of rows)
        await tx.product.update({
          where: { id: row.productId },
          data: { stock: { increment: row.quantity } },
        });
      await tx.stockReservation.updateMany({
        where: { sessionId: id, status: "ACTIVE" },
        data: { status: status === "EXPIRED" ? "EXPIRED" : "RELEASED" },
      });
      return true;
    },
    {
      ...paymentTransactionOptions,
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}
async function cleanupExpired(userId?: string) {
  const rows = await prisma.manualPaymentAttempt.findMany({
    where: {
      ...(userId ? { userId } : {}),
      status: "CREATED",
      expiresAt: { lte: new Date() },
    },
    select: { id: true },
    take: 50,
  });
  for (const row of rows)
    await releaseAttempt(
      row.id,
      "EXPIRED",
      "Payment window expired before Transaction ID submission",
    );
}

export async function buildCheckoutSnapshot(
  userId: string,
  addressInput: { addressId?: string; address?: CheckoutAddressInput },
) {
  let address: any = null;
  if (addressInput.addressId)
    address = await prisma.address.findFirst({
      where: { id: addressInput.addressId, userId },
    });
  else if (addressInput.address) {
    const a = addressInput.address;
    const digits = a.mobile.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
    if (!/^[6-9]\d{9}$/.test(digits))
      throw new AppError(422, "Enter a valid 10-digit Indian mobile number");
    address = {
      ...a,
      id: null,
      mobile: `+91${digits}`,
      line2: a.line2?.trim() || null,
      area: a.area?.trim() || null,
    };
  }
  if (!address) throw new AppError(422, "Choose or enter a delivery address");
  if (
    address.state.toLowerCase() !== "tamil nadu" ||
    !/^\d{6}$/.test(address.pincode)
  )
    throw new AppError(422, "A valid Tamil Nadu delivery address is required");
  const [serviceability, cart, settings] = await Promise.all([
    prisma.serviceablePincode.findFirst({
      where: {
        pincode: address.pincode,
        isActive: true,
        state: { equals: "Tamil Nadu", mode: "insensitive" },
      },
    }),
    prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          orderBy: { createdAt: "asc" },
          include: {
            product: { include: { images: { orderBy: { sortOrder: "asc" } } } },
          },
        },
      },
    }),
    prisma.contactSettings.findUnique({ where: { id: "store" } }),
  ]);
  if (!serviceability)
    throw new AppError(
      422,
      "This PIN code is not currently enabled for delivery",
    );
  if (!cart?.items.length) throw new AppError(422, "Your cart is empty");
  const items: Item[] = cart.items.map(({ product, quantity }) => {
    if (product.status !== "ACTIVE" || product.stock < quantity)
      throw new AppError(
        409,
        `${product.name} is unavailable in the requested quantity`,
      );
    const active =
      product.offerPrice != null &&
      product.offerEndsAt != null &&
      product.offerEndsAt > new Date();
    const unitPrice = money(active ? product.offerPrice! : product.price);
    return {
      productId: product.id,
      productName: product.name,
      category: product.category,
      imageUrl:
        product.images.find((x) => x.isPrimary)?.url ||
        product.images[0]?.url ||
        null,
      unitPrice,
      quantity,
      lineTotal: Number((unitPrice * quantity).toFixed(2)),
    };
  });
  const subtotal = Number(
    items.reduce((s, x) => s + x.lineTotal, 0).toFixed(2),
  );
  const shippingCharge =
    subtotal >= env.FREE_SHIPPING_THRESHOLD
      ? 0
      : Number(
          money(
            settings?.courierPackingCharge ?? env.STANDARD_SHIPPING_FEE,
          ).toFixed(2),
        );
  const discount = 0;
  const total = Number((subtotal + shippingCharge - discount).toFixed(2));
  const addressSnapshot: Address = {
    id: address.id || "checkout-address",
    fullName: address.fullName,
    mobile: address.mobile,
    line1: address.line1,
    line2: address.line2 || null,
    area: address.area || null,
    city: address.city,
    district: address.district,
    state: address.state,
    pincode: address.pincode,
    courierName: serviceability.courierName,
    estimatedDeliveryDays: serviceability.estimatedDeliveryDays,
  };
  return {
    address,
    items,
    subtotal,
    shippingCharge,
    discount,
    total,
    addressSnapshot,
    upiId: settings?.upiId || null,
    upiPayeeName:
      settings?.upiPayeeName ||
      settings?.businessName ||
      "Sweety Birds & Fishes",
  };
}

async function createIntent(input: {
  userId: string;
  addressId?: string;
  address?: CheckoutAddressInput;
  customerNote?: string;
  idempotencyKey?: string;
}) {
  await cleanupExpired(input.userId);
  if (input.idempotencyKey) {
    const old = await prisma.manualPaymentAttempt.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
      include: { order: true },
    });
    if (
      old &&
      old.userId === input.userId &&
      old.status === "CREATED" &&
      old.expiresAt > new Date()
    )
      return old;
    if (old) throw new AppError(409, "This payment attempt cannot be reused");
  }
  const c = await buildCheckoutSnapshot(input.userId, input);
  if (!c.upiId)
    throw new AppError(503, "Seller UPI ID has not been configured yet");
  const expiresAt = new Date(
    Date.now() + env.PAYMENT_SESSION_TTL_MINUTES * 60000,
  );
  const orderNumber = await newOrderNumber();
  const attempt = await prisma.$transaction(
    async (tx) => {
      const created = await tx.manualPaymentAttempt.create({
        data: {
          userId: input.userId,
          addressId: c.address.id || null,
          orderNumber,
          idempotencyKey: input.idempotencyKey || null,
          currency: "INR",
          subtotal: c.subtotal,
          shippingCharge: c.shippingCharge,
          discount: c.discount,
          total: c.total,
          cartSnapshot: c.items as unknown as Prisma.InputJsonValue,
          addressSnapshot:
            c.addressSnapshot as unknown as Prisma.InputJsonValue,
          customerNote: input.customerNote?.slice(0, 500) || null,
          expiresAt,
        },
      });
      for (const item of c.items) {
        const reserved = await tx.product.updateMany({
          where: {
            id: item.productId,
            status: "ACTIVE",
            stock: { gte: item.quantity },
          },
          data: { stock: { decrement: item.quantity } },
        });
        if (!reserved.count)
          throw new AppError(
            409,
            `${item.productName} stock changed. Review your cart.`,
          );
        await tx.stockReservation.create({
          data: {
            sessionId: created.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            expiresAt,
          },
        });
      }
      return created;
    },
    {
      ...paymentTransactionOptions,
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
  const params = new URLSearchParams({
    pa: c.upiId,
    pn: c.upiPayeeName,
    am: c.total.toFixed(2),
    cu: "INR",
    tn: `Order ${orderNumber}`,
  });
  return {
    ...attempt,
    upiUri: `upi://pay?${params.toString()}`,
    upiId: c.upiId,
    upiPayeeName: c.upiPayeeName,
  };
}

async function submit(input: {
  userId: string;
  attemptId: string;
  utrNumber: string;
  proofImageData?: string;
}) {
  const utr = input.utrNumber.replace(/\s/g, "").toUpperCase();
  if (!/^[A-Z0-9]{6,30}$/.test(utr))
    throw new AppError(422, "Enter a valid 6–30 character Transaction ID");
  if (
    input.proofImageData &&
    !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(
      input.proofImageData,
    )
  )
    throw new AppError(422, "Payment proof must be JPG, PNG or WebP");
  if (input.proofImageData && input.proofImageData.length > 2800000)
    throw new AppError(422, "Payment proof must be no larger than 2 MB");
  if (
    await prisma.manualPaymentAttempt.findUnique({
      where: { utrNumber: utr },
      select: { id: true },
    })
  )
    throw new AppError(409, "This Transaction ID has already been submitted");
  const result = await prisma.$transaction(
    async (tx) => {
      const attempt = await tx.manualPaymentAttempt.findFirst({
        where: { id: input.attemptId, userId: input.userId },
        include: { user: true, order: true },
      });
      if (!attempt) throw new AppError(404, "Payment attempt not found");
      if (attempt.order)
        return { order: attempt.order, customer: attempt.user };
      if (attempt.status !== "CREATED" || attempt.expiresAt <= new Date())
        throw new AppError(409, "This payment window is no longer active");
      const items = attempt.cartSnapshot as unknown as Item[];
      const address = attempt.addressSnapshot as unknown as Address;
      const now = new Date();
      const order = await tx.order.create({
        data: {
          orderNumber: attempt.orderNumber,
          userId: attempt.userId,
          addressId: attempt.addressId,
          status: "PAYMENT_VERIFICATION_PENDING",
          paymentStatus: "PENDING",
          subtotal: attempt.subtotal,
          shippingCharge: attempt.shippingCharge,
          discount: attempt.discount,
          total: attempt.total,
          customerNote: attempt.customerNote,
          manualPaymentAttemptId: attempt.id,
          deliveryAddressSnapshot:
            attempt.addressSnapshot as Prisma.InputJsonValue,
          items: {
            create: items.map((x) => ({
              productId: x.productId,
              productName: x.productName,
              category: x.category as any,
              imageUrl: x.imageUrl,
              unitPrice: x.unitPrice,
              quantity: x.quantity,
              lineTotal: x.lineTotal,
            })),
          },
          payment: {
            create: {
              method: "MANUAL_UPI",
              status: "PENDING",
              utrNumber: utr,
              amount: attempt.total,
              currency: "INR",
            },
          },
          shipment: {
            create: {
              courierName: address.courierName,
              status: "NOT_CREATED",
              estimatedDeliveryFrom: addDays(
                now,
                Math.max(1, (address.estimatedDeliveryDays || 3) - 1),
              ),
              estimatedDeliveryTo: addDays(
                now,
                (address.estimatedDeliveryDays || 3) + 1,
              ),
            },
          },
        },
        include: { items: true, payment: true, shipment: true },
      });
      await tx.manualPaymentAttempt.update({
        where: { id: attempt.id },
        data: {
          status: "VERIFICATION_PENDING",
          utrNumber: utr,
          proofImageData: null,
          proofEncrypted: encryptSensitive(input.proofImageData),
          submittedAt: now,
        },
      });
      await tx.sellerNotification.create({
        data: {
          type: "PAYMENT_REVIEW",
          title: "Payment verification required",
          message: `${attempt.user.name} submitted ${utr} for ${attempt.orderNumber} (₹${money(attempt.total).toFixed(2)}).`,
          entityId: attempt.id,
        },
      });
      await tx.notification.create({
        data: {
          userId: attempt.userId,
          title: "Payment verification pending",
          message: `We received Transaction ID ${utr} for ${attempt.orderNumber}. The seller will verify it manually.`,
        },
      });
      return { order, customer: attempt.user };
    },
    {
      ...paymentTransactionOptions,
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
  void sendManualPaymentReviewEmail({
    orderNumber: result.order.orderNumber,
    customerName: result.customer.name,
    customerEmail: result.customer.email,
    customerMobile: result.customer.mobile,
    amount: money(result.order.total),
    transactionId: utr,
    reviewUrl: `${env.FRONTEND_URL}/admin`,
  }).catch((e) => console.error("Payment review email failed", e));
  return result.order;
}

async function review(
  attemptId: string,
  status: "PENDING" | "PAID" | "UNSUCCESSFUL",
  reviewedById: string,
  reason?: string,
) {
  const attempt = await prisma.manualPaymentAttempt.findUnique({
    where: { id: attemptId },
    include: { order: true, user: { select: { name: true, email: true } } },
  });
  if (!attempt?.order) throw new AppError(404, "Submitted payment not found");
  await prisma.sellerNotification.updateMany({
    where: { entityId: attemptId },
    data: { isRead: true },
  });
  if (status === "PENDING") {
    await prisma.$transaction([
      prisma.manualPaymentAttempt.update({
        where: { id: attemptId },
        data: {
          reviewedAt: new Date(),
          reviewedById,
          failureReason: reason || null,
        },
      }),
      prisma.notification.create({
        data: {
          userId: attempt.userId,
          title: "Payment verification still pending",
          message: `The seller reviewed ${attempt.orderNumber}, but payment confirmation is still pending.`,
        },
      }),
    ]);
    void sendCustomerActivityEmail({ to: attempt.user.email, name: attempt.user.name, subject: `Payment review update: ${attempt.orderNumber}`, eyebrow: 'Manual payment review', title: 'Your payment review is still pending', message: `The seller reviewed order ${attempt.orderNumber}, but needs more time or information before confirming the payment.`, detail: reason || 'Your order remains safely recorded and has not been confirmed yet.', ctaLabel: 'View your orders', ctaUrl: `${env.FRONTEND_URL}/account` }).catch(error => console.error('Payment status email failed', error));
    return prisma.order.findUnique({
      where: { id: attempt.order.id },
      include: { items: true, payment: true, shipment: true },
    });
  }
  if (status === "UNSUCCESSFUL") {
    await prisma.$transaction(async (tx) => {
      await tx.manualPaymentAttempt.update({
        where: { id: attemptId },
        data: {
          status: "UNSUCCESSFUL",
          reviewedAt: new Date(),
          reviewedById,
          failureReason: reason || "Payment could not be verified",
        },
      });
      await tx.order.update({
        where: { id: attempt.order!.id },
        data: {
          status: "CANCELLED",
          paymentStatus: "FAILED",
          cancellationReason: reason || "Payment verification unsuccessful",
        },
      });
      await tx.payment.update({
        where: { orderId: attempt.order!.id },
        data: {
          status: "FAILED",
          failureReason: reason || "Payment verification unsuccessful",
        },
      });
      const rows = await tx.stockReservation.findMany({
        where: { sessionId: attemptId, status: "ACTIVE" },
      });
      for (const row of rows)
        await tx.product.update({
          where: { id: row.productId },
          data: { stock: { increment: row.quantity } },
        });
      await tx.stockReservation.updateMany({
        where: { sessionId: attemptId, status: "ACTIVE" },
        data: { status: "RELEASED" },
      });
      await tx.notification.create({
        data: {
          userId: attempt.userId,
          title: "Payment unsuccessful",
          message: `Payment for ${attempt.orderNumber} could not be verified. The reference is permanently closed.`,
        },
      });
    }, paymentTransactionOptions);
    void sendCustomerActivityEmail({ to: attempt.user.email, name: attempt.user.name, subject: `Payment could not be verified: ${attempt.orderNumber}`, eyebrow: 'Payment review completed', title: 'Payment verification was unsuccessful', message: `The submitted payment for ${attempt.orderNumber} could not be verified, so the order was cancelled and its stock reservation was released.`, detail: reason || 'Please check your bank or UPI transaction history before trying again.', ctaLabel: 'Return to the store', ctaUrl: `${env.FRONTEND_URL}/shop` }).catch(error => console.error('Payment status email failed', error));
    return { orderNumber: attempt.orderNumber, status: "UNSUCCESSFUL" };
  }
  const confirmed = await prisma.$transaction(async (tx) => {
    await tx.manualPaymentAttempt.update({
      where: { id: attemptId },
      data: {
        status: "PAID",
        paidAt: new Date(),
        reviewedAt: new Date(),
        reviewedById,
        failureReason: null,
      },
    });
    const order = await tx.order.update({
      where: { id: attempt.order!.id },
      data: { status: "ORDER_CONFIRMED", paymentStatus: "PAID" },
      include: { items: true, payment: true, shipment: true },
    });
    await tx.payment.update({
      where: { orderId: order.id },
      data: { status: "PAID", paidAt: new Date(), failureReason: null },
    });
    await tx.stockReservation.updateMany({
      where: { sessionId: attemptId, status: "ACTIVE" },
      data: { status: "CONSUMED" },
    });
    const cart = await tx.cart.findUnique({
      where: { userId: attempt.userId },
    });
    if (cart)
      await tx.cartItem.deleteMany({
        where: {
          cartId: cart.id,
          productId: {
            in: (attempt.cartSnapshot as unknown as Item[]).map(
              (x) => x.productId,
            ),
          },
        },
      });
    await tx.notification.create({
      data: {
        userId: attempt.userId,
        title: "Payment verified — order confirmed",
        message: `Your payment for ${attempt.orderNumber} was verified and the order is confirmed.`,
      },
    });
    return order;
  }, paymentTransactionOptions);
  void sendCustomerActivityEmail({ to: attempt.user.email, name: attempt.user.name, subject: `Order confirmed: ${attempt.orderNumber}`, eyebrow: 'Payment verified manually', title: 'Your order is confirmed', message: `The seller verified your UPI payment for ${attempt.orderNumber}. Your aquarium order is now confirmed and will move to packing.`, detail: `Paid amount: ₹${money(attempt.total).toFixed(2)}`, ctaLabel: 'View order status', ctaUrl: `${env.FRONTEND_URL}/track-order/${encodeURIComponent(attempt.orderNumber)}` }).catch(error => console.error('Payment status email failed', error));
  return confirmed;
}

export const paymentService = {
  previewCheckout: async (input: {
    userId: string;
    addressId?: string;
    address?: CheckoutAddressInput;
  }) => {
    await cleanupExpired(input.userId);
    const c = await buildCheckoutSnapshot(input.userId, input);
    return {
      items: c.items,
      subtotal: c.subtotal,
      shippingCharge: c.shippingCharge,
      discount: c.discount,
      total: c.total,
      currency: "INR",
      courierName: c.addressSnapshot.courierName,
      estimatedDeliveryDays: c.addressSnapshot.estimatedDeliveryDays,
      pincode: c.addressSnapshot.pincode,
      district: c.addressSnapshot.district,
      ready: true,
    };
  },
  createIntent,
  submit,
  review,
  cancel: async (userId: string, id: string) => {
    const row = await prisma.manualPaymentAttempt.findFirst({
      where: { id, userId },
    });
    if (!row) throw new AppError(404, "Payment attempt not found");
    return {
      released: await releaseAttempt(
        id,
        "CANCELLED",
        "Customer cancelled payment",
      ),
    };
  },
  status: async (userId: string, id: string) => {
    const row = await prisma.manualPaymentAttempt.findFirst({
      where: { id, userId },
      include: {
        order: { include: { items: true, payment: true, shipment: true } },
      },
    });
    if (!row) throw new AppError(404, "Payment attempt not found");
    return {
      status: row.status,
      orderNumber: row.orderNumber,
      order: row.order,
    };
  },
  adminList: async (audit = false) => {
    const rows = await prisma.manualPaymentAttempt.findMany({
      where: audit
        ? { status: "UNSUCCESSFUL" }
        : { status: "VERIFICATION_PENDING" },
      include: {
        user: { select: { name: true, email: true, mobile: true } },
        order: { include: { payment: true } },
      },
      orderBy: { submittedAt: "desc" },
    });
    return rows.map((row) => ({
      ...row,
      proofImageData: decryptSensitive(row.proofEncrypted) || row.proofImageData,
      proofEncrypted: undefined,
    }));
  },
  notifications: () =>
    prisma.sellerNotification.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  markNotificationRead: (id: string) =>
    prisma.sellerNotification.update({ where: { id }, data: { isRead: true } }),
  cleanupExpiredSessions: () => cleanupExpired(),
};
