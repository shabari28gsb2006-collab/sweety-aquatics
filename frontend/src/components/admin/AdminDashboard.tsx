import React from 'react';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import {
  DollarSign,
  Package,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Truck,
  Plus,
} from 'lucide-react';
import { OrderStatus } from '../../types';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenCreateProduct: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateTab,
  onOpenCreateProduct,
}) => {
  const products = productService.getAllProducts();
  const orders = orderService.getAllOrders();

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const lowStockProducts = products.filter((p) => p.stock <= 5);
  const pendingShipments = orders.filter((o) => o.orderStatus === 'PAYMENT_CONFIRMED' || o.orderStatus === 'PACKED' || o.orderStatus === 'PROCESSING');

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#032B42] font-['Manrope',sans-serif]">
            Store Control Desk
          </h1>
          <p className="text-xs text-slate-500">
            Real-time catalog, stock alerts, and seller-managed Tamil Nadu dispatches.
          </p>
        </div>

        <button
          onClick={onOpenCreateProduct}
          className="bg-[#0875B5] hover:bg-[#064463] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Aquatic Product
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-sky-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
              ₹
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#032B42]">₹{totalRevenue.toLocaleString()}</p>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Tamil Nadu Dispatches
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-sky-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#0875B5] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#032B42]">{orders.length}</p>
          <p className="text-[11px] text-slate-500">
            {pendingShipments.length} awaiting dispatch scan
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-sky-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Live Catalog</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#032B42]">{products.length}</p>
          <p className="text-[11px] text-slate-500">
            Guppies, Feeds, Combos &amp; Wholesale
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-sky-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Low Stock</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#032B42]">{lowStockProducts.length}</p>
          <p className="text-[11px] text-amber-600 font-semibold">Products requiring attention</p>
        </div>
      </div>

      {/* Low Stock Notice if any */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 rounded-3xl border border-amber-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Low Inventory Warning ({lowStockProducts.length} items &le; 5 units)</span>
            </div>
            <button
              onClick={() => onNavigateTab('products')}
              className="text-[11px] text-amber-900 font-bold underline"
            >
              Restock in Products &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {lowStockProducts.slice(0, 3).map((item) => (
              <div key={item.id} className="bg-white p-3 rounded-xl border border-amber-100 flex items-center justify-between text-xs">
                <div className="truncate pr-2">
                  <p className="font-bold text-[#032B42] truncate">{item.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-mono">{item.category}</p>
                </div>
                <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                  {item.stock} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders Overview */}
      <div className="bg-white rounded-3xl border border-sky-100 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-[#032B42] uppercase tracking-wider">
            Recent Orders &amp; Dispatch Status
          </h3>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs font-bold text-[#0875B5] hover:underline flex items-center gap-1"
          >
            View All Orders <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-sky-50 text-slate-400 uppercase text-[10px]">
                <th className="pb-3 font-semibold">Order</th>
                <th className="pb-3 font-semibold">Customer</th>
                <th className="pb-3 font-semibold">District</th>
                <th className="pb-3 font-semibold">Items</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold">Courier Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-50">
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-sky-50/50 transition-colors">
                  <td className="py-3 font-mono font-bold text-[#032B42]">{order.orderNumber}</td>
                  <td className="py-3 text-slate-700 font-medium">{order.customerName}</td>
                  <td className="py-3 text-slate-500">{order.deliveryAddress?.district || 'Tamil Nadu'}</td>
                  <td className="py-3 text-slate-500">{order.items.length} items</td>
                  <td className="py-3 font-bold text-[#032B42]">₹{order.totalAmount}</td>
                  <td className="py-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        order.orderStatus === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.orderStatus === 'SHIPPED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.orderStatus.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
