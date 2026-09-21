import React from 'react';
import { Order } from '../../types';
import { CheckCircle2, Clock3, Truck, ShoppingBag } from 'lucide-react';

interface OrderSuccessPageProps {
  order: Order;
  onNavigate: (route: string) => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({ order, onNavigate }) => {
  const paid = order.paymentStatus === 'PAID';
  const deliveryEstimate = (() => {
    const value = order.shipment?.estimatedDelivery;
    if (!value) return 'Updated after the seller schedules dispatch';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : `Expected by ${date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`;
  })();
  return (
    <div id="order-success-page" className="max-w-3xl mx-auto px-4 py-12 sm:py-16 space-y-8">
      {/* Confirmation Header */}
      <div className="text-center space-y-3">
        <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center shadow-xs ${paid ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
          {paid ? <CheckCircle2 className="w-10 h-10" /> : <Clock3 className="w-9 h-9" />}
        </div>
        <span className={`text-xs font-bold uppercase tracking-wider ${paid ? 'text-emerald-600' : 'text-amber-600'}`}>
          {paid ? 'Payment Confirmed' : 'Payment Verification in Process'}
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#032B42] font-['Manrope',sans-serif]">
          {paid ? 'Thank You! Your Order is Confirmed.' : 'Payment Details Submitted Successfully'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          We have received your order <span className="font-mono font-bold text-[#032B42]">{order.orderNumber}</span>.
          {paid ? ' Your order is confirmed. Packing and shipment details will be updated shortly.' : ' The seller is checking your Transaction ID. Your order will be confirmed only after payment verification.'}
        </p>
      </div>

      {/* Order Summary Receipt Card */}
      <div className="bg-white rounded-3xl border border-sky-100 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-sky-100 gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Order Reference</span>
            <p className="text-base font-extrabold font-mono text-[#032B42]">{order.orderNumber}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Estimated Delivery</span>
            <p className="text-sm font-bold text-emerald-700">
              {deliveryEstimate}
            </p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Payment Status</span>
            <p className="text-xs font-bold text-[#0875B5]">
              {paid ? `Paid ₹${order.totalAmount} via manual UPI` : `₹${order.totalAmount} • Verification in process`}
            </p>
          </div>
        </div>

        {/* Shipping Address */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Delivery Destination (Tamil Nadu)
          </h3>
          <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 text-xs text-slate-700 space-y-1">
            <p className="font-bold text-[#032B42]">{order.deliveryAddress.fullName}</p>
            <p>{order.deliveryAddress.addressLine}, {order.deliveryAddress.area}</p>
            <p>{order.deliveryAddress.city}, {order.deliveryAddress.district}, Tamil Nadu - {order.deliveryAddress.pincode}</p>
            <p className="text-slate-500">Contact: {order.deliveryAddress.phone}</p>
          </div>
        </div>

        {/* Item List */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Ordered Aquatic Items
          </h3>
          <div className="divide-y divide-sky-50">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3 first:pt-0 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img src={item.productImage} alt="" className="w-12 h-12 rounded-xl object-cover bg-sky-50" />
                  <div>
                    <h4 className="font-bold text-[#032B42]">{item.productName}</h4>
                    <p className="text-slate-400 text-[11px]">Qty: {item.quantity} × ₹{item.unitPrice}</p>
                  </div>
                </div>
                <span className="font-bold text-[#032B42]">₹{item.unitPrice * item.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Total calculation */}
        <div className="pt-4 border-t border-sky-100 space-y-1.5 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{order.subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>{order.shipment?.courierName || 'Shipping'}</span>
            <span>{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span>
          </div>
          <div className="flex justify-between font-extrabold text-sm text-[#032B42] pt-2 border-t border-sky-50">
            <span>{paid ? 'Total Paid' : 'Amount Submitted for Verification'}</span>
            <span>₹{order.totalAmount}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={() => onNavigate(`/track-order/${order.id}`)}
          className="w-full sm:w-auto bg-[#0875B5] hover:bg-[#064463] text-white text-xs font-bold py-3.5 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Truck className="w-4 h-4" />
          Track Order Live
        </button>
        <button
          onClick={() => onNavigate('/shop')}
          className="w-full sm:w-auto bg-sky-50 hover:bg-sky-100 text-[#0875B5] text-xs font-bold py-3.5 px-6 rounded-2xl border border-sky-200 transition-all flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          Continue Shopping
        </button>
      </div>
    </div>
  );
};
