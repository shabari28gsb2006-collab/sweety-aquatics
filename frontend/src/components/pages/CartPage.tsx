import React, { useState, useEffect } from 'react';
import { cartService } from '../../services/cartService';
import { CartItem, Product } from '../../types';
import { PincodeChecker } from '../common/PincodeChecker';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, ChevronLeft } from 'lucide-react';

interface CartPageProps {
  onNavigate: (route: string) => void;
  onOpenProduct: (product: Product) => void;
  onRequireAuth: (message: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({
  onNavigate,
  onOpenProduct,
  onRequireAuth,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    return cartService.subscribe(setItems);
  }, []);

  const subtotal = cartService.getSubtotal();
  const shippingFee = cartService.getShippingFee(subtotal);
  const total = subtotal + shippingFee;

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-sky-50 text-[#0875B5] mx-auto flex items-center justify-center">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-[#032B42]">Your Shopping Cart is Empty</h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Explore the current guppy, fish food and combo-pack catalog.
        </p>
        <button
          onClick={() => onNavigate('/shop')}
          className="mt-4 bg-[#0875B5] hover:bg-[#064463] text-white text-xs font-bold px-6 py-3 rounded-2xl shadow-md transition-all"
        >
          Explore Shop
        </button>
      </div>
    );
  }

  return (
    <div id="cart-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-12 pb-28 md:pb-12">
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 sm:mb-6">
        <button onClick={() => onNavigate('/shop')} className="hover:text-slate-700 flex items-center gap-1 min-h-[36px]">
          <ChevronLeft className="w-3.5 h-3.5" /> Continue Shopping
        </button>
      </div>

      <h1 className="text-xl sm:text-3xl font-extrabold text-[#032B42] font-['Manrope',sans-serif] mb-5 sm:mb-8">
        Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-sky-100 p-4 sm:p-6 shadow-xs divide-y divide-sky-50">
            {items.map((item) => (
              <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex gap-3 sm:gap-4 items-start">
                  <img
                    src={item.product.thumbnail}
                    alt={item.product.name}
                    onClick={() => onOpenProduct(item.product)}
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border border-sky-100 bg-[#F5FCFF] cursor-pointer shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0875B5] block">
                          {item.product.category.replace('-', ' ')}
                        </span>
                        <h3
                          onClick={() => onOpenProduct(item.product)}
                          className="text-xs sm:text-sm font-bold text-[#032B42] hover:text-[#0875B5] cursor-pointer truncate"
                        >
                          {item.product.name}
                        </h3>
                      </div>
                      <button
                        onClick={() => void cartService.removeItem(item.productId)}
                        className="text-slate-400 hover:text-rose-500 p-1 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-[11px] font-medium text-slate-500 mt-0.5">₹{item.product.price} / unit</p>

                    {/* Quantity & Total Row */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50 sm:border-0 sm:pt-0 sm:mt-2">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-sky-200 rounded-xl bg-[#F8FDFF] p-0.5">
                        <button
                          onClick={() => void cartService.updateQuantity(item.productId, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-sky-100 rounded-lg transition-colors min-h-[32px] min-w-[32px]"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center font-bold text-xs font-mono text-[#032B42]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => void cartService.updateQuantity(item.productId, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-sky-100 rounded-lg transition-colors min-h-[32px] min-w-[32px]"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Total item price */}
                      <span className="text-sm sm:text-base font-extrabold text-[#032B42] font-mono">
                        ₹{item.product.price * item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Check Card */}
          <div className="bg-white rounded-3xl border border-sky-100 p-4 sm:p-6 shadow-xs">
            <PincodeChecker />
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-3xl border border-sky-100 p-5 sm:p-6 shadow-xs space-y-5 lg:sticky lg:top-24">
          <h2 className="font-bold text-xs sm:text-sm text-[#032B42] uppercase tracking-wider">
            Order Summary
          </h2>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-bold text-slate-800 font-mono">₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Courier + Packing (TN)</span>
              <span className="font-bold text-slate-800 font-mono">
                {shippingFee === 0 ? <span className="text-emerald-600">FREE</span> : `₹${shippingFee}`}
              </span>
            </div>
            <div className="pt-3 border-t border-sky-100 flex justify-between text-base font-extrabold text-[#032B42]">
              <span>Estimated Total</span>
              <span className="font-mono">₹{total}</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('/checkout')}
            className="w-full bg-[#0875B5] hover:bg-[#064463] text-white text-xs sm:text-sm font-bold py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 min-h-[48px]"
          >
            Proceed to Secure Checkout
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100 flex items-start gap-2.5 text-[11px] text-sky-900">
            <ShieldCheck className="w-4 h-4 text-[#0875B5] shrink-0 mt-0.5" />
            <p>
              Courier selection and delivery timing are confirmed using seller-managed serviceability data.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Checkout Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-sky-100 px-4 pt-2.5 pb-4 shadow-2xl flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block leading-none mb-0.5">Total</span>
          <span className="text-lg font-extrabold text-[#032B42] font-mono leading-none">
            ₹{total}
          </span>
        </div>
        <button
          onClick={() => onNavigate('/checkout')}
          className="flex-1 max-w-[240px] bg-[#0875B5] hover:bg-[#064463] text-white text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all min-h-[46px]"
        >
          <span>Checkout</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
