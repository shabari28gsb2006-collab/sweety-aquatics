import { Router } from 'express';
import { getProductBySlug, getProducts } from '../controllers/product.controller.js';

export const productRouter = Router();
productRouter.get('/', getProducts);
productRouter.get('/:slug', getProductBySlug);
