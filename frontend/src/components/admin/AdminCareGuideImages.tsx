import React, { useEffect, useState } from 'react';
import { productService } from '../../services/productService';
import { toastService } from '../../services/toastService';
import { Image as ImageIcon, Save, Upload } from 'lucide-react';

type Article = { id: string; title: string; slug: string; bannerImage: string };
const API = (import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:4000/api' : '/api')).replace(/\\/$/, '');

export const AdminCareGuideImages: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [drafts, setDrafts] = useState<Record<string,string>>({});
  const [busy, setBusy] = useState<string>('');
  const load = async () => {
    const res = await fetch(`${API}/admin/customer-experience/care-articles`, { credentials: 'include' });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.success || !Array.isArray(body.data)) throw new Error(body.message || 'Unable to load care guides');
    setArticles(body.data); setDrafts(Object.fromEntries(body.data.map((a:Article) => [a.id,a.bannerImage])));
  };
  useEffect(() => { void load().catch(e => toastService.error('Care guides unavailable', e.message)); }, []);
  const upload = async (id:string, file?:File) => {
    if (!file) return;
    if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 5*1024*1024) {
      toastService.error('Invalid image','Use JPG, PNG or WebP up to 5 MB. Recommended: 1200 × 750 px.'); return;
    }
    try {
      const data = await new Promise<string>((resolve,reject) => { const r=new FileReader(); r.onload=()=>resolve(String(r.result)); r.onerror=reject; r.readAsDataURL(file); });
      const result = await productService.uploadImage(data);
      setDrafts(prev=>({...prev,[id]:result.url}));
      toastService.success('Image uploaded','Click Save Image to publish this care guide image.');
    } catch(e) { toastService.error('Upload failed',e instanceof Error?e.message:'Unable to upload image'); }
  };
  const save = async (id:string) => {
    setBusy(id);
    try {
      const res=await fetch(`${API}/admin/customer-experience/care-articles/${id}/image`,{method:'PATCH',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({bannerImage:drafts[id]})});
      const body=await res.json().catch(()=>({}));
      if(!res.ok||!body.success) throw new Error(body.message||'Could not save image');
      toastService.success('Image saved','Care guide image published.');
      await load();
    } catch(e) { toastService.error('Save failed',e instanceof Error?e.message:'Please try again'); }
    finally { setBusy(''); }
  };
  return <section className="space-y-5">
    <div><h2 className="text-2xl font-extrabold text-[#032B42]">Care Guide Images</h2>
    <p className="text-sm text-slate-500 mt-1">Upload a matching guppy-care image for each article, then save it to publish.</p>
    <p className="text-xs text-sky-700 mt-2 font-semibold">Recommended: 1200 × 750 px (16:10) • JPG, PNG or WebP • Maximum 5 MB per image</p></div>
    {articles.map(article=><div key={article.id} className="bg-white border border-sky-100 rounded-2xl p-4 sm:p-5 space-y-3">
      <h3 className="font-bold text-[#032B42]">{article.title}</h3>
      <div className="grid sm:grid-cols-[180px_1fr] gap-4 items-start">
        <img src={drafts[article.id]||article.bannerImage} alt={article.title} className="w-full aspect-[16/10] object-cover rounded-xl bg-sky-50"/>
        <div className="space-y-3 min-w-0">
          <label className="block text-xs font-bold text-slate-600">Image URL</label>
          <input value={drafts[article.id]||''} onChange={e=>setDrafts(prev=>({...prev,[article.id]:e.target.value}))} className="w-full border border-slate-200 rounded-xl p-3 text-sm" placeholder="https://..."/>
          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-50 text-sky-800 text-xs font-bold cursor-pointer"><Upload className="w-4 h-4"/> Upload replacement<input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e=>void upload(article.id,e.target.files?.[0])}/></label>
          <button disabled={busy===article.id||!drafts[article.id]} onClick={()=>void save(article.id)} className="ml-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0875B5] text-white text-xs font-bold disabled:opacity-50"><Save className="w-4 h-4"/>{busy===article.id?'Saving…':'Save Image'}</button>
        </div>
      </div>
    </div>)}
  </section>;
};
