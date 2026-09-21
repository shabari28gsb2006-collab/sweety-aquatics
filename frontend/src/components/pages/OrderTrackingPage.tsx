import { buildWhatsAppUrl } from '../../config/siteConfig';
import React, { useEffect, useState } from 'react';
import { Order } from '../../types';
import { orderService } from '../../services/orderService';
import { reviewService } from '../../services/reviewService';
import { authService } from '../../services/authService';
import { toastService } from '../../services/toastService';
import { useLanguage } from '../../i18n/LanguageContext';
import { Check, ChevronLeft, Clock3, ExternalLink, MessageCircle, Package, PackageCheck, Truck, CircleCheckBig, Copy, CheckCheck, Star } from 'lucide-react';

interface Props { orderId: string; onNavigate: (route: string) => void; }

function readable(value?: string) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export const OrderTrackingPage: React.FC<Props> = ({ orderId, onNavigate }) => {
  const { t } = useLanguage();
  const [order, setOrder] = useState<Order | undefined>(() => orderService.getOrderById(orderId));
  const [copied, setCopied] = useState(false);
  const [reviewingProduct, setReviewingProduct] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [, setReviewVersion] = useState(0);
  useEffect(() => {
    const unsub = orderService.subscribe(() => setOrder(orderService.getOrderById(orderId)));
    void orderService.refreshOrder(orderId).catch(() => undefined);
    const unsubReviews = reviewService.subscribe(() => setReviewVersion(value => value + 1));
    void reviewService.refreshMine().catch(() => undefined);
    return () => { unsub(); unsubReviews(); };
  }, [orderId]);

  if (!order) return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4 relative z-10">
      <Package className="w-12 h-12 text-[#0875B5] mx-auto" />
      <h1 className="text-2xl font-extrabold text-[#032B42]">Order Not Found</h1>
      <button onClick={() => onNavigate('/account?tab=orders')} className="px-5 py-3 rounded-xl bg-[#0875B5] text-white font-bold">Back to My Orders</button>
    </div>
  );

  const packedStageReached = !!order.packingScheduledAt || ['PROCESSING','PACKED','SHIPPED','IN_TRANSIT','OUT_FOR_DELIVERY','DELIVERED'].includes(order.orderStatus);
  const shippedStageReached = !!order.dispatchedAt || ['SHIPPED','IN_TRANSIT','OUT_FOR_DELIVERY','DELIVERED'].includes(order.orderStatus);
  const trackingStageReached = !!order.shipment?.awbNumber;
  const received = order.orderStatus === 'DELIVERED' || !!order.receivedAt;
  const paymentConfirmed = order.paymentStatus === 'PAID';

  const steps = [
    {
      key: 'confirmed',
      label: paymentConfirmed ? t('Order Confirmed', 'ஆர்டர் உறுதிசெய்யப்பட்டது') : t('Payment Verification', 'பணம் சரிபார்ப்பு'),
      complete: paymentConfirmed,
      icon: Check,
      detail: paymentConfirmed ? t(`Payment verified • ${readable(order.createdAt)}`, `பணம் சரிபார்க்கப்பட்டது • ${readable(order.createdAt)}`) : t('Seller is verifying your Transaction ID. The order is not confirmed yet.', 'உங்கள் பரிவர்த்தனை எண் சரிபார்க்கப்படுகிறது.'),
    },
    {
      key: 'packing',
      label: t('Packing Scheduled', 'பேக்கிங் திட்டமிடப்பட்டது'),
      complete: packedStageReached,
      icon: PackageCheck,
      detail: order.packingScheduledAt
        ? t(`Packing on ${readable(order.packingScheduledAt)}`, `${readable(order.packingScheduledAt)} அன்று பேக்கிங் செய்ய திட்டமிடப்பட்டுள்ளது`)
        : t('Seller will update the packing date and time.', 'பேக்கிங் தேதி மற்றும் நேரத்தை விற்பனையாளர் புதுப்பிப்பார்.'),
    },
    {
      key: 'shipped',
      label: t('Shipped / Dispatched', 'அனுப்பப்பட்டது'),
      complete: shippedStageReached,
      icon: Truck,
      detail: shippedStageReached ? t(`Dispatched ${readable(order.dispatchedAt || order.shipment?.shippedDate)}`, `${readable(order.dispatchedAt || order.shipment?.shippedDate)} அன்று அனுப்பப்பட்டது`) : t('Waiting for seller dispatch.', 'விற்பனையாளர் அனுப்பும் வரை காத்திருக்கிறது.'),
    },
    {
      key: 'tracking',
      label: t('Tracking Code Added', 'கண்காணிப்பு எண் சேர்க்கப்பட்டது'),
      complete: trackingStageReached,
      icon: Package,
      detail: trackingStageReached
        ? t(`AWB / Tracking: ${order.shipment?.awbNumber}`, `AWB / கண்காணிப்பு எண்: ${order.shipment?.awbNumber}`)
        : t('Courier tracking code will appear here after the seller adds it.', 'விற்பனையாளர் சேர்த்த பிறகு கூரியர் கண்காணிப்பு எண் இங்கே தோன்றும்.'),
    },
    {
      key: 'received',
      label: t('Order Received', 'ஆர்டர் பெறப்பட்டது'),
      complete: received,
      icon: CircleCheckBig,
      detail: received ? t(`Received ${readable(order.receivedAt)}${order.receivedConfirmedBy ? ` • confirmed by ${order.receivedConfirmedBy.toLowerCase()}` : ''}`, `${readable(order.receivedAt)} அன்று பெறப்பட்டது`) : t('Confirm after the parcel reaches you.', 'பார்சல் கிடைத்த பிறகு உறுதிப்படுத்துங்கள்.'),
    },
  ];


  const copyTrackingCode = async () => {
    const code = order?.shipment?.awbNumber;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toastService.success('Tracking code copied', code);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toastService.warning('Copy unavailable', 'Select and copy the tracking code manually.');
    }
  };
  const confirmReceived = async () => {
    if (!shippedStageReached || received) return;
    if (window.confirm('Confirm that you have received this order?')) {
      try {
        await orderService.confirmReceived(order.id, 'CUSTOMER');
        toastService.success('Order received', 'Thank you. You can now rate and review the delivered products.');
      } catch (error) { toastService.error('Unable to confirm receipt', error instanceof Error ? error.message : 'Please try again.'); }
    }
  };
  const submitReview = async (productId: string, productName: string) => {
    const user = authService.getUser();
    if (!user || reviewComment.trim().length < 3) return toastService.warning('Add your experience', 'Write a short review before submitting.');
    setSubmittingReview(true);
    try {
      await reviewService.submitReview({ userId: user.id, orderId: order.id, productId, rating, title: `My experience with ${productName}`, comment: reviewComment.trim() });
      setReviewingProduct(null); setReviewComment(''); setRating(5);
      toastService.success('Thank you for your rating', 'Your review was sent to the seller.');
    } catch (error) { toastService.error('Review not submitted', error instanceof Error ? error.message : 'Please try again.'); }
    finally { setSubmittingReview(false); }
  };

  return (
    <div id="order-tracking-page" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-20 space-y-6 relative z-10">
      <button onClick={() => onNavigate('/account?tab=orders')} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0875B5]"><ChevronLeft className="w-4 h-4" /> {t('Back to My Orders', 'என் ஆர்டர்களுக்கு திரும்பவும்')}</button>

      <section className="relative overflow-hidden bg-[#021E31] text-white rounded-[2rem] p-6 sm:p-8 lg:p-10 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(80,212,238,.22),transparent_35%)]" />
        <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-between">
          <div><span className="text-xs font-extrabold uppercase tracking-[.18em] text-[#50D4EE]">{t('Order Tracking', 'ஆர்டர் கண்காணிப்பு')}</span><h1 className="text-3xl lg:text-4xl font-extrabold mt-1">{order.orderNumber}</h1><p className="text-sm text-sky-100/75 mt-2">{t('Placed', 'ஆர்டர் செய்தது')}: {readable(order.createdAt)}</p></div>
          <div className="md:text-right">
            <span className="text-xs text-sky-100/60 uppercase font-bold">Courier</span>
            <p className="text-base font-extrabold mt-1">{order.shipment?.courierName || t('Not assigned yet', 'இன்னும் ஒதுக்கப்படவில்லை')}</p>
            {order.shipment?.awbNumber && <p className="text-sm font-mono text-[#80E8FF] mt-1">AWB: {order.shipment.awbNumber}</p>}
          </div>
        </div>
      </section>

      <section className="bg-white rounded-[2rem] border border-sky-100 shadow-sm p-5 sm:p-8 lg:p-10">
        <div className="flex items-center gap-2 mb-8"><Clock3 className="w-5 h-5 text-[#0875B5]" /><h2 className="font-extrabold text-lg text-[#032B42]">{t('Order journey', 'ஆர்டர் பயணம்')}</h2></div>
        <div className="grid md:grid-cols-5 gap-0 relative">
          <div className="hidden md:block absolute top-6 left-[9%] right-[9%] h-1 bg-sky-50" />
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return <div key={step.key} className="relative flex md:flex-col gap-4 md:gap-3 md:items-center md:text-center pb-7 md:pb-0">
              <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 ${step.complete ? 'bg-emerald-500 border-emerald-50 text-white shadow-md' : 'bg-slate-100 border-white text-slate-400'}`}>{step.complete ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}</div>
              {idx < steps.length - 1 && <div className="md:hidden absolute left-[23px] top-12 bottom-0 w-0.5 bg-sky-100" />}
              <div><h3 className={`text-sm lg:text-base font-extrabold ${step.complete ? 'text-[#032B42]' : 'text-slate-400'}`}>{step.label}</h3><p className="text-xs lg:text-sm text-slate-500 leading-relaxed mt-1 md:max-w-[190px]">{step.detail}</p></div>
            </div>;
          })}
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-5">
        <section className="lg:col-span-2 bg-white rounded-3xl border border-sky-100 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-[#032B42]">{t('Courier & tracking details', 'கூரியர் மற்றும் கண்காணிப்பு விவரங்கள்')}</h2>
          {!shippedStageReached ? <p className="text-sm text-slate-500">{t('Tracking details will appear after the seller dispatches the order.', 'விற்பனையாளர் ஆர்டரை அனுப்பிய பிறகு கண்காணிப்பு விவரங்கள் இங்கே தோன்றும்.')}</p> : <>
            <div className="grid sm:grid-cols-2 gap-3 text-sm"><div className="p-4 bg-sky-50 rounded-2xl"><span className="text-xs text-slate-400 font-bold uppercase">Courier</span><p className="font-extrabold text-[#032B42] mt-1">{order.shipment?.courierName || '—'}</p></div><div className="p-4 bg-sky-50 rounded-2xl"><span className="text-xs text-slate-400 font-bold uppercase">Tracking / AWB</span><div className="mt-1 flex items-center justify-between gap-3"><p className="font-mono font-extrabold text-[#0875B5] break-all">{order.shipment?.awbNumber || 'Awaiting code'}</p>{order.shipment?.awbNumber && <button onClick={copyTrackingCode} className="premium-action-btn shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-sky-200 text-[#0875B5] text-xs font-extrabold" aria-label="Copy tracking code">{copied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? 'Copied' : 'Copy'}</button>}</div></div></div>
            {order.shipment?.trackingUrl && <a href={order.shipment.trackingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-[#0875B5] text-white text-sm font-extrabold">{t('Track with Courier', 'கூரியரில் கண்காணிக்கவும்')} <ExternalLink className="w-4 h-4" /></a>}
          </>}
        </section>

        <aside className="bg-[#F8FDFF] rounded-3xl border border-sky-100 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-[#032B42]">{t('Need Assistance?', 'உதவி வேண்டுமா?')}</h2>
          <a href={buildWhatsAppUrl(`Hello Sweety Birds & Fishes, I need an update for order ${order.orderNumber}.`)} target="_blank" rel="noreferrer" className="w-full bg-[#25D366] text-white text-sm font-extrabold py-3.5 rounded-xl flex justify-center items-center gap-2"><MessageCircle className="w-4 h-4" /> WhatsApp</a>
          {shippedStageReached && !received && <button onClick={confirmReceived} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold py-3.5 rounded-xl">{t('I Received My Order', 'என் ஆர்டர் கிடைத்துவிட்டது')}</button>}
          {received && <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-sm font-bold">✓ {t('Receipt confirmed. Reviews are now available in My Orders.', 'பெற்றது உறுதிசெய்யப்பட்டது. இப்போது என் ஆர்டர்கள் பகுதியில் மதிப்புரை வழங்கலாம்.')}</div>}
        </aside>
      </div>

      {received && <section className="bg-white rounded-3xl border border-amber-100 p-5 sm:p-7 shadow-sm space-y-4"><div><h2 className="text-lg font-extrabold text-[#032B42] flex items-center gap-2"><Star className="w-5 h-5 text-amber-500 fill-amber-400"/>Rate your order</h2><p className="text-sm text-slate-500 mt-1">Share your experience for the products you received.</p></div>{order.items.map(item => { const existing = reviewService.getReviewForOrderProduct(order.id, item.productId); if (existing) return null; const open = reviewingProduct === item.productId; return <div key={item.productId} className="rounded-2xl border border-sky-100 bg-[#F8FDFF] p-4"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div className="flex items-center gap-3"><img src={item.productImage} alt="" className="w-12 h-12 rounded-xl object-cover"/><strong className="text-sm text-[#032B42]">{item.productName}</strong></div><button onClick={()=>setReviewingProduct(open?null:item.productId)} className="px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-extrabold">Rate &amp; Review</button></div>{open&&<div className="mt-4 space-y-3"><div className="flex gap-1" aria-label="Choose rating">{[1,2,3,4,5].map(value=><button key={value} onClick={()=>setRating(value)} aria-label={`${value} stars`}><Star className={`w-7 h-7 ${value<=rating?'text-amber-400 fill-amber-400':'text-slate-300'}`}/></button>)}</div><textarea value={reviewComment} onChange={event=>setReviewComment(event.target.value)} maxLength={2000} rows={3} placeholder="Tell us about product quality, packing and delivery…" className="w-full rounded-xl border border-sky-200 p-3 text-sm resize-y"/><button disabled={submittingReview} onClick={()=>void submitReview(item.productId,item.productName)} className="px-5 py-2.5 rounded-xl bg-[#0875B5] text-white text-sm font-extrabold disabled:opacity-60">{submittingReview?'Submitting…':'Submit Rating'}</button></div>}</div>;})}</section>}
    </div>
  );
};
