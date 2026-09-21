import { buildWhatsAppUrl } from '../../config/siteConfig';
import React from 'react';
import { Product } from '../../types';
import { cartService } from '../../services/cartService';
import { wishlistService } from '../../services/wishlistService';
import { toastService } from '../../services/toastService';
import { authService } from '../../services/authService';
import { customerFeatureService } from '../../services/customerFeatureService';
import { Star, Heart, ShoppingBag, MessageCircle, AlertCircle, Bell } from 'lucide-react';
import { OfferCountdown } from './OfferCountdown';

interface ProductCardProps {
  product: Product;
  onOpenProduct: (product: Product) => void;
  onRequireAuth: (message: string) => void;
  isWishlisted?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenProduct,
  onRequireAuth,
  isWishlisted = false,
}) => {
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = await cartService.addItem(product, 1);
    if (result.requiresAuth) {
      onRequireAuth(result.message || 'Sign in or create an account to continue shopping.');
    } else if (result.success) {
      toastService.success('Added to Cart', result.message);
    } else {
      toastService.warning('Notice', result.message);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = await wishlistService.toggle(product);
    if (result.requiresAuth) {
      onRequireAuth(result.message || 'Please sign in to save items to your wishlist.');
    } else if (result.success) {
      toastService.info(result.message || 'Wishlist updated');
    }
  };

  const handleWhatsAppEnquiry = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = encodeURIComponent(
      `Hello Sweety Birds & Fishes, I would like to know more about ${product.name} (Price: ₹${product.price}).`
    );
    window.open(buildWhatsAppUrl(decodeURIComponent(text)), '_blank', 'noopener,noreferrer');
  };

  const handleAvailabilityAlert = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const user = authService.getUser();
    if (!user) {
      onRequireAuth('Please sign in to save an availability alert for this product.');
      return;
    }
    try { await customerFeatureService.subscribeAvailability(product); toastService.success('Alert Saved', `Availability alert saved for ${product.name}.`); }
    catch (error) { toastService.error('Alert not saved', error instanceof Error ? error.message : 'Please try again.'); }
  };

  const getStatusBadge = () => {
    switch (product.status) {
      case 'COMING_SOON':
        return (
          <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
            Coming Soon
          </span>
        );
      case 'OUT_OF_STOCK':
        return (
          <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
            Out of Stock
          </span>
        );
      case 'ACTIVE':
        if (product.stock > 0 && product.stock <= 8) {
          return (
            <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded-full">
              Low Stock
            </span>
          );
        }
        return (
          <span className="bg-emerald-100/90 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
            In Stock
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onOpenProduct(product)}
      className="group relative bg-white rounded-[1.35rem] sm:rounded-2xl border border-sky-100 shadow-[0_8px_28px_rgba(3,43,66,0.07)] sm:shadow-xs hover:shadow-xl hover:border-[#50D4EE]/40 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col active:scale-[0.985]"
    >
      {/* Product Image Area */}
      <div className="relative w-full aspect-square bg-[#F5FCFF] overflow-hidden">
        <img
          src={product.thumbnail}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
          {getStatusBadge()}
          {product.category === 'combo-packs' && product.comboDetails?.badgeText && (
            <span className="bg-[#0875B5] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              {product.comboDetails.badgeText}
            </span>
          )}
        </div>

        {/* Wishlist Button - 44px minimum tap target */}
        <div className="absolute top-1.5 right-1.5 z-10">
          <button
            id={`btn-wishlist-${product.id}`}
            onClick={handleToggleWishlist}
            className="w-10 h-10 rounded-full bg-white/95 hover:bg-white text-slate-400 hover:text-rose-500 shadow-sm flex items-center justify-center transition-transform active:scale-90"
            aria-label="Toggle wishlist"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isWishlisted ? 'fill-rose-500 text-rose-500' : 'stroke-current'
              }`}
            />
          </button>
        </div>

        {/* Guppy Variety Tag Pill */}
        {product.guppyDetails && (
          <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-xs text-white px-2 py-1 rounded-lg text-[10px] truncate flex justify-between items-center">
            <span className="truncate">{product.guppyDetails.gender}</span>
            <span className="text-[#50D4EE] font-mono shrink-0 ml-1">{product.guppyDetails.size}</span>
          </div>
        )}
      </div>

      {/* Card Content Area */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between bg-gradient-to-b from-white to-[#FBFEFF]">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#0875B5] truncate">
              {product.category === 'guppies'
                ? 'Guppy'
                : product.category === 'fish-food'
                ? 'Feed'
                : product.category === 'combo-packs'
                ? 'Combo'
                : 'Wholesale'}
            </span>
            <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] text-amber-600 font-extrabold shrink-0" aria-label="Product rating">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.reviewCount > 0 ? product.rating : product.sellerRating ?? 'New'}</span>
              {product.reviewCount > 0 && <span className="text-slate-400 text-[10px]">({product.reviewCount})</span>}
              {product.reviewCount === 0 && product.sellerRating != null && <span className="text-slate-500 text-[9px]">({product.sellerRatingCount || 0})</span>}
            </div>
          </div>

          {/* Product Title */}
          <h3 className="text-sm sm:text-base font-extrabold text-[#032B42] line-clamp-2 min-h-[2.5rem] group-hover:text-[#0875B5] transition-colors leading-tight">
            {product.name}
          </h3>

          <p className="text-[10px] sm:text-xs text-slate-500 line-clamp-2 min-h-[2rem] mt-1 leading-relaxed">
            {product.shortDescription}
          </p>
          <div className="mt-2"><OfferCountdown offerPrice={product.offerPrice} offerEndsAt={product.offerEndsAt} compact /></div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2.5 mt-2 border-t border-sky-50 flex items-center justify-between gap-1.5">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1 flex-wrap">
              <span className="text-sm sm:text-base font-extrabold text-[#032B42]">
                ₹{product.price}
              </span>
              {product.offerPrice != null && product.offerEndsAt && new Date(product.offerEndsAt).getTime() > Date.now() && product.regularPrice && (
                <span className="text-[10px] text-slate-400 line-through">₹{product.regularPrice}</span>
              )}
              {product.mrp && product.mrp > product.price && (
                <span className="text-[10px] sm:text-[11px] text-slate-400 line-through">
                  ₹{product.mrp}
                </span>
              )}
            </div>
          </div>

          {/* Button based on status */}
          {product.status === 'COMING_SOON' ? (
            <button
              onClick={handleAvailabilityAlert}
              className="premium-action-btn text-[10px] sm:text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-1.5 sm:px-2.5 sm:py-2 rounded-xl transition-colors flex items-center gap-1 shrink-0 min-h-[36px] sm:min-h-[38px]"
            >
              <Bell className="w-3 h-3" />
              <span>Notify</span>
            </button>
          ) : product.status === 'OUT_OF_STOCK' || product.stock <= 0 ? (
            <button
              onClick={handleAvailabilityAlert}
              className="premium-action-btn text-[10px] sm:text-[11px] font-semibold text-[#0875B5] bg-sky-50 hover:bg-sky-100 px-2 py-1.5 sm:px-2.5 sm:py-2 rounded-xl flex items-center gap-1 shrink-0 min-h-[36px] sm:min-h-[38px]"
            >
              <Bell className="w-3 h-3" /> Notify
            </button>
          ) : (
            <button
              id={`btn-add-cart-${product.id}`}
              onClick={handleAddToCart}
              className="bg-gradient-to-r from-[#0875B5] to-[#0698C7] hover:from-[#064463] hover:to-[#0875B5] text-white text-[11px] sm:text-xs font-extrabold px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl transition-all shadow-md shadow-sky-900/10 flex items-center gap-1 sm:gap-1.5 active:scale-95 shrink-0 min-h-[40px] sm:min-h-[42px]"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
