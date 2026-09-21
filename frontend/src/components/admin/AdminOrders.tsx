import React, { useState } from 'react';
import { Order } from '../../types';
import { orderService } from '../../services/orderService';
import { toastService } from '../../services/toastService';
import { CalendarClock, CheckCircle2, ChevronDown, ChevronUp, PackageCheck, Truck } from 'lucide-react';

interface Props { orders: Order[]; onRefresh: () => void; }

type PackingDraft = { date: string; hour: string; minute: string; period: 'AM' | 'PM' };
function packingDraft(value?: string): PackingDraft {
  if (!value) return { date: '', hour: '10', minute: '00', period: 'AM' };
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return { date: '', hour: '10', minute: '00', period: 'AM' };
  const pad = (n: number) => String(n).padStart(2, '0');
  const hour = d.getHours();
  return { date: `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`, hour: String(hour % 12 || 12), minute: pad(d.getMinutes()), period: hour >= 12 ? 'PM' : 'AM' };
}

export const AdminOrders: React.FC<Props> = ({ orders, onRefresh }) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [packingDrafts, setPackingDrafts] = useState<Record<string, PackingDraft>>({});
  const [shippingOrder, setShippingOrder] = useState<Order | null>(null);
  const [shippingMode, setShippingMode] = useState<'dispatch' | 'tracking'>('dispatch');
  const [courier, setCourier] = useState('');
  const [awb, setAwb] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('https://www.tpcindia.com');
  const [eta, setEta] = useState('');

  const savePacking = async (order: Order) => {
    const value = packingDrafts[order.id] || packingDraft(order.packingScheduledAt);
    if (!value.date) return toastService.warning('Packing schedule required', 'Choose a packing date first.');
    let hour = Number(value.hour) % 12;
    if (value.period === 'PM') hour += 12;
    const scheduled = new Date(`${value.date}T${String(hour).padStart(2,'0')}:${value.minute}:00`);
    try {
      await orderService.schedulePacking(order.id, scheduled.toISOString());
      toastService.success('Packing schedule saved', 'The customer can now see the scheduled packing time.');
      onRefresh();
    } catch (error) {
      toastService.error('Unable to schedule packing', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const openShipping = (order: Order, mode: 'dispatch' | 'tracking' = 'dispatch') => {
    setShippingMode(mode);
    setShippingOrder(order);
    setCourier(order.shipment?.courierName || '');
    setAwb(order.shipment?.awbNumber || '');
    setTrackingUrl(order.shipment?.trackingUrl || 'https://www.tpcindia.com');
    setEta(order.shipment?.estimatedDelivery || '');
  };

  const dispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingOrder) return;
    if (shippingMode === 'tracking') {
      if (!awb.trim()) return toastService.warning('Tracking code required', 'Enter the courier tracking / AWB number.');
      try {
        if (!courier.trim()) return toastService.warning('Courier name required', 'Enter the courier used for this shipment.');
        await orderService.updateTrackingDetails(shippingOrder.id, { courierName: courier.trim(), awbNumber: awb.trim(), trackingUrl: trackingUrl.trim(), estimatedDelivery: eta.trim() });
        toastService.success('Tracking details saved', 'The customer can now see the courier tracking code.');
      } catch (error) {
        toastService.error('Unable to save tracking', error instanceof Error ? error.message : 'Please try again.');
        return;
      }
    } else {
      try {
        if (!courier.trim()) return toastService.warning('Courier name required', 'Enter the courier used for this shipment.');
        await orderService.markDispatched(shippingOrder.id, { courierName: courier.trim(), awbNumber: awb.trim() || undefined, trackingUrl: trackingUrl.trim() || undefined, estimatedDelivery: eta.trim(), shippedDate: new Date().toISOString() });
        toastService.success('Order dispatched', awb.trim() ? 'Dispatch and tracking details are now visible to the customer.' : 'The order is marked shipped. You can add the tracking code when the courier provides it.');
      } catch (error) { toastService.error('Unable to dispatch order', error instanceof Error ? error.message : 'Please try again.'); return; }
    }
    setShippingOrder(null);
    onRefresh();
  };

  const markReceived = async (order: Order) => {
    if (window.confirm(`Mark ${order.orderNumber} as received by the customer?`)) {
      try {
        await orderService.confirmReceived(order.id, 'SELLER');
        toastService.success('Order received', 'Receipt is confirmed and customer review access is enabled.');
        onRefresh();
      } catch (error) { toastService.error('Unable to mark received', error instanceof Error ? error.message : 'Please try again.'); }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#032B42]">Orders &amp; Fulfilment</h1>
        <p className="text-sm text-slate-500 mt-1">Workflow: payment confirmed → packing scheduled → shipped/dispatched → order received.</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const isExpanded = expanded === order.id;
          const shipped = ['SHIPPED','IN_TRANSIT','OUT_FOR_DELIVERY','DELIVERED'].includes(order.orderStatus);
          const received = order.orderStatus === 'DELIVERED' || !!order.receivedAt;
          const paid = order.paymentStatus === 'PAID';
          const hasTracking = !!order.shipment?.awbNumber;
          return (
            <div key={order.id} className="bg-white rounded-3xl border border-sky-100 shadow-sm overflow-hidden">
              <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2"><span className="font-mono font-extrabold text-[#032B42]">{order.orderNumber}</span><span className={`text-[10px] uppercase font-extrabold px-2 py-1 rounded-full ${received?'bg-emerald-100 text-emerald-800':shipped?'bg-blue-100 text-blue-800':'bg-amber-100 text-amber-800'}`}>{order.orderStatus.replaceAll('_',' ')}</span></div>
                  <p className="text-sm text-slate-500 mt-1">{order.customerName} • {order.deliveryAddress.district} • ₹{order.totalAmount}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {paid && !order.packingScheduledAt && !shipped && !received && <button onClick={() => setExpanded(order.id)} className="premium-action-btn px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-extrabold flex items-center gap-1.5"><CalendarClock className="w-3.5 h-3.5" /> Schedule packing</button>}
                  {order.packingScheduledAt && !shipped && !received && <button onClick={() => openShipping(order, 'dispatch')} className="premium-action-btn px-3 py-2 rounded-xl bg-sky-50 border border-sky-200 text-[#0875B5] text-xs font-extrabold flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> Mark shipped / dispatched</button>}
                  {shipped && !received && <button onClick={() => openShipping(order, 'tracking')} className="premium-action-btn px-3 py-2 rounded-xl bg-sky-50 border border-sky-200 text-[#0875B5] text-xs font-extrabold flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> {order.shipment?.awbNumber ? 'Update tracking code' : 'Add tracking code'}</button>}
                  {shipped && !received && <button onClick={() => markReceived(order)} className="premium-action-btn px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Mark received</button>}
                  <button onClick={() => setExpanded(isExpanded ? null : order.id)} className="p-2 text-slate-500">{isExpanded?<ChevronUp className="w-5 h-5"/>:<ChevronDown className="w-5 h-5"/>}</button>
                </div>
              </div>

              <div className="px-5 pb-5 grid sm:grid-cols-2 xl:grid-cols-5 gap-3">
                <div className={`rounded-2xl border p-4 ${paid?'bg-emerald-50 border-emerald-100':'bg-amber-50 border-amber-100'}`}><span className={`text-[10px] font-extrabold uppercase ${paid?'text-emerald-700':'text-amber-700'}`}>1 • Payment</span><p className="font-bold text-sm text-[#032B42] mt-1">{paid?'Verified & confirmed':'Verification in process'}</p></div>
                <div className={`rounded-2xl border p-4 ${order.packingScheduledAt ? 'bg-sky-50 border-sky-100' : 'bg-amber-50 border-amber-100'}`}><span className="text-[10px] font-extrabold uppercase text-[#0875B5]">2 • Packing</span><p className="font-bold text-sm text-[#032B42] mt-1">{order.packingScheduledAt ? new Date(order.packingScheduledAt).toLocaleString('en-IN') : 'Schedule required'}</p></div>
                <div className={`rounded-2xl border p-4 ${shipped ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100'}`}><span className="text-[10px] font-extrabold uppercase text-[#0875B5]">3 • Shipped</span><p className="font-bold text-sm text-[#032B42] mt-1">{shipped ? 'Dispatched' : 'Waiting'}</p></div>
                <div className={`rounded-2xl border p-4 ${hasTracking ? 'bg-cyan-50 border-cyan-100' : 'bg-slate-50 border-slate-100'}`}><span className="text-[10px] font-extrabold uppercase text-[#0875B5]">4 • Tracking</span><p className="font-bold text-sm text-[#032B42] mt-1 break-all">{hasTracking ? order.shipment?.awbNumber : shipped ? 'Add tracking code' : 'After dispatch'}</p></div>
                <div className={`rounded-2xl border p-4 ${received ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}><span className="text-[10px] font-extrabold uppercase text-slate-500">5 • Received</span><p className="font-bold text-sm text-[#032B42] mt-1">{received ? `Confirmed by ${order.receivedConfirmedBy || 'seller'}` : 'Not yet'}</p></div>
              </div>

              {isExpanded && <div className="border-t border-sky-100 bg-[#F8FDFF] p-5 space-y-5">
                <div className="grid lg:grid-cols-2 gap-5">
                  {paid ? <div className="bg-white rounded-2xl border border-sky-100 p-4">
                    <h3 className="text-sm font-extrabold text-[#032B42] flex items-center gap-2"><CalendarClock className="w-4 h-4 text-[#0875B5]" /> Set packing date &amp; time</h3>
                    {(()=>{const draft=packingDrafts[order.id]||packingDraft(order.packingScheduledAt);const update=(change:Partial<PackingDraft>)=>setPackingDrafts({...packingDrafts,[order.id]:{...draft,...change}});return <div className="grid grid-cols-2 sm:grid-cols-[1.5fr_.7fr_.7fr_.7fr_auto] gap-2 mt-3"><input aria-label="Packing date" type="date" min={new Date().toISOString().slice(0,10)} value={draft.date} onChange={e=>update({date:e.target.value})} className="col-span-2 sm:col-span-1 p-2.5 rounded-xl border border-sky-200 text-sm"/><select aria-label="Packing hour" value={draft.hour} onChange={e=>update({hour:e.target.value})} className="p-2.5 rounded-xl border border-sky-200 text-sm">{Array.from({length:12},(_,i)=>i+1).map(hour=><option key={hour}>{hour}</option>)}</select><select aria-label="Packing minute" value={draft.minute} onChange={e=>update({minute:e.target.value})} className="p-2.5 rounded-xl border border-sky-200 text-sm">{['00','15','30','45'].map(minute=><option key={minute}>{minute}</option>)}</select><select aria-label="AM or PM" value={draft.period} onChange={e=>update({period:e.target.value as 'AM'|'PM'})} className="p-2.5 rounded-xl border border-sky-200 text-sm font-bold"><option>AM</option><option>PM</option></select><button onClick={()=>savePacking(order)} className="col-span-2 sm:col-span-1 px-4 py-2.5 rounded-xl bg-[#0875B5] text-white text-xs font-extrabold">Save schedule</button></div>})()}
                  </div> : <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4"><h3 className="text-sm font-extrabold text-amber-800">Payment verification required</h3><p className="text-xs text-amber-700 mt-2">Verify this submission from the UPI Verification page before scheduling packing.</p></div>}
                  <div className="bg-white rounded-2xl border border-sky-100 p-4"><h3 className="text-sm font-extrabold text-[#032B42]">Courier details</h3><p className="text-sm text-slate-600 mt-2">{order.shipment?.courierName || 'Not assigned'}{order.shipment?.awbNumber ? ` • AWB ${order.shipment.awbNumber}` : ''}</p>{order.dispatchedAt && <p className="text-xs text-slate-400 mt-1">Dispatched: {new Date(order.dispatchedAt).toLocaleString('en-IN')}</p>}</div>
                </div>
                <div className="bg-white rounded-2xl border border-sky-100 p-4"><h3 className="text-sm font-extrabold text-[#032B42]">Items</h3><div className="mt-3 space-y-2">{order.items.map((item) => <div key={item.productId} className="flex justify-between text-sm"><span>{item.productName} × {item.quantity}</span><strong>₹{item.totalPrice}</strong></div>)}</div></div>
              </div>}
            </div>
          );
        })}
      </div>

      {shippingOrder && <div className="fixed inset-0 z-[80] bg-black/55 backdrop-blur-sm flex items-center justify-center p-4"><form onSubmit={dispatch} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-4"><div><h2 className="text-xl font-extrabold text-[#032B42]">{shippingMode === 'dispatch' ? 'Ship / Dispatch' : 'Add Tracking Code'} {shippingOrder.orderNumber}</h2><p className="text-xs text-slate-500">{shippingMode === 'dispatch' ? 'Mark the order as shipped. The tracking code is optional now and can be added later.' : 'Enter the tracking / AWB code received from the courier.'}</p></div>
        <div><label className="text-xs font-bold block mb-1">Courier Name</label><input value={courier} onChange={(e)=>setCourier(e.target.value)} className="w-full p-3 rounded-xl border border-sky-200" /></div>
        <div><label className="text-xs font-bold block mb-1">Tracking / AWB Number {shippingMode === 'dispatch' && <span className="font-normal text-slate-400">(optional now)</span>}</label><input value={awb} onChange={(e)=>setAwb(e.target.value)} className="w-full p-3 rounded-xl border border-sky-200" placeholder="Enter courier tracking code" /></div>
        <div><label className="text-xs font-bold block mb-1">Tracking URL</label><input value={trackingUrl} onChange={(e)=>setTrackingUrl(e.target.value)} className="w-full p-3 rounded-xl border border-sky-200" /></div>
        <div><label className="text-xs font-bold block mb-1">Estimated Delivery Date (optional)</label><input type="date" value={eta ? eta.slice(0,10) : ''} onChange={(e)=>setEta(e.target.value)} className="w-full p-3 rounded-xl border border-sky-200"/><p className="text-xs text-slate-400 mt-1">Customers will see this as a clear day, date and month.</p></div>
        <div className="flex gap-3 justify-end pt-2"><button type="button" onClick={()=>setShippingOrder(null)} className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm">Cancel</button><button type="submit" className="px-4 py-2.5 rounded-xl bg-[#0875B5] text-white font-extrabold text-sm flex items-center gap-2"><PackageCheck className="w-4 h-4" /> {shippingMode === 'dispatch' ? 'Save & mark shipped' : 'Save tracking code'}</button></div>
      </form></div>}
    </div>
  );
};
