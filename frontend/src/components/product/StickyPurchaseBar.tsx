import React from 'react';
import { Product } from '../../types';
import { ShoppingBag, Zap, MessageCircle } from 'lucide-react';

interface StickyPurchaseBarProps {
  product: Product;
  quantity: number;
  onAddToCart: () => void;
  onBuyNow: () => void;
  onWhatsAppEnquiry: () => void;
}

export const StickyPurchaseBar: React.FC<StickyPurchaseBarProps> = ({
  product,
  quantity,
  onAddToCart,
  onBuyNow,
  onWhatsAppEnquiry,
}) => {
  return (
    <div
      id="mobile-sticky-purchase-bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-sky-100 px-3.5 pt-2.5 pb-4 sm:pb-3.5 shadow-2xl animate-in slide-in-from-bottom duration-200"
    >
      <div className="flex items-center justify-between gap-3">
        {/* Price & Unit */}
        <div className="shrink-0">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block leading-none mb-0.5">Total</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-extrabold text-[#032B42] font-mono leading-none">
              ₹{product.price * quantity}
            </span>
            {quantity > 1 && (
              <span className="text-[10px] text-slate-400">({quantity}x)</span>
            )}
          </div>
        </div>

        {/* Buttons based on status */}
        <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
          {product.status === 'COMING_SOON' ? (
            <button
              onClick={onWhatsAppEnquiry}
              className="flex-1 max-w-[260px] bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-xs min-h-[46px] active:scale-95 transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-current shrink-0" />
              <span>WhatsApp Enquiry</span>
            </button>
          ) : product.status === 'OUT_OF_STOCK' || product.stock <= 0 ? (
            <button
              disabled
              className="flex-1 max-w-[200px] bg-slate-100 text-slate-400 text-xs font-bold py-3 px-4 rounded-xl cursor-not-allowed min-h-[46px]"
            >
              Out of Stock
            </button>
          ) : (
            <>
              <button
                onClick={onAddToCart}
                className="bg-sky-50 text-[#0875B5] border border-sky-200 text-xs font-bold py-3 px-3.5 rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all min-h-[46px] shrink-0"
              >
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span className="inline min-[390px]:hidden">Add</span>
                <span className="hidden min-[390px]:inline">Add to Cart</span>
              </button>
              <button
                onClick={onBuyNow}
                className="flex-1 bg-[#0875B5] hover:bg-[#064463] text-white text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all min-h-[46px]"
              >
                <Zap className="w-4 h-4 fill-current text-[#50D4EE] shrink-0" />
                <span>Buy Now</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
