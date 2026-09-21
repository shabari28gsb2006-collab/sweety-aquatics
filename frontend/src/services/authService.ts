import { User, Address } from '../types';

type AuthListener = (user: User | null) => void;
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api').replace(/\/$/, '');

type BackendAddress = {
  id: string; fullName: string; mobile: string; line1: string; line2?: string | null; area?: string | null;
  city: string; district: string; state: string; pincode: string; isDefault: boolean;
};
type BackendUser = {
  id: string; name: string; email: string; mobile?: string | null; role?: string; isEmailVerified: boolean; createdAt: string; addresses?: BackendAddress[];
};
type Envelope<T> = { success: boolean; message?: string; data?: T };

function mapAddress(a: BackendAddress): Address {
  return { id: a.id, fullName: a.fullName, phone: a.mobile, addressLine: a.line1, area: a.area || '', city: a.city, district: a.district, state: a.state, pincode: a.pincode, isDefault: a.isDefault };
}
function mapUser(u: BackendUser): User {
  return { id: u.id, name: u.name, email: u.email, phone: u.mobile || '', isEmailVerified: u.isEmailVerified, createdAt: u.createdAt, addresses: (u.addresses || []).map(mapAddress) };
}

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, credentials: 'include', headers: { 'Content-Type': 'application/json', ...(init.headers || {}) } });
  const payload = await res.json().catch(() => ({})) as Envelope<T>;
  if (res.status === 401 && retry && path !== '/auth/refresh' && path !== '/auth/me') {
    try { await request('/auth/refresh', { method: 'POST', body: '{}' }, false); return request<T>(path, init, false); } catch { /* fall through */ }
  }
  if (!res.ok || !payload.success) throw new Error(payload.message || `Request failed (${res.status})`);
  return payload.data as T;
}

class AuthService {
  private currentUser: User | null = null;
  private listeners = new Set<AuthListener>();
  private pendingVerificationEmail: string | null = null;
  private currentOtpHint = '';

  constructor() { void this.restoreSession(); }
  private async restoreSession() {
    try { const data = await request<BackendUser>('/auth/me'); this.currentUser = mapUser(data); }
    catch { this.currentUser = null; }
    this.notify();
  }
  subscribe(listener: AuthListener) { this.listeners.add(listener); listener(this.currentUser); return () => this.listeners.delete(listener); }
  private notify() { const u = this.currentUser ? { ...this.currentUser, addresses: [...(this.currentUser.addresses || [])] } : null; this.listeners.forEach((l) => l(u)); }
  getUser() { return this.currentUser; }
  getCurrentUser() { return this.currentUser; }
  isAuthenticatedAndVerified() { return Boolean(this.currentUser?.isEmailVerified); }
  getPendingEmail() { return this.pendingVerificationEmail; }
  getCurrentOtpHint() { return this.currentOtpHint; }

  async loginWithCredentials(email: string, password: string) {
    try {
      const data = await request<{ user: BackendUser }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      this.currentUser = mapUser(data.user); this.pendingVerificationEmail = null; this.notify();
      return { success: true, user: this.currentUser };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unable to sign in';
      const requiresVerification = /verify/i.test(message);
      if (requiresVerification) this.pendingVerificationEmail = email.trim().toLowerCase();
      return { success: false, requiresVerification, message };
    }
  }

  async registerUser(data: { name: string; email: string; phone: string; password?: string }) {
    if (!data.password) throw new Error('Password is required');
    const result = await request<{ user: BackendUser; developmentOtp?: string }>('/auth/register', { method: 'POST', body: JSON.stringify({ name: data.name, email: data.email, mobile: data.phone, password: data.password }) });
    this.pendingVerificationEmail = data.email.trim().toLowerCase();
    this.currentOtpHint = result.developmentOtp || '';
    return { otpSent: true, mockOtp: this.currentOtpHint };
  }

  async verifyOtp(otp: string) {
    if (!this.pendingVerificationEmail) return { success: false, message: 'Verification email is missing.' };
    try {
      const result = await request<{ user: BackendUser }>('/auth/verify-email', { method: 'POST', body: JSON.stringify({ email: this.pendingVerificationEmail, otp }) });
      this.currentUser = mapUser(result.user); this.pendingVerificationEmail = null; this.currentOtpHint = ''; this.notify();
      return { success: true, message: 'Email verified successfully!' };
    } catch (e) { return { success: false, message: e instanceof Error ? e.message : 'OTP verification failed' }; }
  }

