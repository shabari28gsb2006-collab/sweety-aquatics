import React, { useEffect, useState } from 'react';
import { serviceabilityService } from '../../services/serviceabilityService';
import { ServiceablePincode } from '../../types';
import { toastService } from '../../services/toastService';
import { Plus, Search, RefreshCw, Pencil, Trash2, Save, X } from 'lucide-react';

export const AdminPincodes: React.FC = () => {
  const [pincodes, setPincodes] = useState<ServiceablePincode[]>(serviceabilityService.getAllPincodes());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [newPincode, setNewPincode] = useState('');
  const [newDistrict, setNewDistrict] = useState('Chennai');
  const [newArea, setNewArea] = useState('');
  const [newEta, setNewEta] = useState('2');
  const [editing, setEditing] = useState<ServiceablePincode | null>(null);


  useEffect(() => {
    const unsubscribe = serviceabilityService.subscribe(setPincodes);
    void serviceabilityService.loadAdminPincodes()
      .catch((error) => toastService.error('Unable to load', error instanceof Error ? error.message : 'Could not load serviceable PIN codes.'))
      .finally(() => setIsLoading(false));
    return unsubscribe;
  }, []);

  const filtered = pincodes.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (p.pincode || '').includes(q) ||
      (p.district?.toLowerCase() || '').includes(q) ||
      (p.area?.toLowerCase() || '').includes(q)
    );
  });

  const handleToggle = async (id: string) => {
    try {
      await serviceabilityService.toggleActive(id);
      toastService.info('Updated', 'Serviceability status updated in the database.');
    } catch (error) {
      toastService.error('Update failed', error instanceof Error ? error.message : 'Unable to update serviceability.');
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPincode.length !== 6 || !/^\d+$/.test(newPincode)) {
      toastService.warning('Invalid Format', 'PIN code must be a 6-digit number.');
      return;
    }

    setIsSaving(true);
    try {
      await serviceabilityService.addPincode({
        pincode: newPincode,
        district: newDistrict,
        area: newArea || newDistrict,
        state: 'Tamil Nadu',
        courier: '',
        isActive: true,
        estimatedDays: newEta,
      });
      setNewPincode('');
      setNewArea('');
      toastService.success('PIN Code Added', `PIN ${newPincode} is now serviceable in Tamil Nadu.`);
    } catch (error) {
      toastService.error('Unable to add PIN', error instanceof Error ? error.message : 'Could not save this service area.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing || !/^\d{6}$/.test(editing.pincode) || editing.district.trim().length < 2) return;
    setIsSaving(true);
    try { await serviceabilityService.updatePincode(editing.id, { pincode: editing.pincode, district: editing.district.trim(), area: editing.area.trim(), state: 'Tamil Nadu', courier: editing.courier, isActive: editing.isActive, estimatedDays: editing.estimatedDays }); setEditing(null); toastService.success('PIN updated', 'The service area changes are live at checkout.'); }
    catch (error) { toastService.error('Update failed', error instanceof Error ? error.message : 'Unable to update PIN code.'); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (item: ServiceablePincode) => {
    if (!window.confirm(`Delete serviceable PIN ${item.pincode}? Checkout will reject it immediately.`)) return;
    try { await serviceabilityService.deletePincode(item.id); if (editing?.id === item.id) setEditing(null); toastService.success('PIN deleted', `${item.pincode} was removed from serviceable areas.`); }
    catch (error) { toastService.error('Delete failed', error instanceof Error ? error.message : 'Unable to delete PIN code.'); }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#032B42] font-['Manrope',sans-serif]">
            Tamil Nadu Serviceable PIN Codes
          </h1>
          <p className="text-xs text-slate-500">
            Control which regional postal zones and courier details are accepted at checkout.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-sky-100 flex items-center gap-3 shadow-xs">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by PIN or district..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs bg-transparent focus:outline-none"
            />
          </div>

          <div className="bg-white rounded-3xl border border-sky-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-sky-50/90 backdrop-blur-xs border-b border-sky-100 text-slate-500 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">PIN Code</th>
                    <th className="py-3 px-4 font-semibold">District</th>
                    <th className="py-3 px-4 font-semibold">City / Area</th>
                    <th className="py-3 px-4 font-semibold">Transit SLA</th>
                    <th className="py-3 px-4 font-semibold text-right">Serviceable</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-50">
                  {isLoading && <tr><td colSpan={6} className="py-10 text-center text-slate-400"><RefreshCw className="w-4 h-4 animate-spin inline mr-2" />Loading database service areas…</td></tr>}
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-sky-50/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#032B42]">{item.pincode}</td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{item.district}</td>
                      <td className="py-3 px-4 text-slate-500">{item.area}</td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">{item.estimatedDays || '1-2 Days'}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => void handleToggle(item.id)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                            item.isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          {item.isActive ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="py-3 px-4"><div className="flex justify-end gap-1.5"><button onClick={() => setEditing(item)} title="Edit PIN code" className="p-2 rounded-lg text-[#0875B5] bg-sky-50 hover:bg-sky-100"><Pencil className="w-3.5 h-3.5" /></button><button onClick={() => void handleDelete(item)} title="Delete PIN code" className="p-2 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Add PIN Form */}
        <div className="bg-white rounded-3xl border border-sky-100 p-6 shadow-xs space-y-4 sticky top-24">
          <h3 className="font-bold text-sm text-[#032B42] uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-[#0875B5]" />
            Add New Serviceable PIN
          </h3>

          <form onSubmit={handleAdd} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">6-Digit PIN Code</label>
              <input
                type="text"
                required
                maxLength={6}
                value={newPincode}
                onChange={(e) => setNewPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="600028"
                className="w-full p-2.5 bg-[#F8FDFF] border border-sky-200 rounded-xl font-mono focus:outline-none focus:border-[#0875B5]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">District</label>
              <input
                type="text"
                required
                value={newDistrict}
                onChange={(e) => setNewDistrict(e.target.value)}
                placeholder="Chennai"
                className="w-full p-2.5 bg-[#F8FDFF] border border-sky-200 rounded-xl focus:outline-none focus:border-[#0875B5]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Area / Hub Location</label>
              <input
                type="text"
                required
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
                placeholder="Mylapore"
                className="w-full p-2.5 bg-[#F8FDFF] border border-sky-200 rounded-xl focus:outline-none focus:border-[#0875B5]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Estimated Delivery Days</label>
              <input
                type="number"
                required
                min={1}
                max={30}
                value={newEta}
                onChange={(e) => setNewEta(e.target.value)}
                placeholder="2"
                className="w-full p-2.5 bg-[#F8FDFF] border border-sky-200 rounded-xl focus:outline-none focus:border-[#0875B5]"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full disabled:opacity-60 disabled:cursor-not-allowed bg-[#0875B5] hover:bg-[#064463] text-white font-bold py-3 rounded-xl shadow-md transition-all mt-2"
            >
              {isSaving ? 'Saving…' : 'Add Serviceable Zone'}
            </button>
          </form>
        </div>
      </div>
      {editing && <div className="fixed inset-0 z-50 bg-[#021E31]/60 backdrop-blur-sm p-4 flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Edit serviceable PIN code"><form onSubmit={handleSaveEdit} className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 space-y-4"><div className="flex justify-between items-center"><div><h2 className="font-extrabold text-xl text-[#032B42]">Edit serviceable PIN</h2><p className="text-xs text-slate-500">Saved changes apply immediately at checkout.</p></div><button type="button" onClick={() => setEditing(null)} className="p-2 rounded-xl hover:bg-slate-100"><X className="w-5 h-5" /></button></div><div className="grid sm:grid-cols-2 gap-3 text-xs"><label className="font-bold text-slate-700">PIN code<input required maxLength={6} value={editing.pincode} onChange={e=>setEditing({...editing,pincode:e.target.value.replace(/\D/g,'')})} className="block w-full mt-1 p-3 border border-sky-200 rounded-xl font-mono" /></label><label className="font-bold text-slate-700">District<input required value={editing.district} onChange={e=>setEditing({...editing,district:e.target.value})} className="block w-full mt-1 p-3 border border-sky-200 rounded-xl" /></label><label className="font-bold text-slate-700 sm:col-span-2">City / area<input required value={editing.area} onChange={e=>setEditing({...editing,area:e.target.value})} className="block w-full mt-1 p-3 border border-sky-200 rounded-xl" /></label><label className="font-bold text-slate-700">Estimated days<input type="number" min="1" max="30" required value={(editing.estimatedDays || '2').match(/\d+/)?.[0] || '2'} onChange={e=>setEditing({...editing,estimatedDays:`${e.target.value} Day${e.target.value==='1'?'':'s'}`})} className="block w-full mt-1 p-3 border border-sky-200 rounded-xl" /></label><label className="font-bold text-slate-700">Courier<input value={editing.courier || ''} onChange={e=>setEditing({...editing,courier:e.target.value})} className="block w-full mt-1 p-3 border border-sky-200 rounded-xl" /></label></div><div className="flex gap-3 pt-2"><button disabled={isSaving} className="flex-1 py-3 bg-[#0875B5] text-white rounded-xl font-bold flex justify-center gap-2"><Save className="w-4 h-4" />{isSaving?'Saving…':'Save changes'}</button><button type="button" onClick={() => setEditing(null)} className="px-5 py-3 bg-slate-100 rounded-xl font-bold">Cancel</button></div></form></div>}
    </div>
  );
};
