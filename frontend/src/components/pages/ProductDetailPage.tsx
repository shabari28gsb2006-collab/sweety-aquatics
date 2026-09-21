import { buildWhatsAppUrl } from '../../config/siteConfig';
import React, { useState, useEffect } from 'react';
import { Product, Review } from '../../types';
import { cartService } from '../../services/cartService';
import { wishlistService } from '../../services/wishlistService';
import { reviewService } from '../../services/reviewService';
import { productService } from '../../services/productService';
import { toastService } from '../../services/toastService';
import { authService } from '../../services/authService';
import { customerFeatureService } from '../../services/customerFeatureService';
import { ProductGallery } from '../product/ProductGallery';
import { StickyPurchaseBar } from '../product/StickyPurchaseBar';
import { PincodeChecker } from '../common/PincodeChecker';
import { ProductCard } from '../product/ProductCard';
import { OfferCountdown } from '../product/OfferCountdown';
import {
  Star,
  Heart,
  ShoppingBag,
  Zap,
  MessageCircle,
  Truck,
  ShieldCheck,
  Plus,
  Minus,
  Check,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Thermometer,
  Droplets,
  Award,
  Package,
  Bell,
  Share2,
} from 'lucide-react';

interface ProductDetailPageProps {
  product: Product;
  onOpenProduct: (product: Product) => void;
  onNavigate: (route: string) => void;
  onRequireAuth: (message: string) => void;
  wishlistIds?: string[];
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onOpenProduct,
  onNavigate,
  onRequireAuth,
  wishlistIds,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'care' | 'reviews'>('description');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isWishlisted, setIsWishlisted] = useState(() => wishlistService.isWishlisted(product.id));
  const [currentWishlistIds, setCurrentWishlistIds] = useState<string[]>(
    () => wishlistIds || wishlistService.getWishlistIds()
  );
  const [availabilitySubscribed, setAvailabilitySubscribed] = useState(false);

  // Review Form state

  useEffect(() => {
    setReviews(reviewService.getReviewsForProduct(product.id));
    void reviewService.refreshProduct(product.id).then(() => setReviews(reviewService.getReviewsForProduct(product.id))).catch(() => undefined);
    setIsWishlisted(wishlistService.isWishlisted(product.id));
    void customerFeatureService.addRecentlyViewed(product);
    const user = authService.getUser();
    setAvailabilitySubscribed(Boolean(user && customerFeatureService.isSubscribed(product.id)));
    if (user) void customerFeatureService.loadAvailabilityAlerts().then(() => setAvailabilitySubscribed(customerFeatureService.isSubscribed(product.id))).catch(() => undefined);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product]);

  useEffect(() => {
    const unsub = reviewService.subscribe(() => setReviews(reviewService.getReviewsForProduct(product.id)));
    return unsub;
  }, [product.id]);

  useEffect(() => {
    if (wishlistIds) {
      setCurrentWishlistIds(wishlistIds);
    }
    const unsub = wishlistService.subscribe((ids) => {
      setCurrentWishlistIds(ids);
      setIsWishlisted(ids.includes(product.id));
    });
    return unsub;
  }, [wishlistIds, product.id]);

  const handleAddToCart = async () => {
    const res = await cartService.addItem(product, quantity);
    if (res.requiresAuth) {
      onRequireAuth(res.message || 'Please sign in to add items to your cart.');
    } else if (res.success) {
      toastService.success('Added to Cart', res.message);
    } else {
      toastService.warning('Notice', res.message);
    }
  };

  const handleBuyNow = async () => {
    const res = await cartService.addItem(product, quantity);
    if (res.requiresAuth) {
      onRequireAuth('Please sign in to proceed with direct checkout.');
    } else if (res.success) {
      onNavigate('/checkout');
    }
  };

  const handleToggleWishlist = async () => {
    const res = await wishlistService.toggle(product);
    if (res.requiresAuth) {
      onRequireAuth('Please sign in to save items to your wishlist.');
    } else {
      setIsWishlisted(wishlistService.isWishlisted(product.id));
      toastService.info(res.message || 'Wishlist updated');
    }
  };

  const handleWhatsAppEnquiry = () => {
    const text = encodeURIComponent(
      `Hello Sweety Birds & Fishes, I have an enquiry regarding ${product.name} (Code: ${product.sku}, Price: ₹${product.price}).`
    );
    window.open(buildWhatsAppUrl(decodeURIComponent(text)), '_blank', 'noopener,noreferrer');
  };


  const handleNotifyMe = async () => {
    const user = authService.getUser();
    if (!user) {
      onRequireAuth('Please sign in so we can save an availability alert for this product.');
      return;
    }
    try { await customerFeatureService.subscribeAvailability(product); setAvailabilitySubscribed(true); toastService.success('Availability Alert Saved', `We will notify ${user.email} when this item becomes available.`); }
    catch (error) { toastService.error('Alert not saved', error instanceof Error ? error.message : 'Please try again.'); }
  };

  const handleShareProduct = async () => {
    const shareData = { title: product.name, text: `Check out ${product.name} at Sweety Birds & Fishes`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(window.location.href);
        toastService.success('Product Link Copied', 'You can now share the product link.');
      }
    } catch {
      // User cancelled sharing.
    }
  };


  const relatedProducts = productService
    .getByCategory(product.category)
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div id="product-detail-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-10 pb-32 md:pb-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-400 mb-4 sm:mb-6 overflow-x-auto no-scrollbar whitespace-nowrap">
        <button onClick={() => onNavigate('/')} className="hover:text-slate-700 shrink-0">Home</button>
        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        <button onClick={() => onNavigate('/shop')} className="hover:text-slate-700 shrink-0">Shop</button>
        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        <button
          onClick={() => onNavigate(`/${product.category}`)}
          className="hover:text-slate-700 capitalize shrink-0"
        >
          {product.category.replace('-', ' ')}
        </button>
        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        <span className="text-slate-700 font-medium truncate max-w-[140px] sm:max-w-xs">
          {product.name}
        </span>
      </nav>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-start mb-12 sm:mb-16">
        {/* Left Column: Media Gallery */}
        <div>
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        {/* Right Column: Information & Actions */}
        <div className="space-y-5 sm:space-y-6">
          <div>
            {/* Status & Category Badge */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0875B5]">
                {product.category.replace('-', ' ')}
              </span>
              {product.status === 'COMING_SOON' ? (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  Coming Soon
                </span>
              ) : product.status === 'OUT_OF_STOCK' || product.stock <= 0 ? (
                <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  Out of Stock
                </span>
              ) : product.stock <= 8 ? (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                  Low Stock
                </span>
              ) : (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                  In Stock
                </span>
              )}
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#032B42] font-['Manrope',sans-serif] leading-tight">
              {product.name}
            </h1>

            {/* Rating Bar */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.reviewCount > 0 ? product.rating : product.sellerRating || 0)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-700">{product.reviewCount > 0 ? product.rating : product.sellerRating ?? 'New'}</span>
              <span className="text-xs text-slate-400">{product.reviewCount > 0 ? `(${product.reviewCount} verified reviews)` : product.sellerRating != null ? `(${product.sellerRatingCount || 0} ratings)` : '(No reviews yet)'}</span>
            </div>
          </div>

          {/* Pricing Row */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F8FDFF] border border-sky-100 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2.5 sm:gap-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#032B42] font-mono">₹{product.price}</span>
              {product.mrp && product.mrp > product.price && (
                <>
                  <span className="text-xs sm:text-sm text-slate-400 line-through font-mono">₹{product.mrp}</span>
                  <span className="text-[11px] sm:text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Save ₹{product.mrp - product.price}
                  </span>
                </>
              )}
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-400">Tax Included</span>
          </div>
          <OfferCountdown offerPrice={product.offerPrice} offerEndsAt={product.offerEndsAt} />

          {/* Short Description */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {product.shortDescription}
          </p>

          {/* SPECIFIC ATTRIBUTES TABLE */}
          {/* A: Guppies */}
          {product.category === 'guppies' && product.guppyDetails && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-sky-100 space-y-2.5">
              <h4 className="text-xs font-bold text-[#032B42] uppercase tracking-wider">
                Specimen Biological Specifications
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-sky-50/70">
                  <span className="text-[10px] text-slate-400 block font-medium">Strain / Line</span>
                  <span className="font-bold text-[#032B42] text-xs truncate block">{product.guppyDetails.variety}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-sky-50/70">
                  <span className="text-[10px] text-slate-400 block font-medium">Gender</span>
                  <span className="font-bold text-[#032B42] text-xs">{product.guppyDetails.gender}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-sky-50/70">
                  <span className="text-[10px] text-slate-400 block font-medium">Water Temp</span>
                  <span className="font-bold text-[#032B42] text-xs">{product.guppyDetails.suggestedTemperature}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-sky-50/70">
                  <span className="text-[10px] text-slate-400 block font-medium">Water pH</span>
                  <span className="font-bold text-[#032B42] text-xs">{product.guppyDetails.suggestedPh}</span>
                </div>
              </div>
            </div>
          )}

          {/* B: Fish Food */}
          {product.category === 'fish-food' && product.fishFoodDetails && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-sky-100 space-y-2.5">
              <h4 className="text-xs font-bold text-[#032B42] uppercase tracking-wider">
                Nutritional Profile &amp; Sizing
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-sky-50/70">
                  <span className="text-[10px] text-slate-400 block font-medium">Formulation</span>
                  <span className="font-bold text-[#032B42]">{product.fishFoodDetails.feedType}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-sky-50/70">
                  <span className="text-[10px] text-slate-400 block font-medium">Net Weight</span>
                  <span className="font-bold text-[#032B42]">{product.fishFoodDetails.netWeight}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-sky-50/70">
                  <span className="text-[10px] text-slate-400 block font-medium">Crude Protein</span>
                  <span className="font-bold text-emerald-700">{product.fishFoodDetails.proteinContent}</span>
                </div>
              </div>
            </div>
          )}

          {/* C: Combo Pack */}
          {product.category === 'combo-packs' && product.comboDetails && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-sky-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#032B42] uppercase tracking-wider">
                  Combo Pack Contents
                </h4>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Save ₹{product.comboDetails.savingsAmount}
                </span>
              </div>
              <div className="space-y-2">
                {product.comboDetails.includedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2 rounded-xl bg-sky-50/60 text-xs text-slate-700"
                  >
                    <img
                      src={item.thumbnail}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover bg-white"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#032B42] truncate">{item.name}</p>
                      <p className="text-[11px] text-slate-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mobile Quantity & Wishlist Strip */}
          {product.status !== 'OUT_OF_STOCK' && product.stock > 0 && product.status !== 'COMING_SOON' && (
            <div className="md:hidden flex items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-sky-100">
              <span className="text-xs font-bold text-[#032B42]">Select Quantity</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-sky-200 rounded-xl bg-[#F8FDFF] p-0.5">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg hover:bg-sky-100 text-slate-600 flex items-center justify-center min-h-[36px] min-w-[36px]"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center font-bold font-mono text-xs text-[#032B42]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="w-8 h-8 rounded-lg hover:bg-sky-100 text-slate-600 flex items-center justify-center min-h-[36px] min-w-[36px]"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  onClick={handleToggleWishlist}
                  className="w-9 h-9 rounded-xl border border-sky-200 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"
                  aria-label="Wishlist"
                >
                  <Heart
                    className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Pincode Serviceability Checker Component */}
          <div className="pt-1">
            <PincodeChecker />
          </div>

          {(product.status === 'COMING_SOON' || product.status === 'OUT_OF_STOCK' || product.stock <= 0) && (
            <button onClick={handleNotifyMe} disabled={availabilitySubscribed} className="md:hidden premium-action-btn w-full py-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-extrabold flex items-center justify-center gap-2">
              <Bell className="w-4 h-4" /> {availabilitySubscribed ? 'Availability Alert Saved' : 'Notify Me When Available'}
            </button>
          )}

          {/* Quantity and Purchase Action Block (Desktop) */}
          <div className="hidden md:flex flex-col gap-3 pt-4 border-t border-sky-100">
            {product.status === 'COMING_SOON' ? (
              <div className="flex gap-3">
                <button
                  onClick={handleWhatsAppEnquiry}
                  className="premium-action-btn flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  Enquire on WhatsApp
                </button>
                <button
                  onClick={handleNotifyMe}
                  disabled={availabilitySubscribed}
                  className="premium-action-btn flex-1 bg-amber-50 hover:bg-amber-100 disabled:opacity-70 text-amber-800 border border-amber-200 text-xs font-bold py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  {availabilitySubscribed ? 'Alert Saved' : 'Notify Me'}
                </button>
              </div>
            ) : product.status === 'OUT_OF_STOCK' || product.stock <= 0 ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-600"><strong className="text-[#032B42]">Currently out of stock.</strong><br/>Save an alert for the next seller-published batch.</div>
                <button onClick={handleNotifyMe} disabled={availabilitySubscribed} className="premium-action-btn px-4 py-2.5 rounded-xl bg-[#0875B5] disabled:bg-slate-300 text-white text-xs font-bold flex items-center gap-2"><Bell className="w-4 h-4" />{availabilitySubscribed ? 'Alert Saved' : 'Notify Me'}</button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {/* Quantity Controls */}
                <div className="flex items-center border border-sky-200 rounded-2xl bg-[#F8FDFF] p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-xl hover:bg-sky-100 text-slate-600 flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-bold font-mono text-sm text-[#032B42]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="w-9 h-9 rounded-xl hover:bg-sky-100 text-slate-600 flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  id="btn-detail-add-cart"
                  onClick={handleAddToCart}
                  className="flex-1 bg-sky-50 hover:bg-sky-100 text-[#0875B5] border border-sky-200 text-xs font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
                </button>

                {/* Buy Now */}
                <button
                  id="btn-detail-buy-now"
                  onClick={handleBuyNow}
                  className="flex-1 bg-[#0875B5] hover:bg-[#064463] text-white text-xs font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <Zap className="w-4 h-4 fill-current text-[#50D4EE]" />
                  Buy Now
                </button>

                {/* Wishlist Icon */}
                <button
                  onClick={handleToggleWishlist}
                  className="w-12 h-12 rounded-2xl border border-sky-200 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-colors"
                  aria-label="Wishlist"
                >
                  <Heart
                    className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`}
                  />
                </button>
                <button
                  onClick={handleShareProduct}
                  className="w-12 h-12 rounded-2xl border border-sky-200 flex items-center justify-center text-slate-400 hover:text-[#0875B5] hover:border-sky-300 transition-colors"
                  aria-label="Share product"
                  title="Share product"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Direct WhatsApp Contact Button */}
            <button
              onClick={handleWhatsAppEnquiry}
              className="text-xs text-slate-500 hover:text-[#0875B5] flex items-center justify-center gap-1.5 py-1"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
              <span>Questions about this strain? Chat directly with us on WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Section: Description / Care Instructions / Customer Reviews */}
      <div className="border-t border-sky-100 pt-6 sm:pt-8 mb-12 sm:mb-16">
        <div className="flex items-center border-b border-sky-100 gap-5 sm:gap-8 mb-6 overflow-x-auto no-scrollbar whitespace-nowrap -mx-4 px-4 sm:mx-0 sm:px-0">
          {[
            { id: 'description', label: 'Description' },
            { id: 'care', label: 'Care & Acclimatization' },
            { id: 'reviews', label: `Reviews (${reviews.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-xs font-bold tracking-wide uppercase transition-all shrink-0 relative ${
                activeTab === tab.id
                  ? 'text-[#0875B5] border-b-2 border-[#0875B5]'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Description Tab Content */}
        {activeTab === 'description' && (
          <div className="prose prose-sky max-w-none text-xs sm:text-sm text-slate-600 space-y-4">
            <p className="leading-relaxed">{product.description}</p>
            {product.category === 'guppies' && (
              <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 mt-4 space-y-2">
                <h5 className="font-bold text-[#032B42] text-xs">Genetics &amp; Breeding Notes:</h5>
                <p className="text-xs text-slate-600">
                  Our guppy lines are kept in individual planted tanks with consistent feeding cycles of artemia and micro-pellets. We select for balanced fin ratios and strong immune resistance before cataloging.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Care & Acclimatization Tab Content */}
        {activeTab === 'care' && (
          <div className="space-y-4 max-w-3xl text-xs sm:text-sm text-slate-600">
            <h4 className="font-bold text-[#032B42] text-sm">Step-by-Step Acclimatization Guide</h4>
            <ol className="list-decimal pl-5 space-y-2 text-xs">
              <li>
                <strong>Temperature Equalization:</strong> Float the sealed courier bag in your aquarium for 20 minutes without opening to balance water temperatures.
              </li>
              <li>
                <strong>Water Mixing:</strong> Open the bag and slowly introduce 1 cup of your tank water into the bag every 5 minutes for 20 minutes.
              </li>
              <li>
                <strong>Net Release:</strong> Net the fish gently out of the bag into your aquarium. Avoid pouring the transport water into your tank.
              </li>
              <li>
                <strong>First 24 Hours:</strong> Keep aquarium lights dimmed or off during the first 12 hours to help the fish settle peacefully without stress.
              </li>
            </ol>
            {product.category === 'guppies' && product.guppyDetails && (
              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                  <p className="text-[10px] uppercase font-extrabold text-emerald-700">Care Difficulty</p>
                  <p className="font-bold text-[#032B42] mt-1">{product.guppyDetails.breedingDifficulty || 'Beginner'}</p>
                  <p className="text-xs text-slate-600 mt-1">General guidance only. Observe fish behavior and water stability after arrival.</p>
                </div>
                <div className="rounded-2xl bg-sky-50 border border-sky-100 p-4">
                  <p className="text-[10px] uppercase font-extrabold text-[#0875B5]">First 24 Hours</p>
                  <p className="text-xs text-slate-600 mt-1">Keep lighting gentle, avoid sudden water changes, feed lightly after the fish settles, and watch for normal swimming before resuming the regular routine.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab Content */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-base text-[#032B42]">Customer Reviews</h4>
                <p className="text-xs text-slate-500">Customers can submit a review from My Orders only after the order is marked received. The seller approves it before it appears here.</p>
              </div>
              <button
                onClick={() => onNavigate('/account?tab=orders')}
                className="bg-sky-50 hover:bg-sky-100 text-[#0875B5] text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
              >
                Review a Verified Purchase
              </button>
            </div>

            {/* Existing Reviews List */}
            <div className="space-y-3">
              {reviews.length === 0 ? (
                <p className="text-xs text-slate-400 py-6">
                  No approved reviews for this product yet.
                </p>
              ) : (
                reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-white border border-sky-100 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex text-amber-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400">{rev.createdAt}</span>
                    </div>
                    <h5 className="text-xs font-bold text-[#032B42]">{rev.title}</h5>
                    <p className="text-xs text-slate-600">{rev.comment}</p>
                    {(rev.productQuality || rev.packingRating || rev.deliveryRating) && (
                      <div className="flex flex-wrap gap-2 text-[10px] font-bold text-slate-500">
                        {rev.productQuality && <span className="px-2 py-1 rounded-lg bg-emerald-50">Product {rev.productQuality}/5</span>}
                        {rev.packingRating && <span className="px-2 py-1 rounded-lg bg-sky-50">Packing {rev.packingRating}/5</span>}
                        {rev.deliveryRating && <span className="px-2 py-1 rounded-lg bg-violet-50">Delivery {rev.deliveryRating}/5</span>}
                      </div>
                    )}
                    {rev.sellerReply && <div className="rounded-xl bg-[#F5FCFF] border border-sky-100 p-3 text-xs text-slate-600"><strong className="text-[#0875B5]">Sweety Birds &amp; Fishes:</strong> {rev.sellerReply}</div>}
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-600">{rev.customerName}</span>
                      <span>•</span>
                      <span>{rev.customerCity}, Tamil Nadu</span>
                      {rev.isVerifiedPurchase && (
                        <span className="text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                          Verified Purchase ✓
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-sky-100 pt-8 sm:pt-10">
          <h3 className="text-base sm:text-lg font-bold text-[#032B42] mb-4 sm:mb-6">You May Also Like</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard
                key={rel.id}
                product={rel}
                onOpenProduct={onOpenProduct}
                onRequireAuth={onRequireAuth}
                isWishlisted={(currentWishlistIds || []).includes(rel.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Mobile Sticky Purchase Bar */}
      <StickyPurchaseBar
        product={product}
        quantity={quantity}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onWhatsAppEnquiry={handleWhatsAppEnquiry}
      />
    </div>
  );
};
