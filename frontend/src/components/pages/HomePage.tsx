import { buildWhatsAppUrl } from '../../config/siteConfig';
import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { LivingAquariumHero } from '../aquarium/LivingAquariumHero';
import { ProductCard } from '../product/ProductCard';
import { productService } from '../../services/productService';
import { articleService } from '../../services/articleService';
import { reviewService } from '../../services/reviewService';
import { wishlistService } from '../../services/wishlistService';
import { customerFeatureService } from '../../services/customerFeatureService';
import {
  Sparkles,
  ArrowRight,
  Fish,
  ShoppingBag,
  Award,
  Package,
  ShieldCheck,
  Truck,
  MessageCircle,
  Star,
  BookOpen,
  Sun,
  Snowflake,
  Heart,
  ChevronRight,
  BadgeCheck,
} from 'lucide-react';
import { AquaticVisual } from '../common/AquaticVisual';
import { siteSettingsService } from '../../services/siteSettingsService';

interface HomePageProps {
  onNavigate: (route: string) => void;
  onOpenProduct: (product: Product) => void;
  onOpenQuiz: () => void;
  onRequireAuth: (message: string) => void;
  wishlistIds?: string[];
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenProduct,
  onOpenQuiz,
  onRequireAuth,
  wishlistIds: initialWishlistIds,
}) => {
  const [reviewVersion, setReviewVersion] = useState(0);
  const [wishlistIds, setWishlistIds] = useState<string[]>(
    () => initialWishlistIds || wishlistService.getWishlistIds()
  );
  const [siteSettings, setSiteSettings] = useState(() => siteSettingsService.getSettings());

  useEffect(() => siteSettingsService.subscribe(setSiteSettings), []);

  useEffect(() => {
    const unsubReviews = reviewService.subscribe(() => setReviewVersion((v) => v + 1));
    void reviewService.refreshApproved(12).catch(() => undefined);
    return unsubReviews;
  }, []);

  useEffect(() => {
    if (initialWishlistIds) {
      setWishlistIds(initialWishlistIds);
    }
    const unsub = wishlistService.subscribe((ids) => {
      setWishlistIds(ids);
    });
    return unsub;
  }, [initialWishlistIds]);
  const featuredGuppies = productService.getFeaturedGuppies().slice(0, 6);
  const comboPacks = productService.getComboPacks();
  const careArticles = articleService.getAllArticles().slice(0, 3);
  const customerReviews = reviewService.getApprovedReviews().slice(0, 3);
  void reviewVersion;
  const recentlyViewed = customerFeatureService.getRecentlyViewedIds()
    .map((id) => productService.getById(id))
    .filter((product): product is Product => Boolean(product))
    .slice(0, 4);

  const handleWhatsAppEnquiry = (msg?: string) => {
    const text = encodeURIComponent(
      msg || 'Hello Sweety Birds & Fishes, I have an enquiry about your guppies and feeds.'
    );
    window.open(buildWhatsAppUrl(decodeURIComponent(text)), '_blank', 'noopener,noreferrer');
  };

  return (
    <div id="home-page-container" className="space-y-12 sm:space-y-20 pb-24 md:pb-16">
      {/* 1. LIVING AQUARIUM HERO & TRUST STRIP */}
      <LivingAquariumHero
        onExploreGuppies={() => onNavigate('/guppies')}
        onShopFishFood={() => onNavigate('/fish-food')}
      />

      {/* 2. SHOP BY CATEGORY */}
      <section id="section-categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-5 sm:mb-8">
          <div>
            <span className="text-[11px] sm:text-xs font-bold text-[#0875B5] uppercase tracking-wider">
              Curated Catalog
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold text-[#032B42] font-['Manrope',sans-serif] mt-0.5 sm:mt-1">
              Shop by Category
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/shop')}
            className="text-xs font-bold text-[#0875B5] hover:text-[#064463] flex items-center gap-1 group py-1 min-h-[44px]"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {/* Guppies Category Card */}
          <div
            onClick={() => onNavigate('/guppies')}
            className="group relative h-48 sm:h-64 rounded-3xl overflow-hidden border border-sky-100 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer active:scale-[0.99]"
          >
            <img
              src={siteSettings.guppiesCategoryImage || '/images/guppy-aquarium-premium.png'}
              alt="Guppies"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#021E31]/95 via-[#021E31]/40 to-transparent" />
            <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 text-white flex items-end justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#50D4EE] bg-[#021E31]/70 px-2 py-0.5 rounded-md">
                  Seller-listed
                </span>
                <h3 className="text-lg sm:text-xl font-bold font-['Manrope',sans-serif] mt-1">Guppies</h3>
                <p className="text-xs text-[#E8F9FC]/90 line-clamp-1">Discover vibrant, hand-selected aquarium favourites</p>
              </div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 group-hover:bg-[#50D4EE] group-hover:text-[#021E31] text-white flex items-center justify-center transition-colors shrink-0">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Fish Food Category Card */}
          <div
            onClick={() => onNavigate('/fish-food')}
            className="group relative h-48 sm:h-64 rounded-3xl overflow-hidden border border-sky-100 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer active:scale-[0.99]"
          >
            <img
              src={siteSettings.fishFoodCategoryImage || '/images/fish-food-aquarium-premium.png'}
              alt="Fish Food"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#021E31]/95 via-[#021E31]/40 to-transparent" />
            <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 text-white flex items-end justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#50D4EE] bg-[#021E31]/70 px-2 py-0.5 rounded-md">
                  Daily Feeding
                </span>
                <h3 className="text-lg sm:text-xl font-bold font-['Manrope',sans-serif] mt-1">Fish Food</h3>
                <p className="text-xs text-[#E8F9FC]/90 line-clamp-1">Everyday nutrition for colourful, thriving fish</p>
              </div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 group-hover:bg-[#50D4EE] group-hover:text-[#021E31] text-white flex items-center justify-center transition-colors shrink-0">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Combo Packs Category Card */}
          <div
            onClick={() => onNavigate('/combo-packs')}
            className="group relative h-48 sm:h-64 rounded-3xl overflow-hidden border border-sky-100 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer active:scale-[0.99]"
          >
            <img
              src={siteSettings.comboPacksCategoryImage || '/images/combo-aquarium-premium.png'}
              alt="Combo Packs"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#021E31]/95 via-[#021E31]/40 to-transparent" />
            <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 text-white flex items-end justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-[#021E31]/70 px-2 py-0.5 rounded-md">
                  Curated Packs
                </span>
                <h3 className="text-lg sm:text-xl font-bold font-['Manrope',sans-serif] mt-1">Combo Packs</h3>
                <p className="text-xs text-[#E8F9FC]/90 line-clamp-1">Convenient combinations with more value in every pack</p>
              </div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 group-hover:bg-[#50D4EE] group-hover:text-[#021E31] text-white flex items-center justify-center transition-colors shrink-0">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {siteSettings.customCategories?.filter(category => category.published).map(category => {
            const route = category.targetCategory === 'guppies' ? '/guppies' : category.targetCategory === 'fish-food' ? '/fish-food' : category.targetCategory === 'combo-packs' ? '/combo-packs' : '/wholesale';
            return <div key={category.id} onClick={() => onNavigate(route)} role="button" tabIndex={0} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') onNavigate(route); }} className="group relative h-48 sm:h-64 rounded-3xl overflow-hidden border border-sky-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-cyan-500">
              <img src={category.image} alt={category.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#021E31]/95 via-[#021E31]/40 to-transparent" />
              <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 text-white flex items-end justify-between gap-3"><div className="min-w-0"><span className="text-[10px] font-bold uppercase tracking-wider text-[#50D4EE] bg-[#021E31]/70 px-2 py-0.5 rounded-md">Curated collection</span><h3 className="text-lg sm:text-xl font-bold font-['Manrope',sans-serif] mt-1">{category.name}</h3><p className="text-xs text-[#E8F9FC]/90 line-clamp-2">{category.description || 'Explore this curated collection'}</p></div><div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 group-hover:bg-[#50D4EE] group-hover:text-[#021E31] text-white flex items-center justify-center transition-colors shrink-0"><ArrowRight className="w-4 h-4"/></div></div>
            </div>;
          })}
        </div>
      </section>

      {/* 3. FEATURED GUPPIES (Section 11, Item 5) */}
      <section id="section-featured-guppies" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-[#0875B5] uppercase tracking-wider">
              Available Guppy Collection
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#032B42] font-['Manrope',sans-serif] mt-1">
              Featured Guppies
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/guppies')}
            className="text-xs font-bold text-[#0875B5] hover:text-[#064463] flex items-center gap-1 group"
          >
            <span>View All Guppies</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-5">
          {featuredGuppies.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenProduct={onOpenProduct}
              onRequireAuth={onRequireAuth}
              isWishlisted={(wishlistIds || []).includes(product.id)}
            />
          ))}
        </div>
      </section>

      {/* 4. PREMIUM FISH FOOD VISUAL BANNER (Section 11, Item 6 & Image Reference) */}
      <section id="section-food-banner" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-[#021E31] p-6 sm:p-12 text-white shadow-xl min-h-[360px] flex items-center border border-[#50D4EE]/20">
          <AquaticVisual variant="food" />
          <div className="relative z-10 max-w-xl space-y-3 sm:space-y-4">
            <span className="inline-block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#50D4EE] bg-white/10 px-3 py-1 rounded-full border border-white/15">
              Fish Food Collection
            </span>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold font-['Manrope',sans-serif] leading-tight">
              Fish Food for Everyday Aquarium Care
            </h2>
            <p className="text-xs sm:text-sm text-[#E8F9FC]/90 leading-relaxed font-normal">
              Browse the fish-food products currently published by the seller. Product ingredients, pack size and feeding directions should be checked on each individual listing before purchase.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                onClick={() => onNavigate('/fish-food')}
                className="premium-action-btn bg-[#50D4EE] hover:bg-[#38c9e5] text-[#021E31] font-bold text-xs px-5 sm:px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 min-h-[44px]"
              >
                Shop Fish Food
                <ArrowRight className="w-4 h-4" />
              </button>
              <span className="text-[11px] sm:text-xs text-sky-200">From ₹160 • Free Delivery over ₹999</span>
            </div>
          </div>

        </div>
      </section>

      {/* 5. COMBO PACKS (Section 11, Item 7) */}
      <section id="section-combos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-5 sm:mb-8">
          <div>
            <span className="text-[11px] sm:text-xs font-bold text-emerald-600 uppercase tracking-wider">
              All-In-One Value Kits
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold text-[#032B42] font-['Manrope',sans-serif] mt-0.5 sm:mt-1">
              Popular Combo Packs
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/combo-packs')}
            className="text-xs font-bold text-[#0875B5] hover:text-[#064463] flex items-center gap-1 group py-1 min-h-[44px]"
          >
            <span>All Combos</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {comboPacks.map((combo) => (
            <div
              key={combo.id}
              onClick={() => onOpenProduct(combo)}
              className="group bg-white rounded-3xl border border-sky-100 p-4 sm:p-5 shadow-xs hover:shadow-xl hover:border-[#50D4EE]/40 transition-all duration-300 cursor-pointer flex flex-col justify-between active:scale-[0.99]"
            >
              <div>
                <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-[#F5FCFF] mb-3.5 sm:mb-4">
                  <img
                    src={combo.thumbnail}
                    alt={combo.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {combo.comboDetails?.badgeText && (
                    <span className="absolute top-2.5 left-2.5 bg-[#0875B5] text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 sm:py-1 rounded-full shadow-md">
                      {combo.comboDetails.badgeText}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-[#032B42] group-hover:text-[#0875B5] transition-colors">
                  {combo.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{combo.shortDescription}</p>

                {/* Items preview */}
                {combo.comboDetails && (
                  <div className="mt-3.5 pt-3 border-t border-sky-50 space-y-1.5">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Bundle Contents:</p>
                    {combo.comboDetails.includedItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs text-slate-700">
                        <span className="truncate">• {item.name}</span>
                        <span className="text-slate-400 text-[11px] shrink-0 font-medium">({item.quantity})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-sky-100 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-extrabold text-[#032B42]">₹{combo.price}</span>
                    {combo.mrp && (
                      <span className="text-xs text-slate-400 line-through">₹{combo.mrp}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenProduct(combo);
                  }}
                  className="premium-action-btn bg-[#0875B5] hover:bg-[#064463] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs min-h-[40px] flex items-center"
                >
                  View Pack
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. LARGE AQUARIUM VISUAL STORYTELLING (Section 11, Item 8 & Image Reference) */}
      <section id="section-story-banner" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden min-h-[300px] sm:min-h-[360px] flex items-center p-6 sm:p-14 text-white shadow-2xl">
          <AquaticVisual variant="aquarium" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#021E31]/95 via-[#021E31]/80 to-transparent" />

          <div className="relative z-10 max-w-xl space-y-3 sm:space-y-4">
            <span className="text-[11px] sm:text-xs font-bold text-[#50D4EE] tracking-wider uppercase">
              Aquatic Lifestyle
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-['Manrope',sans-serif] leading-tight">
              A Small Fish Makes a Big Difference
            </h2>
            <p className="text-xs sm:text-sm text-[#E8F9FC]/90 leading-relaxed font-normal">
              Bring tranquility and natural rhythm to your living space with vibrant, peaceful guppies.
              Every specimen we dispatch is hand-inspected for fin symmetry, vitality, and health.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('/guppies')}
                className="premium-action-btn bg-[#50D4EE] hover:bg-[#38c9e5] text-[#021E31] font-bold text-xs px-5 sm:px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 min-h-[44px]"
              >
                Explore Collection
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenQuiz}
                className="premium-action-btn bg-white/15 hover:bg-white/25 text-white font-semibold text-xs px-4 sm:px-5 py-3 rounded-xl border border-white/20 backdrop-blur-md transition-all flex items-center gap-2 min-h-[44px]"
              >
                <Sparkles className="w-4 h-4 text-[#50D4EE]" />
                Find Your Guppy Quiz
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. WHY CHOOSE SWEETY BIRDS & FISHES (Section 11, Item 10) */}
      <section id="section-why-choose" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <span className="text-[11px] sm:text-xs font-bold text-[#0875B5] uppercase tracking-wider">
            Our Standards
          </span>
          <h2 className="text-xl sm:text-3xl font-extrabold text-[#032B42] font-['Manrope',sans-serif] mt-0.5 sm:mt-1">
            Why Enthusiasts Trust Sweety Birds &amp; Fishes
          </h2>
          <p className="text-xs text-slate-500 mt-1.5 sm:mt-2">
            Focused on clear product information, careful packing, and manageable delivery coverage within Tamil Nadu.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-sky-100 shadow-xs space-y-2.5 sm:space-y-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-sky-50 text-[#0875B5] flex items-center justify-center">
              <Fish className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#032B42]">Clear Product Availability</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Available, Out of Stock and Coming Soon states make it clear what can actually be ordered.
            </p>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-sky-100 shadow-xs space-y-2.5 sm:space-y-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-sky-50 text-[#0875B5] flex items-center justify-center">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#032B42]">Seller-Controlled Dispatch</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Packing time, dispatch and courier tracking are updated by the seller instead of using automatic fake statuses.
            </p>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-sky-100 shadow-xs space-y-2.5 sm:space-y-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-sky-50 text-[#0875B5] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#032B42]">Delivery Eligibility Check</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Checkout is limited to Tamil Nadu and requires an enabled serviceable PIN code before payment.
            </p>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-sky-100 shadow-xs space-y-2.5 sm:space-y-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-sky-50 text-[#0875B5] flex items-center justify-center">
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#25D366]" />
            </div>
            <h3 className="text-sm font-bold text-[#032B42]">Direct Business Contact</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Customers can contact the business directly through the published WhatsApp number for product and order questions.
            </p>
          </div>
        </div>
        <div className="text-center mt-7">
          <button onClick={() => onNavigate('/why-trust-us')} className="inline-flex items-center gap-2 text-sm font-extrabold text-[#0875B5] hover:text-[#064463]">See how our order &amp; review process works <ArrowRight className="w-4 h-4" /></button>
        </div>
      </section>

      {/* 8. CUSTOMER REVIEWS (Section 11, Item 11) */}
      <section id="section-reviews" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-5 sm:mb-8">
          <div>
            <span className="text-[11px] sm:text-xs font-bold text-amber-500 uppercase tracking-wider">
              Approved Customer Feedback
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold text-[#032B42] font-['Manrope',sans-serif] mt-0.5 sm:mt-1">
              Customer Reviews
            </h2>
          </div>
          <div className="text-xs text-slate-500 text-right">
            Reviews appear here only after an order is received and the seller approves the submission.
          </div>
        </div>

        {customerReviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {customerReviews.map((rev) => (
              <div key={rev.id} className="bg-white p-5 sm:p-6 rounded-3xl border border-sky-100 shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-400">{[...Array(rev.rating)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}</div>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full font-extrabold inline-flex items-center gap-1"><BadgeCheck className="w-3.5 h-3.5" />Verified purchase</span>
                  </div>
                  <h4 className="text-xs font-bold text-[#032B42]">{rev.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">&ldquo;{rev.comment}&rdquo;</p>
                </div>
                <div className="pt-3.5 mt-3.5 border-t border-sky-50 flex items-center justify-between text-xs">
                  <div><p className="font-bold text-[#032B42]">{rev.customerName}</p><p className="text-[11px] text-slate-400">{rev.customerCity}, Tamil Nadu</p></div>
                  <span className="text-[10px] text-[#0875B5] font-medium truncate max-w-[120px]">{rev.productName}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-sky-200 bg-white/80 p-8 text-center">
            <Star className="w-8 h-8 text-sky-200 mx-auto" />
            <h3 className="font-extrabold text-[#032B42] mt-3">Real customer reviews will appear here</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-xl mx-auto">A customer can review a product only after the order is marked received. The seller then approves the review before it is shown publicly.</p>
          </div>
        )}
      </section>

      {recentlyViewed.length > 0 && (
        <section id="section-recently-viewed" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-5 sm:mb-8">
            <div>
              <span className="text-[11px] sm:text-xs font-bold text-violet-600 uppercase tracking-wider">Continue Exploring</span>
              <h2 className="text-xl sm:text-3xl font-extrabold text-[#032B42] mt-0.5 sm:mt-1">Recently Viewed</h2>
              <p className="text-xs text-slate-500 mt-1">Products you opened recently on this device.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {recentlyViewed.map((product) => (
              <ProductCard key={product.id} product={product} onOpenProduct={onOpenProduct} onRequireAuth={onRequireAuth} isWishlisted={(wishlistIds || []).includes(product.id)} />
            ))}
          </div>
        </section>
      )}

      {/* 9. GUPPY CARE KNOWLEDGE & SEASONAL PREVIEW (Section 11, Item 12 & 13) */}
      <section id="section-care-knowledge" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-5 sm:mb-8">
          <div>
            <span className="text-[11px] sm:text-xs font-bold text-[#0875B5] uppercase tracking-wider">
              Hobbyist Knowledge Hub
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold text-[#032B42] font-['Manrope',sans-serif] mt-0.5 sm:mt-1">
              Guppy Care Essentials
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/guppy-care')}
            className="text-xs font-bold text-[#0875B5] hover:text-[#064463] flex items-center gap-1 group py-1 min-h-[44px]"
          >
            <span>All Guides</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {careArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => onNavigate(`/guppy-care/${article.slug}`)}
              className="group bg-white rounded-3xl border border-sky-100 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between active:scale-[0.99]"
            >
              <div>
                <div className="relative aspect-16/9 overflow-hidden bg-[#F5FCFF]">
                  <img
                    src={article.bannerImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-[#021E31]/80 backdrop-blur-xs text-[#50D4EE] text-[10px] font-bold px-2.5 py-1 rounded-lg">
                    {article.category}
                  </span>
                </div>
                <div className="p-4 sm:p-5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{article.readTime}</span>
                    <span>{article.publishedAt}</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#032B42] group-hover:text-[#0875B5] transition-colors leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{article.summary}</p>
                </div>
              </div>

              <div className="p-4 sm:p-5 pt-0">
                <span className="text-xs font-bold text-[#0875B5] group-hover:underline inline-flex items-center gap-1 min-h-[32px]">
                  Read Guide <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
