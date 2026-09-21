import React, { useEffect, useState } from 'react';
import { Save, MessageCircle, Mail, MapPin, RefreshCw, Pencil, X, Truck, Upload, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { siteSettingsService, SiteSettings, CustomStoreCategory } from '../../services/siteSettingsService';
import { toastService } from '../../services/toastService';
import { productService } from '../../services/productService';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(() => siteSettingsService.getSettings());
  const [draft, setDraft] = useState<SiteSettings>(settings);
  const [categoryDraft, setCategoryDraft] = useState<CustomStoreCategory[]>(settings.customCategories || []);
  const [categorySaving, setCategorySaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  useEffect(() => siteSettingsService.subscribe((next) => { setSettings(next); if (!isEditing) setDraft(next); setCategoryDraft(next.customCategories || []); }), [isEditing]);

  const uploadCategoryImage = async (field: 'guppiesCategoryImage' | 'fishFoodCategoryImage' | 'comboPacksCategoryImage', file?: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      toastService.error('Invalid image', 'Use a JPG, PNG or WebP image no larger than 5 MB.'); return;
    }
    const reader = new FileReader();
    reader.onload = async () => { try { const uploaded = await productService.uploadImage(String(reader.result)); setDraft(current => ({ ...current, [field]: uploaded.url })); toastService.success('Image uploaded', 'Click Save & Publish to display it on the customer homepage.'); } catch (error) { toastService.error('Upload failed', error instanceof Error ? error.message : 'Unable to upload image.'); } };
    reader.readAsDataURL(file);
  };


  const updateCategory = (id: string, patch: Partial<CustomStoreCategory>) => setCategoryDraft(current => current.map(category => category.id === id ? { ...category, ...patch } : category));
  const addCategory = () => setCategoryDraft(current => [...current, { id: `custom-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, name: '', description: '', image: '', targetCategory: 'guppies', published: true }]);
  const uploadCustomCategoryImage = async (id: string, file?: File) => {
    if (!file) return;
    if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) { toastService.error('Invalid image', 'Use JPG, PNG or WebP up to 5 MB.'); return; }
    const reader = new FileReader();
    reader.onload = async () => { try { const uploaded = await productService.uploadImage(String(reader.result)); updateCategory(id, { image: uploaded.url }); toastService.success('Category image uploaded', 'Save & Publish categories to show it in your store.'); } catch (error) { toastService.error('Upload failed', error instanceof Error ? error.message : 'Unable to upload image.'); } };
    reader.readAsDataURL(file);
  };
  const saveCategories = async () => {
    const active = categoryDraft.filter(category => category.name.trim() || category.image);
    if (active.some(category => category.name.trim().length < 2 || !category.image)) { toastService.error('Complete each category', 'Every custom category needs a name and uploaded image.'); return; }
    if (active.some(category => !category.name.trim())) { toastService.error('Category name required', 'Enter a name for each custom category.'); return; }
    if (new Set(active.map(category => category.name.trim().toLowerCase())).size !== active.length) { toastService.error('Duplicate category', 'Use a unique name for each category.'); return; }
    setCategorySaving(true);
    try { await siteSettingsService.updateSettings({ ...settings, customCategories: active.map(category => ({ ...category, name: category.name.trim(), description: category.description.trim() })) }); toastService.success('Categories published', 'Your custom collection cards are now live on the storefront.'); }
    catch (error) { toastService.error('Unable to publish categories', error instanceof Error ? error.message : 'Please try again.'); }
    finally { setCategorySaving(false); }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = draft.whatsappNumber.trim();
    const email = draft.email.trim();
    if (!phone || !email.includes('@')) {
      toastService.error('Check contact details', 'Enter a valid WhatsApp number and email address.');
      return;
    }
    if (!Number.isFinite(Number(draft.courierPackingCharge)) || Number(draft.courierPackingCharge) < 0) {
      toastService.error('Check delivery charge', 'Courier + Packing charge must be zero or greater.');
      return;
    }
    try {
      await siteSettingsService.updateSettings(draft);
      setIsEditing(false);
      toastService.success('Contact details saved', 'Customer-facing contact details were published from the database.');
    } catch (error) { toastService.error('Unable to save', error instanceof Error ? error.message : 'Contact settings were not saved.'); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-[#032B42]">Store &amp; Contact Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Only saved database values are published to customer pages.</p>
      </div>
      <form onSubmit={save} className="bg-white rounded-3xl border border-sky-100 p-6 lg:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-sky-100">
          <div>
            <h2 className="font-extrabold text-[#032B42]">Published contact details</h2>
            <p className="text-xs text-slate-500 mt-1">Customers see these details across Contact, WhatsApp and support areas.</p>
          </div>
          {!isEditing ? (
            <button type="button" onClick={() => { setDraft(settings); setIsEditing(true); }} className="premium-action-btn px-4 py-2.5 rounded-xl bg-sky-50 border border-sky-200 text-[#0875B5] font-extrabold text-sm flex items-center justify-center gap-2">
              <Pencil className="w-4 h-4" /> Edit contact details
            </button>
          ) : (
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-2 rounded-xl">Editing mode</span>
          )}
        </div>

        <fieldset disabled={!isEditing} className={!isEditing ? 'opacity-80' : ''}>
          <div className="space-y-6">
            <div>
              <label className="font-extrabold text-sm text-[#032B42] flex items-center gap-2 mb-2"><MessageCircle className="w-4 h-4 text-[#25D366]" /> WhatsApp Business</label>
              <input value={draft.whatsappNumber} onChange={(e) => setDraft({ ...draft, whatsappNumber: e.target.value })} className={`w-full p-3.5 rounded-xl border outline-none ${isEditing ? 'border-sky-200 bg-[#F8FDFF] focus:border-[#0875B5]' : 'border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed'}`} placeholder="+91 9976894662" />
              <p className="text-xs text-slate-400 mt-1.5">Used by WhatsApp buttons, product enquiries and the Contact page.</p>
            </div>
            <div>
              <label className="font-extrabold text-sm text-[#032B42] flex items-center gap-2 mb-2"><Mail className="w-4 h-4 text-[#0875B5]" /> Support Email</label>
              <input type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} className={`w-full p-3.5 rounded-xl border outline-none ${isEditing ? 'border-sky-200 bg-[#F8FDFF] focus:border-[#0875B5]' : 'border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed'}`} placeholder="name@example.com" />
            </div>
            <div>
              <label className="font-extrabold text-sm text-[#032B42] flex items-center gap-2 mb-2"><MapPin className="w-4 h-4 text-[#0875B5]" /> Display Location</label>
              <input value={draft.locationLabel} onChange={(e) => setDraft({ ...draft, locationLabel: e.target.value })} className={`w-full p-3.5 rounded-xl border outline-none ${isEditing ? 'border-sky-200 bg-[#F8FDFF] focus:border-[#0875B5]' : 'border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed'}`} />
            </div>
            <div>
              <label className="font-extrabold text-sm text-[#032B42] flex items-center gap-2 mb-2"><Truck className="w-4 h-4 text-[#0875B5]" /> Courier + Packing Charge (₹)</label>
              <input type="number" min="0" step="0.01" value={draft.courierPackingCharge} onChange={(e) => setDraft({ ...draft, courierPackingCharge: Number(e.target.value) })} className={`w-full p-3.5 rounded-xl border outline-none ${isEditing ? 'border-sky-200 bg-[#F8FDFF] focus:border-[#0875B5]' : 'border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed'}`} />
              <p className="text-xs text-slate-400 mt-1.5">Used by backend checkout calculations and shown clearly to customers.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
              <div><label className="font-extrabold text-sm text-[#032B42] block mb-2">UPI ID</label><input value={draft.upiId||''} onChange={e=>setDraft({...draft,upiId:e.target.value})} placeholder="name@bank" className="w-full p-3.5 rounded-xl border border-emerald-200 bg-white outline-none"/><p className="text-xs text-slate-500 mt-1">Used to create UPI app links and QR codes.</p></div>
              <div><label className="font-extrabold text-sm text-[#032B42] block mb-2">UPI Payee Name</label><input value={draft.upiPayeeName||''} onChange={e=>setDraft({...draft,upiPayeeName:e.target.value})} className="w-full p-3.5 rounded-xl border border-emerald-200 bg-white outline-none"/></div>
            </div>
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 space-y-4">
              <div><h3 className="font-extrabold text-[#032B42] flex items-center gap-2"><ImageIcon className="w-4 h-4 text-[#0875B5]" /> Homepage category-card images</h3><p className="text-xs text-slate-500 mt-1">Recommended: <strong>1600 × 1000 px</strong> (8:5 landscape). JPG, PNG or WebP, maximum 5 MB. Changes appear to customers only after Save &amp; Publish.</p></div>
              {([
                ['Guppies', 'guppiesCategoryImage'], ['Fish Food', 'fishFoodCategoryImage'], ['Combo Packs', 'comboPacksCategoryImage'],
              ] as const).map(([label, field]) => <div key={field} className="grid sm:grid-cols-[120px_1fr_auto] items-center gap-3 bg-white rounded-xl border border-sky-100 p-3">
                <img src={draft[field]} alt={`${label} category preview`} className="w-full h-20 object-cover rounded-lg bg-slate-100" />
                <div><p className="font-bold text-sm text-[#032B42]">{label}</p><p className="text-[11px] text-slate-400 break-all line-clamp-2">{draft[field]}</p></div>
                <label className="cursor-pointer px-3 py-2 rounded-xl bg-[#0875B5] text-white font-bold text-xs flex items-center justify-center gap-1.5"><Upload className="w-3.5 h-3.5" /> Upload<input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => { void uploadCategoryImage(field, e.target.files?.[0]); e.target.value=''; }} /></label>
              </div>)}
            </div>
          </div>
        </fieldset>

        <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 text-sm text-slate-600">
          <strong className="text-[#032B42]">Currently published:</strong><br />{settings.whatsappNumber} • {settings.email} • {settings.locationLabel}<br />Courier + Packing: ₹{settings.courierPackingCharge}
        </div>

        {isEditing && <div className="flex flex-col sm:flex-row gap-3">
          <button type="submit" className="premium-action-btn px-5 py-3 rounded-2xl bg-[#0875B5] text-white font-extrabold text-sm flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Save &amp; Publish</button>
          <button type="button" onClick={() => { setDraft(settings); setIsEditing(false); }} className="premium-action-btn px-5 py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center gap-2"><X className="w-4 h-4" /> Cancel</button>
          <button type="button" onClick={() => setDraft(settings)} className="premium-action-btn px-5 py-3 rounded-2xl bg-sky-50 text-[#0875B5] font-bold text-sm flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4" /> Reset</button>
        </div>}
      </form>

      <section className="bg-white rounded-3xl border border-sky-100 p-5 sm:p-7 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div><span className="inline-flex px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-800 text-[11px] font-extrabold uppercase tracking-wider">Storefront collections</span><h2 className="text-xl font-extrabold text-[#032B42] mt-2">Create premium categories</h2><p className="text-sm text-slate-500 mt-1">Add custom image-led collections to your homepage. Each collection showcases an existing product group.</p></div>
          <button type="button" onClick={addCategory} disabled={categoryDraft.length >= 24} className="premium-action-btn shrink-0 px-4 py-3 rounded-xl bg-[#032B42] text-white font-extrabold text-sm flex items-center justify-center gap-2"><Plus className="w-4 h-4"/> Add category</button>
        </div>
        <div className="rounded-2xl bg-sky-50 border border-sky-100 p-3 text-xs text-slate-600">Image guide: <strong>1600 × 1000 px</strong> (8:5 landscape), JPG/PNG/WebP, up to 5 MB. Select which existing inventory group the category should display.</div>
        {categoryDraft.length === 0 && <div className="text-center rounded-2xl border border-dashed border-sky-200 py-8 px-4"><div className="text-sm font-bold text-[#032B42]">Your custom collections start here</div><p className="text-xs text-slate-500 mt-1">Create a collection such as “Betta Specials” or “Guppy Starter Kits”.</p></div>}
        <div className="space-y-4">{categoryDraft.map((category, index) => <div key={category.id} className="rounded-2xl border border-sky-100 p-3 sm:p-4 grid sm:grid-cols-[140px_1fr] gap-4">
          <div className="space-y-2"><div className="aspect-[8/5] rounded-xl overflow-hidden bg-slate-100 border border-slate-100">{category.image ? <img src={category.image} alt={`${category.name || 'Custom'} category preview`} className="w-full h-full object-cover"/> : <div className="h-full flex items-center justify-center text-xs text-slate-400">Image preview</div>}</div><label className="cursor-pointer px-3 py-2.5 rounded-xl bg-[#0875B5] text-white font-bold text-xs flex items-center justify-center gap-2"><Upload className="w-3.5 h-3.5"/> {category.image ? 'Replace image' : 'Upload image'}<input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => { void uploadCustomCategoryImage(category.id,e.target.files?.[0]); e.currentTarget.value=''; }}/></label></div>
          <div className="space-y-3 min-w-0"><div className="flex items-center justify-between gap-2"><span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-700">Collection {index+1}</span><button type="button" onClick={() => setCategoryDraft(current => current.filter(item => item.id !== category.id))} className="px-3 py-2 rounded-lg bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-1.5"><Trash2 className="w-3.5 h-3.5"/> Remove</button></div>
            <input value={category.name} onChange={e => updateCategory(category.id,{name:e.target.value})} maxLength={60} placeholder="Category name (e.g. Betta Specials)" className="w-full p-3 rounded-xl border border-sky-100 bg-[#F8FDFF] text-sm font-semibold outline-none focus:border-[#0875B5]"/>
            <input value={category.description} onChange={e => updateCategory(category.id,{description:e.target.value})} maxLength={180} placeholder="Short customer-facing description" className="w-full p-3 rounded-xl border border-sky-100 bg-[#F8FDFF] text-sm outline-none focus:border-[#0875B5]"/>
            <div className="grid sm:grid-cols-2 gap-3"><select value={category.targetCategory} onChange={e => updateCategory(category.id,{targetCategory:e.target.value as CustomStoreCategory['targetCategory']})} className="w-full p-3 rounded-xl border border-sky-100 bg-white text-sm font-semibold"><option value="guppies">Show Guppies</option><option value="fish-food">Show Fish Food</option><option value="combo-packs">Show Combo Packs</option><option value="wholesale">Show Wholesale</option></select><label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm font-semibold"><input type="checkbox" checked={category.published} onChange={e => updateCategory(category.id,{published:e.target.checked})} className="accent-[#0875B5] w-4 h-4"/> Published on homepage</label></div>
          </div>
        </div>)}</div>
        <div className="flex flex-col sm:flex-row gap-3"><button type="button" disabled={categorySaving} onClick={() => void saveCategories()} className="premium-action-btn px-5 py-3 rounded-xl bg-[#0875B5] text-white font-extrabold text-sm flex items-center justify-center gap-2"><Save className="w-4 h-4"/>{categorySaving ? 'Publishing…' : 'Save & Publish Categories'}</button><span className="self-center text-xs text-slate-400">Up to 24 custom collections</span></div>
      </section>
    </div>
  );
};
