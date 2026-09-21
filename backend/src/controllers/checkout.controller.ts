import type { Request,Response,NextFunction } from 'express';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { paymentService } from '../services/payment.service.js';
import { ok } from '../utils/apiResponse.js';
const address=z.object({fullName:z.string().min(2),mobile:z.string().min(10),line1:z.string().min(3),line2:z.string().optional().nullable(),area:z.string().optional().nullable(),city:z.string().min(2),district:z.string().min(2),state:z.literal('Tamil Nadu'),pincode:z.string().regex(/^\d{6}$/)});
const schema=z.object({addressId:z.string().optional(),address:address.optional()}).refine(v=>Boolean(v.addressId||v.address),{message:'Delivery address is required'});
export async function checkoutReadinessController(req:Request,res:Response,next:NextFunction){try{const body=schema.parse(req.body);const data=await paymentService.previewCheckout({userId:(req as AuthenticatedRequest).auth.userId,addressId:body.addressId,address:body.address});return ok(res,data,'Checkout is ready');}catch(e){next(e);}}
