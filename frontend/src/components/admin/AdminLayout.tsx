import React, { useEffect, useState } from 'react';
import { Product } from '../../types';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import { AdminDashboard } from './AdminDashboard';
import { AdminProducts } from './AdminProducts';
import { AdminOrders } from './AdminOrders';
import { AdminPincodes } from './AdminPincodes';
import { AdminReviews } from './AdminReviews';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminSettings } from './AdminSettings';
import { AdminSupport } from './AdminSupport';
import { AdminPayments } from './AdminPayments';
import { ProductFormModal } from './ProductFormModal';
import {
  LayoutDashboard,
  Package,
  Truck,
  MapPin,
  Star,
  BarChart3,
  ExternalLink,
  ShieldCheck,
  Fish,
  Settings,
  MessageSquare,
  CreditCard,
  LogOut,
} from 'lucide-react';

interface AdminLayoutProps {
  onNavigateToStore: () => void;
  onLogout: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onNavigateToStore, onLogout }) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [products, setProducts] = useState<Product[]>(productService.getAllProducts());
  const [orders, setOrders] = useState(orderService.getAllOrders());
  const [unreadPayments, setUnreadPayments] = useState(0);

  // Product modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const unsub = orderService.subscribe(setOrders);
    const unsubProducts = productService.subscribe(setProducts);
    void productService.refreshAdmin().catch(() => undefined);
    void orderService.refreshAdminOrders().catch(() => undefined);
    return () => { unsub(); unsubProducts(); };
  }, []);

  useEffect(() => {
    const API=(import.meta.env.VITE_API_BASE_URL||'http://localhost:4000/api').replace(/\/$/,'');
    let stopped=false;
    const poll=async()=>{if(stopped||document.visibilityState!=='visible')return;try{let res=await fetch(`${API}/payments/admin/notifications`,{credentials:'include'});if(res.status===401){const refreshed=await fetch(`${API}/auth/admin/refresh`,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:'{}'});if(refreshed.ok)res=await fetch(`${API}/payments/admin/notifications`,{credentials:'include'});}if(res.status===401||res.status===403){stopped=true;return;}const body=await res.json();if(res.ok&&body.success)setUnreadPayments(body.data.filter((item:any)=>!item.isRead).length);}catch{/* retry later */}};
    void poll();const timer=window.setInterval(()=>void poll(),5000);return()=>{stopped=true;window.clearInterval(timer)};
  },[]);

  const handleRefreshData = () => {
    void productService.refreshAdmin().catch(() => setProducts([...productService.getAllProducts(true)]));
    void orderService.refreshAdminOrders().catch(() => setOrders([...orderService.getAllOrders()]));
  };

  const handleLogout = async () => {
    const API = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api').replace(/\/$/, '');
    try {
      await fetch(`${API}/auth/admin/logout`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: '{}',
      });
    } finally {
      onLogout();
    }
  };

  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setIsProductModalOpen(true);
  };

  const tabs = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders & Dispatch', icon: Truck },
    { id: 'payments', label: unreadPayments ? `UPI Verification (${unreadPayments})` : 'UPI Verification', icon: CreditCard },
    { id: 'pincodes', label: 'TN PIN Codes', icon: MapPin },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'support', label: 'Support', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Contact Settings', icon: Settings },
  ];

  return (
    <div id="admin-console" className="min-h-screen bg-[#F4F9FC] text-[#032B42]">
      {/* Top Admin Bar */}
      <header className="bg-[#021E31] text-white sticky top-0 z-40 border-b border-[#0875B5]/20 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0875B5] flex items-center justify-center text-white shadow-xs">
              <Fish className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-wide font-['Manrope',sans-serif]">
                  Sweety Birds &amp; Fishes
                </span>
                <span className="text-[10px] bg-[#50D4EE]/20 text-[#50D4EE] font-mono px-1.5 py-0.2 rounded font-bold">
                  ADMIN CONSOLE
                </span>
              </div>
              <p className="text-[10px] text-slate-300">Store Operations • Tamil Nadu</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToStore}
              className="bg-[#50D4EE]/10 hover:bg-[#50D4EE]/20 text-[#50D4EE] border border-[#50D4EE]/30 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all"
            >
              <span>View Live Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => void handleLogout()}
              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-200 border border-rose-300/20 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all"
              aria-label="Sign out of seller console"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-1 sm:gap-2 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-[#0875B5] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Admin Content View */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <AdminDashboard
            onNavigateTab={setActiveTab}
            onOpenCreateProduct={handleOpenCreateProduct}
          />
        )}

        {activeTab === 'products' && (
          <AdminProducts
            products={products}
            onRefresh={handleRefreshData}
            onEditProduct={handleOpenEditProduct}
            onAddProduct={handleOpenCreateProduct}
          />
        )}

        {activeTab === 'orders' && (
          <AdminOrders orders={orders} onRefresh={handleRefreshData} />
        )}
        {activeTab === 'payments' && <AdminPayments />}

        {activeTab === 'pincodes' && <AdminPincodes />}

        {activeTab === 'reviews' && <AdminReviews />}

        {activeTab === 'support' && <AdminSupport />}

        {activeTab === 'analytics' && <AdminAnalytics />}

        {activeTab === 'settings' && <AdminSettings />}
      </main>

      {/* Product Add/Edit Modal */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        productToEdit={editingProduct}
        onSave={handleRefreshData}
      />
    </div>
  );
};
