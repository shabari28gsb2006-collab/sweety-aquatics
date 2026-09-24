import { CartItem, Product, ProductCategory } from '../types';
import { authService } from './authService';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:4000/api' : '/api')).replace(/\/$/, '');
type CartListener = (items: CartItem[]) => void;
type Envelope<T> = { success: boolean; message?: string; data?: T };

type BackendProduct = any;
type BackendCart = { id: string; items: Array<{ id: string; productId: string; quantity: number; product: BackendProduct }> };

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, credentials: 'include', headers: { 'Content-Type': 'application/json', ...(init.headers || {}) } });
  const payload = await res.json().catch(() => ({})) as Envelope<T>;
  if (res.status === 401 && retry) {
    try {
      await fetch(`${API_BASE_URL}/auth/refresh`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      return request<T>(path, init, false);
    } catch { /* handled below */ }
  }
  if (!res.ok || !payload.success) throw new Error(payload.message || `Cart request failed (${res.status})`);
  return payload.data as T;
}

function category(value: string): ProductCategory {
  if (value === 'GUPPY') return 'guppies';
  if (value === 'FISH_FOOD') return 'fish-food';
  if (value === 'COMBO_PACK') return 'combo-packs';
  return 'wholesale';
}
function mapProduct(p: BackendProduct): Product {
  const urls = (p.images || []).map((i: any) => i.url).filter(Boolean);
  const regularPrice = Number(p.price);
  const offerEndsAt = p.offerEndsAt ? String(p.offerEndsAt) : undefined;
  const offerPrice = p.offerPrice == null ? undefined : Number(p.offerPrice);
  const offerActive = offerPrice != null && offerEndsAt != null && new Date(offerEndsAt).getTime() > Date.now();
  return {
    id: p.id, name: p.name, slug: p.slug, category: category(p.category), price: offerActive ? offerPrice : regularPrice, regularPrice, offerPrice, offerEndsAt, mrp: p.mrp == null ? undefined : Number(p.mrp),
    stock: p.stock, status: p.status, images: urls, thumbnail: (p.images || []).find((i: any) => i.isPrimary)?.url || urls[0] || '',
    shortDescription: p.shortDescription || '', description: p.description || '', rating: Number(p.rating || 0), reviewCount: Number(p.reviewCount || 0),
    isFeatured: Boolean(p.isFeatured), updatedAt: p.updatedAt || new Date().toISOString(),
    guppyDetails: p.category === 'GUPPY' ? { variety: p.variety || '', colour: p.color || '', gender: (p.gender || 'Pair') as any, size: p.size || '', age: p.age || '', suggestedTemperature: p.temperature || '', suggestedPh: p.ph || '' } : undefined,
  };
}
function mapCart(cart: BackendCart): CartItem[] {
  return cart.items.map((item) => ({ id: item.id, productId: item.productId, quantity: item.quantity, product: mapProduct(item.product) }));
}

class CartService {
  private items: CartItem[] = [];
  private listeners = new Set<CartListener>();
  private quantityTimers = new Map<string, number>();
  private revisions = new Map<string, number>();
  private operationQueues = new Map<string, Promise<void>>();
  public readonly standardShippingFee = 60;
  public readonly freeShippingThreshold = 999;

  constructor() {
    authService.subscribe((user) => {
      if (user?.isEmailVerified) void this.sync();
      else { this.items = []; this.notify(); }
    });
  }
  private notify() { const list = [...this.items]; this.listeners.forEach((l) => l(list)); }
  private setFromBackend(cart: BackendCart) { this.items = mapCart(cart); this.notify(); }
  private nextRevision(productId: string) { const revision = (this.revisions.get(productId) || 0) + 1; this.revisions.set(productId, revision); return revision; }
  private reconcileProduct(cart: BackendCart, productId: string, revision: number) {
    if (this.revisions.get(productId) !== revision) return;
    const backendItem = mapCart(cart).find((item) => item.productId === productId);
    this.items = backendItem ? this.items.some((item) => item.productId === productId) ? this.items.map((item) => item.productId === productId ? backendItem : item) : [...this.items, backendItem] : this.items.filter((item) => item.productId !== productId);
    this.notify();
  }
  private enqueue(productId: string, operation: () => Promise<void>) {
    const previous = this.operationQueues.get(productId) || Promise.resolve();
    const next = previous.catch(() => undefined).then(operation).finally(() => { if (this.operationQueues.get(productId) === next) this.operationQueues.delete(productId); });
    this.operationQueues.set(productId, next);
    return next;
  }
  async sync() {
    if (!authService.isAuthenticatedAndVerified()) { this.items = []; this.notify(); return; }
    try { this.setFromBackend(await request<BackendCart>('/cart')); } catch { /* preserve the current cart during temporary network failures */ }
  }
  subscribe(listener: CartListener) { this.listeners.add(listener); listener([...this.items]); return () => this.listeners.delete(listener); }
  getItems() { return [...this.items]; }
  getItemCount() { return this.items.reduce((s, i) => s + i.quantity, 0); }
  getSubtotal() { return this.items.reduce((s, i) => s + i.product.price * i.quantity, 0); }
  getShippingFee(subtotal = this.getSubtotal()) { return subtotal <= 0 || subtotal >= this.freeShippingThreshold ? 0 : this.standardShippingFee; }
  getTotalAmount() { const subtotal = this.getSubtotal(); return subtotal + this.getShippingFee(subtotal); }

