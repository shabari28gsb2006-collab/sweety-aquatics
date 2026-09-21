import { Router } from 'express';
import { getServiceability } from '../controllers/serviceability.controller.js';

export const serviceabilityRouter = Router();
serviceabilityRouter.get('/:pincode', getServiceability);
