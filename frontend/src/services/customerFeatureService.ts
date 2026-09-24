import { Product } from '../types';

const API = (import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:4000/api' : '/api')).replace(/\/$/, '');
type Envelope<T> = { success: boolean; message?: string; data?: T };
async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const response = await fetch(`${API}${path}`, { ...init, credentials: 'include', headers: { 'Content-Type': 'application/json', ...(init.headers || {}) } });
  const payload = await response.json().catch(() => ({})) as Envelope<T>;
  if (response.status === 401 && retry) {
    try { await request('/auth/refresh', { method: 'POST', body: '{}' }, false); return request<T>(path, init, false); } catch { /* use original error */ }
  }
  if (!response.ok || !payload.success) throw new Error(payload.message || `Request failed (${response.status})`);
  return payload.data as T;
}

type BackendAquarium = { id: string; sourceOrderId?: string | null; productId?: string | null; fishName?: string | null; variety?: string | null; purchasedAt?: string | null; createdAt: string; product?: { name: string; images?: Array<{ url: string }> } | null; reminders?: CareReminder[] };
export interface CareReminder { id: string; aquariumProfileId?: string | null; type: 'FEEDING' | 'WATER_CHANGE' | 'CARE'; title: string; schedule?: string | null; isActive: boolean; nextDueAt?: string | null; }
export interface AquariumProfile { id: string; userId: string; orderId: string; productId: string; productName: string; productImage: string; nickname: string; addedAt: string; feedingReminder: boolean; waterCareReminder: boolean; reminders: CareReminder[]; }
export interface Invoice { invoiceNumber: string; issuedAt: string; business: { name: string }; customer: { name: string; email: string; mobile?: string }; deliveryAddress: Record<string, unknown>; items: Array<{ name: string; quantity: number; unitPrice: number; lineTotal: number }>; subtotal: number; shippingCharge: number; discount: number; total: number; currency: string; paymentProvider: string; paymentId?: string | null; }
export interface CustomerNotification { id: string; title: string; message: string; isRead: boolean; createdAt: string; }
export interface SupportTicket { id: string; subject: string; message: string; sellerReply?: string | null; status: string; createdAt: string; order?: { orderNumber: string } | null; }

function mapAquarium(row: BackendAquarium): AquariumProfile {
  const reminders = row.reminders || [];
  return { id: row.id, userId: '', orderId: row.sourceOrderId || '', productId: row.productId || '', productName: row.product?.name || row.variety || 'Guppy', productImage: row.product?.images?.[0]?.url || '', nickname: row.fishName || row.variety || row.product?.name || 'My Fish', addedAt: row.purchasedAt || row.createdAt, feedingReminder: reminders.some(r => r.type === 'FEEDING' && r.isActive), waterCareReminder: reminders.some(r => r.type === 'WATER_CHANGE' && r.isActive), reminders };
}

class CustomerFeatureService {
  private recentIds: string[] = [];
  private alerts = new Set<string>();
  private adminAlertCounts = new Map<string, number>();
  async addRecentlyViewed(product: Product) { try { await request(`/customer-experience/recently-viewed/${encodeURIComponent(product.id)}`, { method: 'PUT', body: '{}' }); } catch { /* anonymous views stay in memory */ } this.recentIds = [product.id, ...this.recentIds.filter(id => id !== product.id)].slice(0, 8); }
  getRecentlyViewedIds() { return [...this.recentIds]; }
  async loadRecentlyViewedIds() { try { const rows = await request<Array<{ productId: string }>>('/customer-experience/recently-viewed'); this.recentIds = rows.map(row => row.productId); } catch { this.recentIds = []; } return this.getRecentlyViewedIds(); }
  async loadAvailabilityAlerts() { const rows = await request<Array<{ productId: string }>>('/customer-experience/availability-alerts'); this.alerts = new Set(rows.map(row => row.productId)); return [...this.alerts]; }
  isSubscribed(productId: string) { return this.alerts.has(productId); }
  async subscribeAvailability(product: Product) { await request(`/customer-experience/availability-alerts/${encodeURIComponent(product.id)}`, { method: 'POST', body: '{}' }); this.alerts.add(product.id); }
  async unsubscribeAvailability(productId: string) { await request(`/customer-experience/availability-alerts/${encodeURIComponent(productId)}`, { method: 'DELETE' }); this.alerts.delete(productId); }
  async getAquariumProfiles(): Promise<AquariumProfile[]> { return (await request<BackendAquarium[]>('/customer-experience/aquarium')).map(mapAquarium); }
  async updateAquariumProfile(profile: AquariumProfile, updates: { nickname?: string }) { const row = await request<BackendAquarium>(`/customer-experience/aquarium/${profile.id}`, { method: 'PATCH', body: JSON.stringify({ fishName: updates.nickname }) }); return mapAquarium(row); }
  async setReminder(profile: AquariumProfile, type: 'FEEDING' | 'WATER_CHANGE', enabled: boolean) {
    const existing = profile.reminders.find(r => r.type === type);
    if (existing) return request<CareReminder>(`/customer-experience/reminders/${existing.id}`, { method: 'PATCH', body: JSON.stringify({ isActive: enabled }) });
    return request<CareReminder>('/customer-experience/reminders', { method: 'POST', body: JSON.stringify({ aquariumProfileId: profile.id, type, title: type === 'FEEDING' ? `Feed ${profile.nickname}` : `Water change for ${profile.nickname}`, schedule: type === 'FEEDING' ? 'Daily' : 'Weekly', isActive: enabled }) });
  }
  async buyAgain(orderId: string) { return request(`/orders/${encodeURIComponent(orderId)}/buy-again`, { method: 'POST', body: '{}' }); }
  async getInvoice(orderId: string) { return request<Invoice>(`/orders/${encodeURIComponent(orderId)}/invoice`); }
  async createSupportTicket(input: { orderId?: string; subject: string; message: string }) { return request('/customer-experience/support-tickets', { method: 'POST', body: JSON.stringify(input) }); }
  async getNotifications() { return request<CustomerNotification[]>('/customer-experience/notifications'); }
  async markAllNotificationsRead() { return request('/customer-experience/notifications/read-all', { method: 'PATCH', body: '{}' }); }
  async getSupportTickets() { return request<SupportTicket[]>('/customer-experience/support-tickets'); }
  getAlertCount(productId: string) { return this.adminAlertCounts.get(productId) || 0; }
  async loadAdminAlertCounts() { const rows = await request<Array<{ productId: string; count: number }>>('/admin/customer-experience/availability-alerts/counts'); this.adminAlertCounts = new Map(rows.map(row => [row.productId, row.count])); return rows; }
}
export const customerFeatureService = new CustomerFeatureService();
