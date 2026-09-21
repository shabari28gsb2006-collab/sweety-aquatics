import React, { useState, useEffect } from 'react';
import { cartService } from '../../services/cartService';
import { CartItem } from '../../types';
import { PincodeChecker } from './PincodeChecker';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
  onRequireAuth: (message: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout,
  onRequireAuth,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isServiceable, setIsServiceable] = useState<boolean | null>(null);

  useEffect(() => {
    return cartService.subscribe((cartItems) => {
      setItems(cartItems);
    });
  }, []);

  if (!isOpen) return null;

  const subtotal = cartService.getSubtotal();
  const shippingFee = cartService.getShippingFee(subtotal);
  const total = subtotal + shippingFee;

  return (
    <div
      id="cart-drawer-backdrop"
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in"
    >
      <div
        id="cart-drawer-panel"
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 relative"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-sky-100 flex items-center justify-between bg-[#F8FDFF]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0875B5]/10 flex items-center justify-center text-[#0875B5]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#032B42] text-base font-['Manrope',sans-serif]">Your Cart</h3>
              <p className="text-xs text-slate-500">
                {items.length} {items.length === 1 ? 'item' : 'items'} in basket
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
            aria-label="Close cart drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Free Shipping Alert Banner */}
        {subtotal > 0 && subtotal < cartService.freeShippingThreshold && (
          <div className="bg-sky-50 px-4 py-2 border-b border-sky-100 text-center text-xs text-[#0875B5]">
            Add <span className="font-bold">₹{cartService.freeShippingThreshold - subtotal}</span> more for{' '}
            <span className="font-bold uppercase tracking-wider">FREE Courier + Packing</span>
          </div>
        )}

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 divide-y divide-slate-100">
          {items.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-sky-50 text-[#0875B5] mx-auto flex items-center justify-center mb-3">
                <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h4 className="font-bold text-slate-700 text-sm">Your Cart is Empty</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Explore the current guppy, fish food and combo-pack catalog.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="pt-3 first:pt-0 flex gap-3">
                <img
                  src={item.product.thumbnail}
                  alt={item.product.name}
                  className="w-20 h-20 rounded-xl object-cover border border-sky-100 bg-[#F5FCFF] shrink-0"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-[#032B42] line-clamp-1 pr-2">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => void cartService.removeItem(item.productId)}
                        className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {item.product.category === 'guppies' && item.product.guppyDetails
                        ? `${item.product.guppyDetails.gender} • ${item.product.guppyDetails.variety}`
                        : item.product.category === 'fish-food' && item.product.fishFoodDetails
                        ? item.product.fishFoodDetails.netWeight
                        : 'Combo Selection'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-sky-200 rounded-lg bg-[#F8FDFF] overflow-hidden">
                      <button
                        onClick={() => void cartService.updateQuantity(item.productId, item.quantity - 1)}
                        className="px-2 py-1 text-slate-600 hover:bg-sky-100 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2.5 py-0.5 text-xs font-semibold font-mono text-[#032B42]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => void cartService.updateQuantity(item.productId, item.quantity + 1)}
                        className="px-2 py-1 text-slate-600 hover:bg-sky-100 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-extrabold text-[#032B42]">
                        ₹{item.product.price * item.quantity}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-[10px] text-slate-400">₹{item.product.price} each</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Inline Delivery Check in Cart */}
          {items.length > 0 && (
            <div className="pt-4">
              <PincodeChecker
                compact
                onServiceabilityChange={(res) => setIsServiceable(res.isServiceable)}
              />
            </div>
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-sky-100 bg-[#F8FDFF] space-y-3">
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">₹{subtotal}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Estimated Courier + Packing</span>
                <span className="font-semibold text-slate-800">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `₹${shippingFee}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-[#032B42] pt-2 border-t border-sky-100">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>

            <button
              id="btn-cart-proceed-checkout"
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full bg-[#0875B5] hover:bg-[#064463] text-white text-xs font-bold py-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Careful packing for eligible orders</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
