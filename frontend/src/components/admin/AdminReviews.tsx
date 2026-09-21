import React, { useEffect, useState } from 'react';
import { reviewService } from '../../services/reviewService';
import { Review } from '../../types';
import { toastService } from '../../services/toastService';
import { Star, Check, X, Trash2, ShieldCheck, MessageCircleReply } from 'lucide-react';

export const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>(reviewService.getAllReviews());
  useEffect(() => { const unsub = reviewService.subscribe(setReviews); void reviewService.refreshAdmin().catch(() => undefined); return unsub; }, []);
  const update = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await reviewService.updateReviewStatus(id, status);
      toastService.success(status === 'APPROVED' ? 'Review published' : 'Review rejected', status === 'APPROVED' ? 'The review is now visible on customer pages.' : 'The review will not be displayed publicly.');
    } catch (error) { toastService.error('Review update failed', error instanceof Error ? error.message : 'Please try again.'); }
  };
  const reply = async (review: Review) => {
    const value = window.prompt('Public seller reply', review.sellerReply || '');
    if (value === null) return;
    try {
      await reviewService.replyToReview(review.id, value);
      toastService.success('Seller reply saved', 'The reply will be visible with approved customer reviews.');
    } catch (error) { toastService.error('Reply not saved', error instanceof Error ? error.message : 'Please try again.'); }
  };
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-extrabold text-[#032B42]">Customer Reviews</h1><p className="text-sm text-slate-500 mt-1">Customers can submit reviews only after an order is received. Approve a review before it appears publicly.</p></div>
      <div className="flex gap-2 text-xs font-bold"><span className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-700">Pending {reviews.filter(r=>r.status==='PENDING').length}</span><span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700">Published {reviews.filter(r=>r.status==='APPROVED').length}</span></div>
      <div className="space-y-4">
        {reviews.length === 0 && <div className="p-10 rounded-3xl bg-white border border-sky-100 text-center text-slate-500">No reviews yet.</div>}
        {reviews.map((r) => <div key={r.id} className="bg-white rounded-3xl border border-sky-100 p-5 lg:p-6 shadow-sm flex flex-col lg:flex-row gap-5 justify-between">
          <div className="flex-1 space-y-2"><div className="flex flex-wrap items-center gap-2"><strong className="text-[#032B42]">{r.customerName}</strong>{r.isVerifiedPurchase && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Delivered purchase</span>}<span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${r.status==='APPROVED'?'bg-emerald-100 text-emerald-800':r.status==='PENDING'?'bg-amber-100 text-amber-800':'bg-rose-100 text-rose-700'}`}>{r.status}</span></div>
            <div className="flex gap-0.5">{Array.from({length:5}).map((_,i)=><Star key={i} className={`w-4 h-4 ${i<r.rating?'fill-amber-400 text-amber-400':'text-slate-200'}`} />)}</div>
            <h2 className="font-extrabold text-sm text-[#032B42]">{r.title}</h2><p className="text-sm text-slate-600 leading-relaxed">{r.comment}</p>{r.sellerReply && <div className="rounded-xl bg-sky-50 border border-sky-100 p-3 text-xs text-slate-600"><strong className="text-[#0875B5]">Seller reply:</strong> {r.sellerReply}</div>}<p className="text-xs text-slate-400">{r.productName} • {new Date(r.createdAt).toLocaleString('en-IN')}</p>
          </div>
          <div className="flex lg:flex-col gap-2 shrink-0"><button onClick={()=>reply(r)} className="px-3 py-2 rounded-xl bg-sky-50 text-[#0875B5] font-extrabold text-xs flex items-center gap-1"><MessageCircleReply className="w-3.5 h-3.5" /> Reply</button>{r.status !== 'APPROVED' && <button onClick={()=>update(r.id,'APPROVED')} className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-extrabold text-xs flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Approve</button>}{r.status !== 'REJECTED' && <button onClick={()=>update(r.id,'REJECTED')} className="px-3 py-2 rounded-xl bg-rose-50 text-rose-700 font-extrabold text-xs flex items-center gap-1"><X className="w-3.5 h-3.5" /> Reject</button>}<button onClick={()=>{ if(window.confirm('Delete this review permanently?')) void reviewService.deleteReview(r.id).catch((error)=>toastService.error('Delete failed', error instanceof Error ? error.message : 'Please try again.')); }} className="px-3 py-2 rounded-xl bg-slate-50 text-slate-500 font-bold text-xs"><Trash2 className="w-3.5 h-3.5" /></button></div>
        </div>)}
      </div>
    </div>
  );
};
