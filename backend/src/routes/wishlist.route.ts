import { Router } from 'express';
import { requireAuth, requireCustomer } from '../middleware/auth.middleware.js';
import { requireTrustedOrigin } from '../middleware/origin.middleware.js';
import { getWishlistController,addWishlistController,removeWishlistController } from '../controllers/wishlist.controller.js';
export const wishlistRouter=Router();
wishlistRouter.use(requireAuth,requireCustomer);
wishlistRouter.get('/',getWishlistController);
wishlistRouter.post('/:productId',requireTrustedOrigin,addWishlistController);
wishlistRouter.delete('/:productId',requireTrustedOrigin,removeWishlistController);
