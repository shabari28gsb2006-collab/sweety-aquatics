import React, { useState, useEffect } from 'react';
import { User, Order, Product, Address } from '../../types';
import { authService } from '../../services/authService';
import { orderService } from '../../services/orderService';
import { wishlistService } from '../../services/wishlistService';
import { productService } from '../../services/productService';
import { cartService } from '../../services/cartService';
import { toastService } from '../../services/toastService';
import { reviewService } from '../../services/reviewService';
import { customerFeatureService, AquariumProfile, CustomerNotification, SupportTicket } from '../../services/customerFeatureService';
import { ProductCard } from '../product/ProductCard';
import {
  Package,
  Heart,
  MapPin,
  User as UserIcon,
  LogOut,
  Truck,
  RotateCcw,
  ShieldCheck,
  Calendar,
  ExternalLink,
  Star,
  X,
  Fish,
  Bell,
  Pencil,
  Trash2,
  Plus,
  Check,
  Download,
  MessageSquare,
} from 'lucide-react';

interface AccountPageProps {
  initialTab?: 'profile' | 'orders' | 'wishlist' | 'addresses' | 'aquarium' | 'notifications' | 'support';
  onNavigate: (route: string) => void;
  onOpenProduct: (product: Product) => void;
  onRequireAuth: (reason?: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  initialTab = 'orders',
  onNavigate,
  onOpenProduct,
  onRequireAuth,
}) => {
  const [user, setUser] = useState<User | null>(authService.getUser());
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist' | 'addresses' | 'aquarium' | 'notifications' | 'support'>(initialTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [reviewing, setReviewing] = useState<{ order: Order; item: Order['items'][number] } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [productQualityRating, setProductQualityRating] = useState(5);
  const [packingRating, setPackingRating] = useState(5);
  const [deliveryRating, setDeliveryRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [, setReviewVersion] = useState(0);
  const [aquariumProfiles, setAquariumProfiles] = useState<AquariumProfile[]>([]);
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [editingAquariumId, setEditingAquariumId] = useState<string | null>(null);
  const [nicknameDraft, setNicknameDraft] = useState('');
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressDraft, setAddressDraft] = useState<Omit<Address, 'id'>>({ fullName: '', phone: '', addressLine: '', area: '', city: '', district: '', state: 'Tamil Nadu', pincode: '', isDefault: false });

  useEffect(() => {
    const unsubAuth = authService.subscribe((u) => {
      setUser(u);
      if (u) {
        setOrders(orderService.getOrdersByUser(u.id));
        void orderService.refreshCustomerOrders().catch((error) => toastService.error('Orders unavailable', error instanceof Error ? error.message : 'Unable to load orders.'));
      } else {
        setOrders([]);
      }
    });

    const syncWishlist = (ids: string[]) => {
      const all = ids.map((id) => productService.getById(id)).filter((p): p is Product => Boolean(p));
      setWishlistProducts(all);
    };

    const unsubWishlist = wishlistService.subscribe(syncWishlist);
    const unsubOrders = orderService.subscribe((allOrders) => {
      const currentUser = authService.getUser();
      if (currentUser) setOrders(allOrders.filter((order) => order.userId === currentUser.id));
    });
    const unsubReviews = reviewService.subscribe(() => setReviewVersion((version) => version + 1));
    if (user) void reviewService.refreshMine().catch(() => undefined);

    if (user) {
      setOrders(orderService.getOrdersByUser(user.id));
      void orderService.refreshCustomerOrders().catch(() => undefined);
    }

    return () => {
      unsubAuth();
      unsubWishlist();
      unsubOrders();
      unsubReviews();
    };
  }, []);

  useEffect(() => {
    if (!user) { setAquariumProfiles([]); return; }
    void customerFeatureService.getAquariumProfiles().then(setAquariumProfiles).catch((error) => toastService.error('Aquarium unavailable', error instanceof Error ? error.message : 'Unable to load My Aquarium.'));
  }, [user, orders]);

  useEffect(() => {
    if (!user) return;
    void Promise.all([customerFeatureService.getNotifications(), customerFeatureService.getSupportTickets()]).then(([notices, tickets]) => { setNotifications(notices); setSupportTickets(tickets); }).catch(() => undefined);
  }, [user]);


  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-sky-50 text-[#0875B5] mx-auto flex items-center justify-center">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#032B42]">Sign In to Sweety Birds &amp; Fishes</h2>
        <p className="text-xs text-slate-500">
          Access your order timeline, track seller-provided shipment details, and manage saved products.
        </p>
        <button
          onClick={() => onRequireAuth('Please sign in to view your customer dashboard.')}
          className="bg-[#0875B5] hover:bg-[#064463] text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md transition-all"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  const handleLogout = () => {
    authService.logout();
    toastService.info('Signed out successfully');
    onNavigate('/');
  };

  const handleReorder = async (order: Order) => {
    try { await customerFeatureService.buyAgain(order.id); await cartService.sync(); toastService.success('Buy Again Ready', 'All order items were revalidated and added using current stock.'); onNavigate('/cart'); }
    catch (error) { toastService.warning('Unable to Reorder', error instanceof Error ? error.message : 'The products are currently unavailable.'); }
  };

  const downloadInvoice = async (order: Order) => {
    try {
      const invoice = await customerFeatureService.getInvoice(order.id);
      const escape = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));
      const address = invoice.deliveryAddress as any;
      const rows = invoice.items.map(item => `<tr><td>${escape(item.name)}</td><td>${item.quantity}</td><td>₹${item.unitPrice.toFixed(2)}</td><td>₹${item.lineTotal.toFixed(2)}</td></tr>`).join('');
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escape(invoice.invoiceNumber)}</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#123;max-width:900px;margin:auto}table{width:100%;border-collapse:collapse;margin:20px 0}td,th{padding:10px;border:1px solid #dbeafe;text-align:left}h1{color:#0875B5}.totals{text-align:right}</style></head><body><h1>${escape(invoice.business.name)}</h1><h2>Invoice ${escape(invoice.invoiceNumber)}</h2><p>Issued: ${new Date(invoice.issuedAt).toLocaleString('en-IN')}</p><p><strong>Bill to:</strong> ${escape(invoice.customer.name)}<br>${escape(address?.line1)}, ${escape(address?.city)}, ${escape(address?.state)} - ${escape(address?.pincode)}</p><table><thead><tr><th>Product</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table><div class="totals"><p>Subtotal: ₹${invoice.subtotal.toFixed(2)}</p><p>Courier + Packing: ₹${invoice.shippingCharge.toFixed(2)}</p><p>Discount: ₹${invoice.discount.toFixed(2)}</p><h3>Total: ₹${invoice.total.toFixed(2)}</h3></div><p>Payment: ${escape(invoice.paymentProvider)} ${invoice.paymentId ? `• ${escape(invoice.paymentId)}` : ''}</p></body></html>`;
      const url = URL.createObjectURL(new Blob([html], { type: 'text/html' })); const a = document.createElement('a'); a.href = url; a.download = `${invoice.invoiceNumber}.html`; a.click(); URL.revokeObjectURL(url);
      toastService.success('Invoice Downloaded', 'This invoice was generated from the paid order stored on the server.');
    } catch (error) { toastService.error('Invoice unavailable', error instanceof Error ? error.message : 'Unable to load invoice.'); }
  };

  const saveAquariumNickname = async (profile: AquariumProfile) => {
    try { await customerFeatureService.updateAquariumProfile(profile, { nickname: nicknameDraft.trim() || profile.productName }); setAquariumProfiles(await customerFeatureService.getAquariumProfiles()); setEditingAquariumId(null); toastService.success('Aquarium Updated', 'Fish nickname saved to your account.'); }
    catch (error) { toastService.error('Unable to update', error instanceof Error ? error.message : 'Please try again.'); }
  };

  const toggleAquariumReminder = async (profile: AquariumProfile, field: 'feedingReminder' | 'waterCareReminder') => {
    try { await customerFeatureService.setReminder(profile, field === 'feedingReminder' ? 'FEEDING' : 'WATER_CHANGE', !profile[field]); setAquariumProfiles(await customerFeatureService.getAquariumProfiles()); toastService.info('Care Reminder Updated', 'Your reminder preference is saved to your account.'); }
    catch (error) { toastService.error('Unable to update reminder', error instanceof Error ? error.message : 'Please try again.'); }
  };

  const openAddressForm = (address?: Address) => {
    setEditingAddressId(address?.id || null);
    setAddressDraft(address ? { ...address } : { fullName: user?.name || '', phone: user?.phone || '', addressLine: '', area: '', city: '', district: '', state: 'Tamil Nadu', pincode: '', isDefault: !(user?.addresses?.length) });
    setShowAddressForm(true);
  };

  const saveAddress = () => {
    if (!/^\d{6}$/.test(addressDraft.pincode) || !addressDraft.addressLine.trim() || !addressDraft.city.trim()) {
      toastService.warning('Complete the address', 'Add address, city and a valid 6-digit PIN code.'); return;
    }
    if (editingAddressId) authService.updateAddress(editingAddressId, addressDraft);
    else authService.addAddress(addressDraft);
    setUser(authService.getUser());
    setShowAddressForm(false);
    toastService.success('Address Saved', 'Your delivery address is ready for checkout.');
  };



  const handleSubmitReview = async () => {
    if (!reviewing || !user) return;
    if (!reviewTitle.trim() || !reviewComment.trim()) {
      toastService.warning('Add a few details', 'Please add a short title and review before submitting.');
      return;
    }
    const existing = reviewService.getReviewForOrderProduct(reviewing.order.id, reviewing.item.productId);
    if (existing) {
      toastService.info('Review already submitted', existing.status === 'APPROVED' ? 'Your review is already public.' : 'Your review is waiting for seller approval.');
      setReviewing(null);
      return;
    }
    try {
      await reviewService.submitReview({
        userId: user.id,
        orderId: reviewing.order.id,
        productId: reviewing.item.productId,
        rating: reviewRating,
        productQuality: productQualityRating,
        packingRating,
        deliveryRating,
        title: reviewTitle.trim(),
        comment: reviewComment.trim(),
      });
      toastService.success('Review sent to seller', 'Your review will appear publicly after seller approval.');
      setReviewing(null);
      setReviewRating(5);
      setProductQualityRating(5);
      setPackingRating(5);
      setDeliveryRating(5);
      setReviewTitle('');
      setReviewComment('');
    } catch (error) {
      toastService.error('Review not submitted', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const primaryAddress = user.addresses?.[0];

  return (
    <div id="account-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-12">
      {/* Account Hero Banner */}
      <div className="bg-gradient-to-r from-[#021E31] via-[#064463] to-[#0875B5] rounded-3xl p-4 sm:p-8 text-white mb-6 sm:mb-8 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#50D4EE]/20 border border-[#50D4EE]/50 flex items-center justify-center text-[#50D4EE] text-lg sm:text-xl font-bold shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h1 className="text-lg sm:text-2xl font-bold font-['Manrope',sans-serif] truncate">
                {user.name}
              </h1>
              {user.isEmailVerified && (
                <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[9px] sm:text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Customer
                </span>
              )}
            </div>
            <p className="text-xs text-[#E8F9FC]/80 mt-0.5 truncate">{user.email} • {user.phone}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full sm:w-auto justify-center text-xs font-semibold text-rose-200 hover:text-white bg-white/10 hover:bg-rose-500/20 px-4 py-2.5 rounded-xl border border-white/15 transition-all flex items-center gap-1.5 min-h-[40px]"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>

      </div>

      {/* Account Navigation Tabs */}
      <div className="flex border-b border-sky-100 gap-4 sm:gap-8 mb-6 sm:mb-8 overflow-x-auto no-scrollbar whitespace-nowrap -mx-4 px-4 sm:mx-0 sm:px-0">
        {[
          { id: 'orders', label: 'My Orders', icon: Package, count: orders.length },
          { id: 'aquarium', label: 'My Aquarium', icon: Fish, count: aquariumProfiles.length },
          { id: 'notifications', label: 'Notifications', icon: Bell, count: notifications.filter(item => !item.isRead).length },
          { id: 'support', label: 'Support', icon: MessageSquare, count: supportTickets.length },
          { id: 'wishlist', label: 'Wishlist', icon: Heart, count: wishlistProducts.length },
          { id: 'addresses', label: 'Saved Addresses', icon: MapPin, count: user.addresses?.length || 0 },
          { id: 'profile', label: 'Profile Details', icon: UserIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-xs font-bold tracking-wide uppercase transition-all flex items-center gap-2 shrink-0 min-h-[44px] ${
                activeTab === tab.id
                  ? 'text-[#0875B5] border-b-2 border-[#0875B5]'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-100 text-[#0875B5]">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-sky-100 p-8 sm:p-12 text-center space-y-3">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-sm text-[#032B42]">No Orders Yet</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Once you complete your checkout, you can track seller packing, dispatch and receipt status here.
              </p>
              <button
                onClick={() => onNavigate('/shop')}
                className="bg-[#0875B5] text-white text-xs font-semibold px-4 py-2.5 rounded-xl min-h-[40px]"
              >
                Browse Shop
              </button>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-sky-100 p-4 sm:p-6 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-sky-50 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[#032B42]">
                        {order.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          (order.orderStatus === 'DELIVERED' || !!order.receivedAt)
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.orderStatus === 'SHIPPED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.orderStatus.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Placed on {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleReorder(order)}
                      className="flex-1 sm:flex-initial justify-center text-xs font-semibold text-slate-600 hover:text-[#0875B5] bg-sky-50 px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1 min-h-[40px]"
                    >
                      <RotateCcw className="w-3 h-3" /> Buy Again
                    </button>
                    <button
                      onClick={() => downloadInvoice(order)}
                      className="flex-1 sm:flex-initial justify-center text-xs font-semibold text-slate-600 hover:text-[#0875B5] bg-slate-50 px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1 min-h-[40px]"
                    >
                      <Download className="w-3.5 h-3.5" /> Invoice
                    </button>
                    <button
                      onClick={() => onNavigate(`/track-order/${order.id}`)}
                      className="flex-1 sm:flex-initial justify-center text-xs font-bold text-white bg-[#0875B5] hover:bg-[#064463] px-3.5 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 min-h-[40px]"
                    >
                      <Truck className="w-3.5 h-3.5" /> Track Live
                    </button>
                  </div>
                </div>

                {(order.orderStatus === 'DELIVERED' || !!order.receivedAt) && order.items.some((it) => !reviewService.getReviewForOrderProduct(order.id, it.productId)) && (
                  <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-extrabold text-amber-700 uppercase tracking-wider">Order received • your experience matters</p>
                      <p className="text-sm font-extrabold text-[#032B42] mt-1">Rate the products you received</p>
                      <p className="text-xs text-slate-500 mt-1">Tap <strong>Rate &amp; Review</strong> beside a product. Your review goes to the seller for approval before it is published.</p>
                    </div>
                    <div className="flex text-amber-400 gap-0.5 shrink-0">{[1,2,3,4,5].map((n)=><Star key={n} className="w-5 h-5 fill-current" />)}</div>
                  </div>
                )}

                {/* Items in order */}
                <div className="space-y-2.5">
                  {order.items.map((it, idx) => {
                    const existingReview = reviewService.getReviewForOrderProduct(order.id, it.productId);
                    return (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3 rounded-2xl p-2 hover:bg-sky-50/60 transition-colors">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img src={it.productImage} alt={it.productName} className="w-12 h-12 rounded-xl object-cover bg-sky-50 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-bold text-[#032B42] truncate">{it.productName}</p>
                            <p className="text-[11px] text-slate-400">Qty: {it.quantity} × ₹{it.unitPrice}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 justify-between sm:justify-end">
                          {(order.orderStatus === 'DELIVERED' || !!order.receivedAt) && (
                            existingReview ? (existingReview.status === 'PENDING' ? null :
                              <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-full ${existingReview.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' : existingReview.status === 'REJECTED' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>
                                {existingReview.status === 'APPROVED' ? 'Review Published' : 'Review Not Published'}
                              </span>
                            ) : (
                              <button
                                onClick={() => { setReviewing({ order, item: it }); setReviewRating(5); setReviewTitle(''); setReviewComment(''); }}
                                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0875B5] bg-sky-50 hover:bg-sky-100 px-3 py-2 rounded-xl transition-colors"
                              >
                                <Star className="w-3.5 h-3.5" /> Rate & Review
                              </button>
                            )
                          )}
                          <span className="font-bold text-[#032B42] font-mono shrink-0">₹{it.unitPrice * it.quantity}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Order Footer Info */}
                <div className="pt-3 border-t border-sky-50 flex items-center justify-between text-xs text-slate-500">
                  <span className="truncate pr-2">{order.shipment?.courierName ? `Carrier: ${order.shipment.courierName}` : order.packingScheduledAt ? `Packing: ${new Date(order.packingScheduledAt).toLocaleString()}` : 'Awaiting seller packing schedule'}</span>
                  <span className="font-bold text-[#032B42] text-sm shrink-0">Total: ₹{order.totalAmount}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB CONTENT: WISHLIST */}
      {activeTab === 'wishlist' && (
        <div>
          {wishlistProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-sky-100 p-8 sm:p-12 text-center space-y-3">
              <Heart className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-sm text-[#032B42]">Your Wishlist is Empty</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Explore our guppy varieties and bookmark your favorites for breeding projects.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {wishlistProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onOpenProduct={onOpenProduct}
                  onRequireAuth={onRequireAuth}
                  isWishlisted={true}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: SAVED ADDRESSES */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between"><div><h3 className="font-extrabold text-lg text-[#032B42]">Saved Delivery Addresses</h3><p className="text-xs text-slate-500">Choose a default address for faster checkout.</p></div><button onClick={() => openAddressForm()} className="premium-action-btn px-4 py-2.5 rounded-xl bg-[#0875B5] text-white text-xs font-bold flex items-center gap-1.5"><Plus className="w-4 h-4" /> Add Address</button></div>
          <div className="grid md:grid-cols-2 gap-4">
            {(user.addresses || []).map((address) => (
              <div key={address.id} className={`bg-white rounded-3xl border p-5 shadow-sm ${address.isDefault ? 'border-[#50D4EE] ring-2 ring-[#50D4EE]/10' : 'border-sky-100'}`}>
                <div className="flex items-start justify-between gap-3"><div><p className="font-extrabold text-[#032B42]">{address.fullName}</p><p className="text-xs text-slate-600 mt-2 leading-relaxed">{address.addressLine}<br/>{address.area}<br/>{address.city}, {address.district}<br/><strong>Tamil Nadu - {address.pincode}</strong></p><p className="text-xs text-slate-400 mt-2">{address.phone}</p></div>{address.isDefault && <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-1 rounded-full">Default</span>}</div>
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-sky-50">
                  {!address.isDefault && <button onClick={() => { authService.setDefaultAddress(address.id); setUser(authService.getUser()); }} className="text-[11px] font-bold px-3 py-2 rounded-xl bg-sky-50 text-[#0875B5]"><Check className="w-3 h-3 inline mr-1"/>Set Default</button>}
                  <button onClick={() => openAddressForm(address)} className="text-[11px] font-bold px-3 py-2 rounded-xl bg-slate-50 text-slate-600"><Pencil className="w-3 h-3 inline mr-1"/>Edit</button>
                  <button onClick={() => { if (window.confirm('Remove this saved address?')) { authService.removeAddress(address.id); setUser(authService.getUser()); } }} className="text-[11px] font-bold px-3 py-2 rounded-xl bg-rose-50 text-rose-600"><Trash2 className="w-3 h-3 inline mr-1"/>Remove</button>
                </div>
              </div>
            ))}
          </div>
          {(!user.addresses || user.addresses.length === 0) && <div className="rounded-3xl border border-dashed border-sky-200 p-10 text-center text-sm text-slate-500">No saved address yet.</div>}
        </div>
      )}

      {activeTab === 'aquarium' && (
        <div className="space-y-5">
          <div><h3 className="text-xl font-extrabold text-[#032B42]">My Aquarium</h3><p className="text-xs text-slate-500 mt-1">Received guppy purchases appear here automatically. Give them a nickname and keep simple care reminders.</p></div>
          {aquariumProfiles.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-sky-200 bg-white p-10 text-center"><Fish className="w-10 h-10 text-sky-200 mx-auto"/><h4 className="font-extrabold text-[#032B42] mt-3">Your aquarium will grow here</h4><p className="text-xs text-slate-500 mt-1">After a guppy order is marked received, it will be added to My Aquarium.</p></div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{aquariumProfiles.map((profile) => (
              <div key={profile.id} className="bg-white rounded-3xl border border-sky-100 overflow-hidden shadow-sm">
                <img src={profile.productImage} alt={profile.productName} className="w-full h-40 object-cover"/>
                <div className="p-5 space-y-4">
                  <div>{editingAquariumId === profile.id ? <div className="flex gap-2"><input value={nicknameDraft} onChange={(e)=>setNicknameDraft(e.target.value)} className="flex-1 px-3 py-2 rounded-xl border border-sky-200 text-sm"/><button onClick={()=>saveAquariumNickname(profile)} className="px-3 rounded-xl bg-[#0875B5] text-white"><Check className="w-4 h-4"/></button></div> : <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] uppercase font-bold text-[#0875B5]">My Fish</p><h4 className="font-extrabold text-[#032B42]">{profile.nickname}</h4><p className="text-xs text-slate-400">{profile.productName}</p></div><button onClick={()=>{setEditingAquariumId(profile.id);setNicknameDraft(profile.nickname)}} className="p-2 rounded-xl bg-sky-50 text-[#0875B5]"><Pencil className="w-3.5 h-3.5"/></button></div>}</div>
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-3 text-xs text-slate-600"><strong className="text-emerald-800">Arrival care:</strong> keep lighting gentle, acclimate gradually, avoid sudden water changes, and observe normal swimming before regular feeding.</div>
                  <div className="grid grid-cols-2 gap-2"><button onClick={()=>toggleAquariumReminder(profile,'feedingReminder')} className={`p-3 rounded-xl text-xs font-bold border ${profile.feedingReminder?'bg-[#0875B5] text-white border-[#0875B5]':'bg-sky-50 text-[#0875B5] border-sky-100'}`}><Bell className="w-3.5 h-3.5 mx-auto mb-1"/>Feeding Reminder</button><button onClick={()=>toggleAquariumReminder(profile,'waterCareReminder')} className={`p-3 rounded-xl text-xs font-bold border ${profile.waterCareReminder?'bg-emerald-600 text-white border-emerald-600':'bg-emerald-50 text-emerald-700 border-emerald-100'}`}><Bell className="w-3.5 h-3.5 mx-auto mb-1"/>Water Care</button></div>
                </div>
              </div>
            ))}</div>
          )}
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3"><div><h3 className="text-xl font-extrabold text-[#032B42]">Notifications</h3><p className="text-xs text-slate-500 mt-1">Order, support and account updates saved to your account.</p></div>{notifications.some(item => !item.isRead) && <button onClick={() => void customerFeatureService.markAllNotificationsRead().then(async () => setNotifications(await customerFeatureService.getNotifications()))} className="text-xs font-bold text-[#0875B5]">Mark all read</button>}</div>
          {notifications.length === 0 ? <div className="rounded-3xl border border-dashed border-sky-200 bg-white p-10 text-center text-sm text-slate-500">No notifications yet.</div> : notifications.map(item => <div key={item.id} className={`rounded-2xl border p-4 ${item.isRead ? 'bg-white border-slate-100' : 'bg-sky-50 border-sky-200'}`}><div className="flex justify-between gap-3"><h4 className="font-extrabold text-sm text-[#032B42]">{item.title}</h4><span className="text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleDateString('en-IN')}</span></div><p className="text-sm text-slate-600 mt-1">{item.message}</p></div>)}
        </div>
      )}

      {activeTab === 'support' && (
        <div className="space-y-4"><div><h3 className="text-xl font-extrabold text-[#032B42]">Support Tickets</h3><p className="text-xs text-slate-500 mt-1">Create a new request from the Contact page and follow seller replies here.</p></div>{supportTickets.length === 0 ? <div className="rounded-3xl border border-dashed border-sky-200 bg-white p-10 text-center text-sm text-slate-500">No support tickets yet.</div> : supportTickets.map(ticket => <div key={ticket.id} className="bg-white rounded-2xl border border-sky-100 p-5"><div className="flex justify-between gap-3"><h4 className="font-extrabold text-[#032B42]">{ticket.subject}</h4><span className="text-[10px] font-bold text-[#0875B5]">{ticket.status.replace('_', ' ')}</span></div><p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{ticket.message}</p>{ticket.sellerReply && <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-sm"><strong className="text-emerald-800">Seller reply:</strong><p className="mt-1 whitespace-pre-wrap">{ticket.sellerReply}</p></div>}</div>)}</div>
      )}

      {/* TAB CONTENT: PROFILE */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl border border-sky-100 p-5 sm:p-8 shadow-xs max-w-xl space-y-4">
          <h3 className="font-bold text-sm text-[#032B42]">Account Information</h3>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Registered Name</span>
              <span className="font-bold text-[#032B42] text-sm">{user.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Email (Verified)</span>
              <span className="font-bold text-[#032B42] text-sm">{user.email}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Mobile Phone</span>
              <span className="font-bold text-[#032B42] text-sm">{user.phone}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Membership Tier</span>
              <span className="font-mono text-[#0875B5] font-semibold">Verified Customer</span>
            </div>
          </div>
        </div>
      )}


      {showAddressForm && (
        <div className="fixed inset-0 z-[125] bg-[#021E31]/55 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[#0875B5]">Delivery Address</p><h3 className="text-xl font-extrabold text-[#032B42]">{editingAddressId ? 'Edit Address' : 'Add Address'}</h3></div><button onClick={()=>setShowAddressForm(false)} className="p-2 rounded-xl bg-slate-100"><X className="w-4 h-4"/></button></div>
            <div className="grid sm:grid-cols-2 gap-3">
              {[['fullName','Full name'],['phone','Phone'],['addressLine','Address'],['area','Area'],['city','City'],['district','District'],['pincode','PIN code']].map(([key,label]) => <label key={key} className={key==='addressLine'?'sm:col-span-2':''}><span className="text-xs font-bold text-slate-600">{label}</span><input value={(addressDraft as any)[key]} maxLength={key==='pincode'?6:undefined} onChange={(e)=>setAddressDraft({...addressDraft,[key]:e.target.value})} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-sky-100 text-sm outline-none focus:ring-2 focus:ring-[#50D4EE]/30"/></label>)}
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-600"><input type="checkbox" checked={!!addressDraft.isDefault} onChange={(e)=>setAddressDraft({...addressDraft,isDefault:e.target.checked})}/> Make this my default address</label>
            <button onClick={saveAddress} className="premium-action-btn w-full py-3 rounded-xl bg-[#0875B5] text-white font-bold text-sm">Save Address</button>
          </div>
        </div>
      )}


      {reviewing && (
        <div className="fixed inset-0 z-[120] bg-[#021E31]/55 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-extrabold tracking-[0.18em] text-[#0875B5] uppercase">Verified Purchase Review</p>
                <h3 className="text-xl font-extrabold text-[#032B42] mt-1">{reviewing.item.productName}</h3>
                <p className="text-xs text-slate-500 mt-1">Your review is sent to the seller first and becomes public only after approval.</p>
              </div>
              <button onClick={() => setReviewing(null)} className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800" aria-label="Close review form"><X className="w-4 h-4" /></button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-2">Rating</label>
              <div className="flex gap-1.5">
                {[1,2,3,4,5].map((rating) => (
                  <button key={rating} onClick={() => setReviewRating(rating)} className="p-1" aria-label={`${rating} star rating`}>
                    <Star className={`w-7 h-7 ${rating <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-250'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                ['Product', productQualityRating, setProductQualityRating],
                ['Packing', packingRating, setPackingRating],
                ['Delivery', deliveryRating, setDeliveryRating],
              ].map(([label, value, setter]) => (
                <div key={String(label)} className="rounded-2xl bg-sky-50 border border-sky-100 p-3 text-center">
                  <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">{String(label)}</p>
                  <div className="mt-2 flex justify-center gap-0.5">
                    {[1,2,3,4,5].map((rating) => (
                      <button key={rating} onClick={() => (setter as React.Dispatch<React.SetStateAction<number>>)(rating)} className="p-0.5" aria-label={`${label} ${rating} star rating`}>
                        <Star className={`w-3.5 h-3.5 ${rating <= Number(value) ? 'fill-amber-400 text-amber-400' : 'text-slate-250'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1.5">Review title</label>
              <input value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} maxLength={80} placeholder="What stood out to you?" className="w-full rounded-xl border border-sky-100 px-3.5 py-3 text-sm outline-none focus:ring-2 focus:ring-[#50D4EE]/40" />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1.5">Your experience</label>
              <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} maxLength={600} rows={4} placeholder="Share your experience with this product and order." className="w-full rounded-xl border border-sky-100 px-3.5 py-3 text-sm outline-none focus:ring-2 focus:ring-[#50D4EE]/40 resize-none" />
            </div>

            <button onClick={handleSubmitReview} className="w-full min-h-[48px] rounded-xl bg-[#0875B5] hover:bg-[#064463] text-white font-bold text-sm transition-colors">Submit Review for Approval</button>
          </div>
        </div>
      )}

    </div>
  );
};
