import { Order } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:4000/api' : '/api')).replace(/\/$/, '');
type Envelope<T> = { success: boolean; message?: string; data?: T };
type OrderListener = (orders: Order[]) => void;

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  const payload = await response.json().catch(() => ({})) as Envelope<T>;
  if (response.status === 401 && retry && !path.includes('/auth/')) {
    try {
      const refreshPath = /(^|\/)admin(\/|$)/.test(path) ? '/auth/admin/refresh' : '/auth/refresh';
      await request(refreshPath, { method: 'POST', body: '{}' }, false);
      return request<T>(path, init, false);
    } catch { /* continue with original error */ }
  }
  if (!response.ok || !payload.success) throw new Error(payload.message || `Request failed (${response.status})`);
  return payload.data as T;
}

class OrderService {
  private orders: Order[] = [];
  private listeners = new Set<OrderListener>();

  private notify() {
    const snapshot = this.orders.map((order) => ({ ...order, items: [...order.items] }));
    this.listeners.forEach((listener) => listener(snapshot));
  }

  subscribe(listener: OrderListener): () => void {
    this.listeners.add(listener);
    listener([...this.orders]);
    return () => this.listeners.delete(listener);
  }

  getAllOrders() { return [...this.orders]; }
  getOrdersByUserId(userId: string) { return this.orders.filter((order) => order.userId === userId); }
  getOrdersByUser(userId: string) { return this.getOrdersByUserId(userId); }
  getOrderById(id: string) { return this.orders.find((order) => order.id === id || order.orderNumber === id); }

  private upsert(order: Order) {
    const index = this.orders.findIndex((item) => item.id === order.id);
    if (index >= 0) this.orders[index] = order;
    else this.orders.unshift(order);
    this.notify();
    return order;
  }

  async refreshCustomerOrders() {
    const orders = await request<Order[]>('/orders');
    this.orders = orders;
    this.notify();
    return orders;
  }

  async refreshAdminOrders() {
    const orders = await request<Order[]>('/admin/orders');
    this.orders = orders;
    this.notify();
    return orders;
  }

  async refreshOrder(orderId: string) {
    const order = await request<Order>(`/orders/${encodeURIComponent(orderId)}`);
    return this.upsert(order);
  }

  async schedulePacking(orderId: string, packingDateTime: string) {
    const order = await request<Order>(`/admin/orders/${encodeURIComponent(orderId)}/packing`, {
      method: 'PATCH', body: JSON.stringify({ packingScheduledAt: packingDateTime }),
    });
    return this.upsert(order);
  }

  async markDispatched(orderId: string, shipmentData: { courierName: string; awbNumber?: string; trackingUrl?: string; estimatedDelivery?: string; shippedDate?: string }) {
    const body: Record<string, unknown> = {
      courierName: shipmentData.courierName,
      trackingNumber: shipmentData.awbNumber || undefined,
      trackingUrl: shipmentData.trackingUrl || undefined,
    };
    if (shipmentData.estimatedDelivery) body.estimatedDeliveryTo = shipmentData.estimatedDelivery;
    const order = await request<Order>(`/admin/orders/${encodeURIComponent(orderId)}/dispatch`, { method: 'PATCH', body: JSON.stringify(body) });
    return this.upsert(order);
  }

  async updateTrackingDetails(orderId: string, data: { courierName?: string; awbNumber: string; trackingUrl?: string; estimatedDelivery?: string }) {
    const body: Record<string, unknown> = {
      courierName: data.courierName,
      trackingNumber: data.awbNumber,
      trackingUrl: data.trackingUrl || undefined,
    };
    if (data.estimatedDelivery) body.estimatedDeliveryTo = data.estimatedDelivery;
    const order = await request<Order>(`/admin/orders/${encodeURIComponent(orderId)}/tracking`, { method: 'PATCH', body: JSON.stringify(body) });
    return this.upsert(order);
  }

  async confirmReceived(orderId: string, confirmedBy: 'SELLER' | 'CUSTOMER') {
    const path = confirmedBy === 'SELLER'
      ? `/admin/orders/${encodeURIComponent(orderId)}/received`
      : `/orders/${encodeURIComponent(orderId)}/received`;
    const order = await request<Order>(path, { method: 'PATCH', body: '{}' });
    return this.upsert(order);
  }
}

export const orderService = new OrderService();
