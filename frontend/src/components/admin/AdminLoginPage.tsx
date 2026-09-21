import React, { useState } from 'react';
import { Fish, Lock, ShieldCheck, ArrowRight } from 'lucide-react';

interface AdminLoginPageProps {
  onLogin: () => void;
  onBackToStore: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLogin, onBackToStore }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true); setError('');
    try { const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api').replace(/\/$/, ''); const response = await fetch(`${base}/auth/admin/login`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }); const body = await response.json().catch(() => ({})); if (!response.ok || !body.success) throw new Error(body.message || 'Admin sign-in failed'); onLogin(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Admin sign-in failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#021E31] via-[#043B57] to-[#0875B5] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        <div className="p-6 sm:p-8 bg-[#021E31] text-white text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#0875B5] mx-auto flex items-center justify-center mb-3">
            <Fish className="w-6 h-6 text-[#50D4EE]" />
          </div>
          <h1 className="text-xl font-extrabold font-['Manrope',sans-serif]">Seller Admin</h1>
          <p className="text-xs text-sky-200 mt-1">Sweety Birds &amp; Fishes</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <p>Only a verified ADMIN account can enter this protected seller console.</p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Admin Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seller@example.com"
              className="w-full px-3 py-3 rounded-xl border border-sky-200 bg-[#F8FDFF] text-sm focus:outline-none focus:border-[#0875B5]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-9 pr-3 py-3 rounded-xl border border-sky-200 bg-[#F8FDFF] text-sm focus:outline-none focus:border-[#0875B5]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full min-h-[48px] rounded-2xl bg-[#0875B5] hover:bg-[#064463] text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? 'Signing in…' : 'Enter Admin Console'} <ArrowRight className="w-4 h-4" />
          </button>
          {error && <p className="text-xs font-semibold text-rose-600 text-center">{error}</p>}

          <button
            type="button"
            onClick={onBackToStore}
            className="w-full text-xs font-semibold text-[#0875B5] hover:underline"
          >
            Back to Storefront
          </button>
        </form>
      </div>
    </div>
  );
};
