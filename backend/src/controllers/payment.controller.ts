import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { paymentService } from "../services/payment.service.js";
import { ok } from "../utils/apiResponse.js";
const address = z.object({
  fullName: z.string().trim().min(2).max(100),
  mobile: z.string().trim().min(10).max(18),
  line1: z.string().trim().min(3).max(180),
  line2: z.string().trim().max(180).nullish(),
  area: z.string().trim().max(120).nullish(),
  city: z.string().trim().min(2).max(100),
  district: z.string().trim().min(2).max(100),
  state: z.literal("Tamil Nadu"),
  pincode: z.string().regex(/^\d{6}$/),
});
const intent = z
  .object({
    addressId: z.string().min(1).optional(),
    address: address.optional(),
    customerNote: z.string().trim().max(500).optional(),
  })
  .refine(
    (v) => !!(v.addressId || v.address),
    "A delivery address is required",
  );
const auth = (req: Request) => (req as AuthenticatedRequest).auth;
export async function createUpiIntent(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = intent.parse(req.body);
    const key = req.header("Idempotency-Key")?.trim();
    return ok(
      res,
      await paymentService.createIntent({
        ...body,
        userId: auth(req).userId,
        idempotencyKey: key
          ? `${auth(req).userId}:${key}`.slice(0, 190)
          : undefined,
      }),
      "UPI payment reference created",
      201,
    );
  } catch (e) {
    next(e);
  }
}
export async function submitUpiPayment(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = z
      .object({
        attemptId: z.string().min(1),
        utrNumber: z.string().trim().min(6).max(30),
        proofImageData: z.string().max(2800000).optional(),
      })
      .parse(req.body);
    return ok(
      res,
      await paymentService.submit({ ...body, userId: auth(req).userId }),
      "Payment submitted for seller verification",
      201,
    );
  } catch (e) {
    next(e);
  }
}
export async function cancelUpiIntent(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = z.object({ attemptId: z.string().min(1) }).parse(req.body);
    return ok(
      res,
      await paymentService.cancel(auth(req).userId, body.attemptId),
    );
  } catch (e) {
    next(e);
  }
}
export async function upiStatus(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    return ok(
      res,
      await paymentService.status(auth(req).userId, req.params.id),
    );
  } catch (e) {
    next(e);
  }
}
export async function adminPayments(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    return ok(res, await paymentService.adminList(req.query.audit === "true"));
  } catch (e) {
    next(e);
  }
}
export async function adminReviewPayment(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = z
      .object({
        status: z.enum(["PENDING", "PAID", "UNSUCCESSFUL"]),
        reason: z.string().trim().max(500).optional(),
      })
      .parse(req.body);
    return ok(
      res,
      await paymentService.review(
        req.params.id,
        body.status,
        auth(req).userId,
        body.reason,
      ),
      "Payment review saved",
    );
  } catch (e) {
    next(e);
  }
}
export async function adminPaymentNotifications(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    return ok(res, await paymentService.notifications());
  } catch (e) {
    next(e);
  }
}
export async function readAdminPaymentNotification(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    return ok(res, await paymentService.markNotificationRead(req.params.id));
  } catch (e) {
    next(e);
  }
}