  async resendOtp() {
    if (!this.pendingVerificationEmail) throw new Error('Verification email is missing');
    const result = await request<{ developmentOtp?: string }>('/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email: this.pendingVerificationEmail }) });
    this.currentOtpHint = result.developmentOtp || '';
    return { mockOtp: this.currentOtpHint };
  }

  async logout() {
    try { await request('/auth/logout', { method: 'POST', body: '{}' }, false); } catch { /* clear client state anyway */ }
    this.currentUser = null; this.pendingVerificationEmail = null; this.currentOtpHint = ''; this.notify();
  }

  addAddress(addressData: Omit<Address, 'id'>): Address {
    if (!this.currentUser) throw new Error('Not authenticated');
    const tempId = `pending-${Date.now()}`;
    const optimistic = { ...addressData, id: tempId };
    if (optimistic.isDefault) (this.currentUser.addresses || []).forEach((a) => { a.isDefault = false; });
    this.currentUser.addresses = [...(this.currentUser.addresses || []), optimistic]; this.notify();
    void request<BackendAddress>('/addresses', { method: 'POST', body: JSON.stringify({ label: 'Home', fullName: addressData.fullName, mobile: addressData.phone, line1: addressData.addressLine, area: addressData.area, city: addressData.city, district: addressData.district, state: 'Tamil Nadu', pincode: addressData.pincode, isDefault: addressData.isDefault }) })
      .then((saved) => { if (!this.currentUser) return; this.currentUser.addresses = (this.currentUser.addresses || []).map((a) => a.id === tempId ? mapAddress(saved) : a); this.notify(); })
      .catch(() => void this.restoreSession());
    return optimistic;
  }

  updateAddress(id: string, updates: Partial<Omit<Address, 'id'>>) {
    if (!this.currentUser) return undefined;
    const original = this.currentUser.addresses?.find((a) => a.id === id); if (!original) return undefined;
    const merged = { ...original, ...updates };
    if (merged.isDefault) (this.currentUser.addresses || []).forEach((a) => { if (a.id !== id) a.isDefault = false; });
    this.currentUser.addresses = (this.currentUser.addresses || []).map((a) => a.id === id ? merged : a); this.notify();
    void request<BackendAddress>(`/addresses/${id}`, { method: 'PUT', body: JSON.stringify({ label: 'Home', fullName: merged.fullName, mobile: merged.phone, line1: merged.addressLine, area: merged.area, city: merged.city, district: merged.district, state: 'Tamil Nadu', pincode: merged.pincode, isDefault: merged.isDefault }) }).then((saved) => { if (!this.currentUser) return; this.currentUser.addresses = (this.currentUser.addresses || []).map((a) => a.id === id ? mapAddress(saved) : a); this.notify(); }).catch(() => void this.restoreSession());
    return merged;
  }

  removeAddress(id: string) {
    if (!this.currentUser) return false;
    const before = this.currentUser.addresses || []; if (!before.some((a) => a.id === id)) return false;
    this.currentUser.addresses = before.filter((a) => a.id !== id); if (this.currentUser.addresses.length && !this.currentUser.addresses.some((a) => a.isDefault)) this.currentUser.addresses[0].isDefault = true; this.notify();
    void request(`/addresses/${id}`, { method: 'DELETE' }).catch(() => void this.restoreSession()); return true;
  }

  setDefaultAddress(id: string) {
    if (!this.currentUser || !(this.currentUser.addresses || []).some((a) => a.id === id)) return false;
    this.currentUser.addresses = (this.currentUser.addresses || []).map((a) => ({ ...a, isDefault: a.id === id })); this.notify();
    void request(`/addresses/${id}/default`, { method: 'PATCH', body: '{}' }).catch(() => void this.restoreSession()); return true;
  }

  updateProfile(name: string, phone: string) {
    if (!this.currentUser) return; this.currentUser = { ...this.currentUser, name, phone }; this.notify();
  }

  async forgotPassword(email: string) { await request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }); }
  async resetPassword(email: string, otp: string, password: string) { await request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ email, otp, password }) }); }
}

export const authService = new AuthService();
