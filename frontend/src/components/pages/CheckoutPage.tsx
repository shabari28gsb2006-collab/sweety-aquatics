import { buildWhatsAppUrl } from '../../config/siteConfig';
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { cartService } from '../../services/cartService';
import { authService } from '../../services/authService';
import { serviceabilityService } from '../../services/serviceabilityService';
import { paymentService, type BackendOrder, type CheckoutPreview, type UpiIntent } from '../../services/paymentService';
import { siteSettingsService } from '../../services/siteSettingsService';
import { toastService } from '../../services/toastService';
import { CartItem, User, Order } from '../../types';
import {
  ShieldCheck,
  Lock,
  Truck,
  AlertTriangle,
  Check,
  MessageCircle,
  ArrowRight,
  CreditCard,
  Building,
  MapPin,
  UploadCloud,
  FileImage,
  QrCode,
  Smartphone,
  XCircle,
  ExternalLink,
} from 'lucide-react';

interface CheckoutPageProps {
  onNavigate: (route: string) => void;
  onRequireAuth: (message: string) => void;
  onOrderCompleted: (order: Order) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onNavigate,
  onRequireAuth,
  onOrderCompleted,
}) => {
  const [user, setUser] = useState<User | null>(authService.getUser());
  const [items, setItems] = useState<CartItem[]>(cartService.getItems());

  // Form Fields
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [state] = useState('Tamil Nadu');
  const [pincode, setPincode] = useState('');

  // Serviceability State
  const [pincodeCheckResult, setPincodeCheckResult] = useState<{
    checked: boolean;
    isServiceable: boolean;
    district?: string;
    estimatedDelivery?: string;
    message?: string;
  }>({ checked: false, isServiceable: false });

  // Payment UI state
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [checkoutPreview, setCheckoutPreview] = useState<CheckoutPreview | null>(null);
  const [courierPackingCharge, setCourierPackingCharge] = useState(siteSettingsService.getSettings().courierPackingCharge);
  const [upiIntent, setUpiIntent] = useState<UpiIntent | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [showQr, setShowQr] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [proofImageData, setProofImageData] = useState('');
  const [proofFileName, setProofFileName] = useState('');

  useEffect(() => {
    const unsubAuth = authService.subscribe((u) => {
      setUser(u);
      if (u) {
        if (!fullName) setFullName(u.name);
        if (!phone) setPhone(u.phone);
        if (!email) setEmail(u.email);
      }
    });

    const unsubCart = cartService.subscribe(setItems);
    const unsubSettings = siteSettingsService.subscribe((settings) => setCourierPackingCharge(settings.courierPackingCharge));

    return () => {
      unsubAuth();
      unsubCart();
      unsubSettings();
    };
  }, []);

  // Real-time Pincode Validation
  useEffect(() => {
    let cancelled = false;
    if (pincode.length === 6 && /^\d+$/.test(pincode)) {
      setPincodeCheckResult({ checked: false, isServiceable: false, message: 'Checking delivery availability…' });
      void serviceabilityService.checkPincode(pincode).then((result) => {
        if (cancelled) return;
        setPincodeCheckResult({
          checked: true,
          isServiceable: result.isServiceable,
          district: result.pincodeData?.district,
          estimatedDelivery: result.estimatedDeliveryTime,
          message: result.message,
        });
        if (result.pincodeData?.district) setDistrict(result.pincodeData.district);
      });
    } else {
      setPincodeCheckResult({ checked: false, isServiceable: false });
    }
    return () => { cancelled = true; };
  }, [pincode]);

  useEffect(() => {
    let cancelled = false;
    const mobileDigits = phone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
    if (!user || !pincodeCheckResult.isServiceable || !fullName.trim() || !addressLine.trim() || !city.trim() || !district.trim() || !/^[6-9]\d{9}$/.test(mobileDigits)) {
      setCheckoutPreview(null);
      return;
    }
    const timer = window.setTimeout(() => {
      void paymentService.previewCheckout(selectedAddressId ? { addressId: selectedAddressId } : { address: { fullName: fullName.trim(), mobile: `+91${mobileDigits}`, line1: addressLine.trim(), area: area.trim() || null, city: city.trim(), district: district.trim(), state: 'Tamil Nadu', pincode } })
        .then((preview) => { if (!cancelled) setCheckoutPreview(preview); })
        .catch(() => { if (!cancelled) setCheckoutPreview(null); });
    }, 300);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [user, fullName, phone, addressLine, area, city, district, pincode, selectedAddressId, pincodeCheckResult.isServiceable, items]);

  // Auth gate
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-sky-50 text-[#0875B5] mx-auto flex items-center justify-center">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#032B42]">Authentication Required</h2>
        <p className="text-xs text-slate-500">
          Only verified customers can complete checkouts. Please sign in or register with your email.
        </p>
        <button
          onClick={() => onRequireAuth('Please sign in or create an account to proceed to checkout.')}
          className="bg-[#0875B5] text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  // Empty cart gate
  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#032B42]">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500">Add products to your cart before proceeding to checkout.</p>
        <button
          onClick={() => onNavigate('/shop')}
          className="bg-[#0875B5] text-white text-xs font-bold px-6 py-3 rounded-xl"
        >
          Browse Shop
        </button>
      </div>
    );
  }

  const localSubtotal = cartService.getSubtotal();
  const localShippingFee = localSubtotal >= 999 ? 0 : courierPackingCharge;
  const subtotal = checkoutPreview?.subtotal ?? localSubtotal;
  const shippingFee = checkoutPreview?.shippingCharge ?? localShippingFee;
  const total = checkoutPreview?.total ?? Number((localSubtotal + localShippingFee).toFixed(2));

  const mapBackendOrder = (backendOrder: BackendOrder): Order => ({
    id: backendOrder.id,
    orderNumber: backendOrder.orderNumber,
    userId: backendOrder.userId,
    customerName: fullName,
    customerEmail: email,
    customerPhone: phone,
    items: backendOrder.items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      productImage: item.imageUrl || '',
      category:
        item.category === 'GUPPY'
          ? 'guppies'
          : item.category === 'FISH_FOOD'
            ? 'fish-food'
            : item.category === 'COMBO_PACK'
              ? 'combo-packs'
              : 'wholesale',
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.lineTotal),
    })),
    subtotal: Number(backendOrder.subtotal),
    shippingFee: Number(backendOrder.shippingCharge),
    totalAmount: Number(backendOrder.total),
    deliveryAddress: {
      id: selectedAddressId || `checkout-${backendOrder.id}`,
      fullName,
      phone,
      addressLine,
      area,
      city,
      district,
      state: 'Tamil Nadu',
      pincode,
      isDefault: false,
    },
    paymentMethod: 'UPI',
    paymentStatus: backendOrder.paymentStatus === 'PAID' ? 'PAID' : 'PENDING',
    paymentId: backendOrder.payment?.utrNumber || undefined,
    orderStatus: backendOrder.status === 'ORDER_CONFIRMED' ? 'PAYMENT_CONFIRMED' : 'ORDER_PLACED',
    createdAt: backendOrder.createdAt,
    shipment: backendOrder.shipment
      ? {
          id: `shipment-${backendOrder.id}`,
          courierName: backendOrder.shipment.courierName || '',
          awbNumber: backendOrder.shipment.trackingNumber || '',
          trackingUrl: backendOrder.shipment.trackingUrl || '',
          estimatedDelivery: backendOrder.shipment.estimatedDeliveryTo || undefined,
          currentStatus: 'PAYMENT_CONFIRMED',
          trackingEvents: [],
        }
      : undefined,
  });

  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessingPayment) return;

    if (state !== 'Tamil Nadu') {
      toastService.error('Delivery Unavailable', 'Orders are currently accepted only for delivery addresses within Tamil Nadu.');
      return;
    }
    if (!pincodeCheckResult.checked || !pincodeCheckResult.isServiceable) {
      toastService.warning('Invalid or Unserviceable PIN code', 'Please enter a serviceable 6-digit Tamil Nadu PIN code.');
      return;
    }
    const mobileDigits = phone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
    if (!/^[6-9]\d{9}$/.test(mobileDigits)) {
      toastService.error('Invalid Mobile Number', 'Enter a valid 10-digit Indian mobile number beginning with 6, 7, 8 or 9.');
      return;
    }

    setIsProcessingPayment(true);
    try {
      const result = await paymentService.createIntent({
        ...(selectedAddressId ? { addressId: selectedAddressId } : { address: {
          fullName,
          mobile: `+91${mobileDigits}`,
          line1: addressLine,
          area,
          city,
          district,
          state: 'Tamil Nadu',
          pincode,
        } }),
      });
      setUpiIntent(result);
      setShowQr(false);
      setQrDataUrl('');
      setUtrNumber('');
      setProofImageData('');
      setProofFileName('');
      toastService.info('Payment reference created', `Use ${result.orderNumber} in the UPI payment note.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Payment could not be completed.';
      if (/cancelled/i.test(message)) toastService.info('Payment Cancelled', message);
      else toastService.error('Payment Not Completed', message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const submitManualPayment = async () => {
    if (!upiIntent || !/^[A-Za-z0-9]{6,30}$/.test(utrNumber.replace(/\s/g, ''))) { toastService.warning('Transaction ID required', 'Enter the valid Transaction ID shown in your UPI app.'); return; }
    setIsProcessingPayment(true);
    try { const backendOrder=await paymentService.submit({attemptId:upiIntent.id,utrNumber,proofImageData:proofImageData||undefined});const order=mapBackendOrder(backendOrder);toastService.success('Sent for verification', `${order.orderNumber} is awaiting seller verification.`);setUpiIntent(null);onOrderCompleted(order); }
    catch(error){toastService.error('Submission failed',error instanceof Error?error.message:'Please retry.');}
    finally{setIsProcessingPayment(false);}
  };

  const showPaymentQr = async () => {
    if (!upiIntent) return;
    setShowQr(true);
    if (!qrDataUrl) setQrDataUrl(await QRCode.toDataURL(upiIntent.upiUri, { width: 360, margin: 2, errorCorrectionLevel: 'M' }));
  };

  const applySavedAddress = (addressId: string) => {
    const address = user?.addresses?.find((item) => item.id === addressId);
    if (!address) return;
    setFullName(address.fullName);
    setPhone(address.phone);
    setAddressLine(address.addressLine);
    setArea(address.area);
    setCity(address.city);
    setDistrict(address.district);
    setPincode(address.pincode);
    setSelectedAddressId(address.id);
    toastService.info('Saved Address Applied', `${address.city} • ${address.pincode}`);
  };

  const useDifferentAddress = () => {
    setSelectedAddressId(''); setAddressLine(''); setArea(''); setCity(''); setDistrict(''); setPincode('');
    setPincodeCheckResult({ checked: false, isServiceable: false });
    toastService.info('Different address enabled', 'Enter the delivery address you want to use for this order.');
  };

  const upiAppLinks = upiIntent ? (() => {
    const query = upiIntent.upiUri.split('?')[1] || '';
    return [
      { name: 'Google Pay', short: 'G', color: 'bg-white text-blue-600 border-blue-100', href: `tez://upi/pay?${query}` },
      { name: 'PhonePe', short: 'Pe', color: 'bg-violet-50 text-violet-700 border-violet-100', href: `phonepe://pay?${query}` },
      { name: 'Paytm', short: 'P', color: 'bg-sky-50 text-sky-600 border-sky-100', href: `paytmmp://pay?${query}` },
      { name: 'Any UPI App', short: 'UPI', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', href: upiIntent.upiUri },
    ];
  })() : [];

  const tamilNaduDistricts = [
    'Chennai',
    'Coimbatore',
    'Madurai',
    'Tiruchirappalli',
    'Salem',
    'Tirunelveli',
    'Erode',
    'Vellore',
    'Thoothukudi',
    'Dindigul',
    'Thanjavur',
    'Kanchipuram',
    'Chengalpattu',
    'Tiruvallur',
    'Cuddalore',
    'Villupuram',
    'Tiruppur',
    'Karur',
    'Namakkal',
    'Dharmapuri',
    'Krishnagiri',
    'Nagapattinam',
    'Tiruvarur',
    'Pudukkottai',
    'Sivaganga',
    'Ramanathapuram',
    'Virudhunagar',
    'Theni',
    'Nilgiris',
    'Kanyakumari',
  ];

  return (
    <div id="checkout-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-12 pb-24 sm:pb-12">
      <div className="max-w-3xl mb-6 sm:mb-8">
        <span className="text-xs font-bold text-[#0875B5] uppercase tracking-wider">
          Direct Tamil Nadu Delivery
        </span>
        <h1 className="text-xl sm:text-3xl font-extrabold text-[#032B42] font-['Manrope',sans-serif] mt-1">
          Complete Your Order
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Delivery is available only to verified, serviceable Tamil Nadu PIN codes. Courier details are confirmed during fulfillment.
        </p>
      </div>

      <form onSubmit={handleInitiatePayment} className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Left 2 Cols: Shipping Details */}
        <div className="lg:col-span-2 space-y-5 sm:space-y-6">
          {/* Section: Customer Contact */}
          <div className="bg-white rounded-3xl border border-sky-100 p-4 sm:p-6 shadow-xs space-y-4">
            <h2 className="font-bold text-xs sm:text-sm text-[#032B42] uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-[#0875B5]" />
              1. Customer Contact &amp; Account
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => { setFullName(e.target.value); setSelectedAddressId(''); }}
                  className="w-full text-xs p-3 bg-[#F8FDFF] border border-sky-200 rounded-xl focus:outline-none focus:border-[#0875B5] min-h-[44px]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number (WhatsApp preferred)</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setSelectedAddressId(''); }}
                  placeholder="9876543210"
                  className="w-full text-xs p-3 bg-[#F8FDFF] border border-sky-200 rounded-xl focus:outline-none focus:border-[#0875B5] min-h-[44px]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs p-3 bg-[#F8FDFF] border border-sky-200 rounded-xl focus:outline-none focus:border-[#0875B5] min-h-[44px]"
                />
              </div>
            </div>
          </div>

          {/* Section: Delivery Address (Strictly Tamil Nadu) */}
          <div className="bg-white rounded-3xl border border-sky-100 p-4 sm:p-6 shadow-xs space-y-4">
            <h2 className="font-bold text-xs sm:text-sm text-[#032B42] uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#0875B5]" />
              2. Delivery Address (Tamil Nadu Only)
            </h2>

            {user.addresses?.length > 0 && (
              <div className="rounded-2xl bg-sky-50/70 border border-sky-100 p-3">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#0875B5] mb-2">Use a saved address</p>
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {user.addresses.map((address) => (
                    <div key={address.id} className={`shrink-0 text-left p-3 rounded-xl bg-white border min-w-[210px] transition-all ${selectedAddressId === address.id ? 'border-[#0875B5] ring-2 ring-sky-100 shadow-sm' : 'border-sky-100'}`}>
                      <span className="block text-xs font-bold text-[#032B42]">{address.city}</span>
                      <span className="block text-[10px] text-slate-500">{address.area} • {address.pincode}</span>
                      {address.isDefault && <span className="text-[9px] font-bold text-emerald-600">Default</span>}
                      {selectedAddressId === address.id && <span className="block text-[10px] font-bold text-[#0875B5] mt-1">Selected for this order</span>}
                      <div className="mt-3 flex items-center gap-2">
                        <button type="button" onClick={() => applySavedAddress(address.id)} className="min-h-[36px] flex-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold inline-flex items-center justify-center gap-1.5 active:scale-95"><Check className="w-3.5 h-3.5" />Use this address</button>
                        <button type="button" onClick={useDifferentAddress} aria-label={`Do not use saved address in ${address.city}`} title="Cancel saved address" className="w-9 h-9 shrink-0 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 inline-flex items-center justify-center active:scale-95"><XCircle className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3.5 sm:space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">House / Flat / Door No. &amp; Street</label>
                <input
                  type="text"
                  required
                  value={addressLine}
                  onChange={(e) => { setAddressLine(e.target.value); setSelectedAddressId(''); }}
                  placeholder="e.g., No. 14, 2nd Cross Street, Lake View Garden"
                  className="w-full text-xs p-3 bg-[#F8FDFF] border border-sky-200 rounded-xl focus:outline-none focus:border-[#0875B5] min-h-[44px]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Area / Landmark</label>
                <input
                  type="text"
                  required
                  value={area}
                  onChange={(e) => { setArea(e.target.value); setSelectedAddressId(''); }}
                  placeholder="e.g., Near Bus Stand, Anna Nagar"
                  className="w-full text-xs p-3 bg-[#F8FDFF] border border-sky-200 rounded-xl focus:outline-none focus:border-[#0875B5] min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">City / Town</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => { setCity(e.target.value); setSelectedAddressId(''); }}
                    placeholder="e.g., Chennai"
                    className="w-full text-xs p-3 bg-[#F8FDFF] border border-sky-200 rounded-xl focus:outline-none focus:border-[#0875B5] min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">District</label>
                  <select
                    value={district}
                    onChange={(e) => { setDistrict(e.target.value); setSelectedAddressId(''); }}
                    className="w-full text-xs p-3 bg-[#F8FDFF] border border-sky-200 rounded-xl focus:outline-none focus:border-[#0875B5] min-h-[44px]"
                  >
                    {tamilNaduDistricts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">State</label>
                  <input
                    type="text"
                    disabled
                    value={state}
                    className="w-full text-xs p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-semibold cursor-not-allowed min-h-[44px]"
                  />
                  <span className="text-[10px] text-[#0875B5] mt-0.5 block">
                    Exclusive carrier delivery inside Tamil Nadu
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">6-Digit PIN Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => { setPincode(e.target.value.replace(/\D/g, '')); setSelectedAddressId(''); }}
                    placeholder="600001"
                    className="w-full text-xs p-3 bg-[#F8FDFF] border border-sky-200 rounded-xl font-mono focus:outline-none focus:border-[#0875B5] min-h-[44px]"
                  />
                </div>
              </div>

              {/* Real-time Serviceability Status */}
              {pincodeCheckResult.checked && (
                <div
                  className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                    pincodeCheckResult.isServiceable
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  {pincodeCheckResult.isServiceable ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Serviceable for {pincodeCheckResult.district}, Tamil Nadu</p>
                        <p className="text-[11px] text-emerald-700 mt-0.5">
                          Estimated delivery: {pincodeCheckResult.estimatedDelivery}. Courier is selected from seller-managed serviceability data.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Delivery is currently unavailable for PIN {pincode}</p>
                        <p className="text-[11px] text-rose-700 mt-0.5">
                          This PIN code is not currently enabled for checkout. Contact us on WhatsApp for delivery enquiries.
                        </p>
                        <a
                          href={buildWhatsAppUrl(
                            `Hello Sweety Birds & Fishes, I need delivery to Tamil Nadu PIN ${pincode} which is currently unserviceable.`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-[#25D366] font-bold mt-1.5 underline"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Enquire on WhatsApp
                        </a>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Summary & Manual UPI Trigger */}
        <div className="bg-white rounded-3xl border border-sky-100 p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-5 lg:sticky lg:top-24">
          <h2 className="font-bold text-xs sm:text-sm text-[#032B42] uppercase tracking-wider">
            Order Review ({items.length} items)
          </h2>

          <div className="max-h-48 overflow-y-auto space-y-2.5 divide-y divide-sky-50 pr-1">
            {items.map((it) => (
              <div key={it.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate pr-2">
                  <img src={it.product.thumbnail} alt="" className="w-8 h-8 rounded-lg object-cover" />
                  <span className="truncate text-slate-700 font-medium">
                    {it.quantity}x {it.product.name}
                  </span>
                </div>
                <span className="font-bold text-slate-800 font-mono shrink-0">₹{it.product.price * it.quantity}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-sky-100">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-slate-800 font-mono">₹{subtotal}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Courier + Packing</span>
              <span className="font-bold text-slate-800 font-mono">
                {shippingFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${shippingFee}`}
              </span>
            </div>
            <div className="pt-2 border-t border-sky-100 flex justify-between text-base font-extrabold text-[#032B42]">
              <span>Amount Payable</span>
              <span className="font-mono">₹{total}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!pincodeCheckResult.isServiceable || isProcessingPayment}
            className={`w-full py-3.5 rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 min-h-[48px] ${
              pincodeCheckResult.isServiceable
                ? 'bg-[#0875B5] hover:bg-[#064463] text-white active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            {isProcessingPayment ? 'Preparing Payment…' : `Pay ₹${total} via UPI`}
          </button>

          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
            <Lock className="w-3.5 h-3.5" />
            <span>Seller verifies every UPI payment manually</span>
          </div>
        </div>
      </form>

      {upiIntent && <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm sm:p-4 overflow-y-auto flex items-end sm:items-center justify-center">
        <div className="bg-white w-full max-w-xl rounded-t-[2rem] sm:rounded-3xl p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-7 space-y-4 sm:space-y-5 shadow-2xl max-h-[94dvh] overflow-y-auto sm:my-8">
          <div><p className="text-xs font-extrabold text-[#0875B5] uppercase tracking-wider">Manual UPI Payment</p><h2 className="text-2xl font-extrabold text-[#032B42] mt-1">Pay ₹{Number(upiIntent.total).toFixed(2)}</h2><p className="text-sm text-slate-600 mt-2 leading-relaxed">Order reference: <strong className="break-all">{upiIntent.orderNumber}</strong>. It is already included in the UPI transaction note.</p></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a href={upiIntent.upiUri} onClick={()=>setShowQr(false)} className={`premium-action-btn rounded-2xl font-extrabold p-4 text-center flex items-center justify-center gap-2 ${!showQr?'bg-[#0875B5] text-white shadow-md':'border border-sky-200 bg-white text-[#0875B5]'}`}><Smartphone className="w-5 h-5"/>Open UPI App</a>
            <button type="button" onClick={()=>void showPaymentQr()} className={`rounded-2xl font-extrabold p-4 flex items-center justify-center gap-2 ${showQr?'bg-[#0875B5] text-white shadow-md':'border border-sky-200 bg-sky-50 text-[#0875B5]'}`}><QrCode className="w-5 h-5"/>Scan QR Code</button>
          </div>
          <div className="rounded-3xl border border-sky-100 bg-gradient-to-br from-[#F7FCFF] to-cyan-50 p-3.5 sm:p-4"><div className="flex items-center justify-between gap-3 mb-3"><div><p className="font-extrabold text-sm text-[#032B42]">Choose your UPI app</p><p className="text-[11px] text-slate-500">Apps are shown on mobile and desktop. Desktop users can scan the QR if an app cannot open.</p></div><ExternalLink className="w-4 h-4 text-[#0875B5] shrink-0" /></div><div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{upiAppLinks.map(app=><a key={app.name} href={app.href} className={`min-h-[72px] rounded-2xl border p-2 flex flex-col items-center justify-center text-center gap-1.5 font-extrabold text-[11px] active:scale-95 transition-transform ${app.color}`}><span className="w-8 h-8 rounded-xl bg-white shadow-sm grid place-items-center text-xs">{app.short}</span>{app.name}</a>)}</div></div>
          {showQr && <div className="text-center rounded-3xl bg-sky-50/70 border border-sky-100 p-4 sm:p-5">{qrDataUrl?<><img src={qrDataUrl} alt={`UPI QR for ${upiIntent.orderNumber}`} className="w-52 h-52 sm:w-60 sm:h-60 mx-auto bg-white p-2 border border-sky-200 rounded-2xl"/><p className="text-sm font-bold text-[#032B42] mt-3">Scan with any UPI app</p><p className="text-xs text-slate-500 mt-1 break-all">UPI ID: {upiIntent.upiId}</p></>:<div className="h-52 flex items-center justify-center text-slate-500"><QrCode className="w-6 h-6 animate-pulse mr-2"/>Generating QR code…</div>}</div>}
          <div className="border-t border-sky-100 pt-5 space-y-4"><div><h3 className="font-extrabold text-lg text-[#032B42]">I have completed the payment</h3><p className="text-xs text-slate-500 mt-1">Copy the Transaction ID from your UPI app after payment.</p></div><div><label className="text-sm font-bold text-slate-700 block mb-2">Transaction ID <span className="text-rose-500">*</span></label><input value={utrNumber} onChange={e=>setUtrNumber(e.target.value.replace(/\s/g,''))} maxLength={30} placeholder="Enter UPI Transaction ID" className="w-full p-4 rounded-xl border border-sky-200 outline-none focus:border-[#0875B5] focus:ring-4 focus:ring-sky-50 font-mono"/></div>
            <label className="block cursor-pointer"><span className="text-sm font-bold text-slate-700 block mb-2">Payment screenshot <span className="font-normal text-slate-400">(optional)</span></span><div className={`rounded-2xl border-2 border-dashed p-4 transition-all ${proofImageData?'border-emerald-300 bg-emerald-50':'border-sky-200 bg-sky-50/60 hover:border-[#0875B5]'}`}><div className="flex items-center gap-3"><div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${proofImageData?'bg-emerald-100 text-emerald-700':'bg-white text-[#0875B5]'}`}>{proofImageData?<FileImage className="w-5 h-5"/>:<UploadCloud className="w-5 h-5"/>}</div><div className="min-w-0"><p className="font-bold text-sm text-[#032B42] truncate">{proofFileName||'Upload payment screenshot'}</p><p className="text-xs text-slate-500 mt-0.5">JPG, PNG or WebP • Maximum 2 MB</p></div><span className="ml-auto text-xs font-bold text-[#0875B5] bg-white rounded-lg px-3 py-2">{proofImageData?'Change':'Choose'}</span></div></div><input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={e=>{const file=e.target.files?.[0];if(!file)return;if(file.size>2*1024*1024){toastService.error('File too large','Choose an image below 2 MB.');e.target.value='';return;}setProofFileName(file.name);const reader=new FileReader();reader.onload=()=>setProofImageData(String(reader.result||''));reader.readAsDataURL(file);}}/></label>
            <button type="button" disabled={isProcessingPayment||utrNumber.replace(/\s/g,'').length<6} onClick={()=>void submitManualPayment()} className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold p-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all">{isProcessingPayment?'Submitting securely…':'Submit for Seller Verification'}</button>
            <a onClick={event=>{if(utrNumber.replace(/\s/g,'').length<6){event.preventDefault();toastService.warning('Transaction ID required','Enter the Transaction ID before notifying the seller.');}}} target="_blank" rel="noopener noreferrer" href={buildWhatsAppUrl(`Hello Sweety Birds & Fishes, I completed a UPI payment.\n\nOrder ID: ${upiIntent.orderNumber}\nAmount: ₹${Number(upiIntent.total).toFixed(2)}\nTransaction ID: ${utrNumber||'[enter Transaction ID]'}\n\nSeller review page: ${window.location.origin}/admin\nPlease sign in and verify this payment.`)} className="w-full rounded-2xl border border-emerald-200 text-emerald-700 font-bold p-3.5 flex items-center justify-center gap-2 text-center"><MessageCircle className="w-4 h-4 shrink-0"/>Notify Seller on WhatsApp (optional)</a>
            <button type="button" onClick={()=>{void paymentService.cancel(upiIntent.id);setUpiIntent(null);setShowQr(false);}} className="w-full text-sm text-slate-500 hover:text-rose-600 py-1">Cancel payment attempt</button>
          </div>
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 p-3.5 rounded-xl leading-relaxed">Submitting a Transaction ID never marks payment successful automatically. The order remains Payment Verification Pending until the seller confirms it.</p>
        </div>
      </div>}

    </div>
  );
};
