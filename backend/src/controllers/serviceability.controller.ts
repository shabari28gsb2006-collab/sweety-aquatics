import type { Request, Response } from 'express';
import { z } from 'zod';
import { checkPincode } from '../services/serviceability.service.js';
import { ok } from '../utils/apiResponse.js';

const schema = z.object({ pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit PIN code') });

export async function getServiceability(req: Request, res: Response) {
  const { pincode } = schema.parse({ pincode: req.params.pincode });
  const result = await checkPincode(pincode);
  return ok(res, result, result.serviceable ? 'Delivery is available' : 'Delivery is unavailable');
}