  async addItem(product: Product, quantity = 1): Promise<{ success: boolean; requiresAuth?: boolean; message?: string }> {
    if (!authService.isAuthenticatedAndVerified()) return { success: false, requiresAuth: true, message: 'Sign in and verify your email to continue shopping.' };
    if (product.status !== 'ACTIVE' || product.stock <= 0) return { success: false, message: 'This product is not currently available.' };
    const previous = this.items.map((item) => ({ ...item }));
    const existing = this.items.find((item) => item.productId === product.id);
    const optimisticQuantity = (existing?.quantity || 0) + quantity;
    if (optimisticQuantity > product.stock) return { success: false, message: 'Requested quantity exceeds available stock' };
    const revision = this.nextRevision(product.id);
    this.items = existing ? this.items.map((item) => item.productId === product.id ? { ...item, quantity: optimisticQuantity } : item) : [...this.items, { id: `pending-${product.id}`, productId: product.id, product, quantity }];
    this.notify();
    try {
      await this.enqueue(product.id, async () => {
        const cart = await request<BackendCart>('/cart/items', { method: 'POST', body: JSON.stringify({ productId: product.id, quantity }) });
        this.reconcileProduct(cart, product.id, revision);
      });
      return { success: true, message: `Added ${product.name} to your cart!` };
    } catch (e) { if (this.revisions.get(product.id) === revision) { this.items = previous; this.notify(); } return { success: false, message: e instanceof Error ? e.message : 'Unable to add item' }; }
  }
  updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) return this.removeItem(productId);
    const item = this.items.find((entry) => entry.productId === productId);
    if (!item || quantity > item.product.stock) return Promise.resolve();
    const revision = this.nextRevision(productId);
    this.items = this.items.map((entry) => entry.productId === productId ? { ...entry, quantity } : entry);
    this.notify();
    const existingTimer = this.quantityTimers.get(productId);
    if (existingTimer) window.clearTimeout(existingTimer);
    const timer = window.setTimeout(() => {
      this.quantityTimers.delete(productId);
      void this.enqueue(productId, async () => {
        try {
          const cart = await request<BackendCart>(`/cart/items/${productId}`, { method: 'PATCH', body: JSON.stringify({ quantity }) });
          this.reconcileProduct(cart, productId, revision);
        } catch { if (this.revisions.get(productId) === revision) await this.sync(); }
      });
    }, 180);
    this.quantityTimers.set(productId, timer);
    return Promise.resolve();
  }
  async removeItem(productId: string) {
    const previous = this.items.map((item) => ({ ...item }));
    const timer = this.quantityTimers.get(productId); if (timer) window.clearTimeout(timer); this.quantityTimers.delete(productId);
    const revision = this.nextRevision(productId);
    this.items = this.items.filter((item) => item.productId !== productId); this.notify();
    try { await this.enqueue(productId, async () => { const cart = await request<BackendCart>(`/cart/items/${productId}`, { method: 'DELETE' }); this.reconcileProduct(cart, productId, revision); }); }
    catch { if (this.revisions.get(productId) === revision) { this.items = previous; this.notify(); } }
  }
  async clearCart() {
    if (!authService.isAuthenticatedAndVerified()) { this.items = []; this.notify(); return; }
    try { this.setFromBackend(await request<BackendCart>('/cart', { method: 'DELETE' })); }
    catch { this.items = []; this.notify(); }
  }
}
export const cartService = new CartService();
