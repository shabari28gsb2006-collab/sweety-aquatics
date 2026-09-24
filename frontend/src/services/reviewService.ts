import { Review } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:4000/api' : '/api')).replace(/\/$/, '');
type Envelope<T> = { success: boolean; message?: string; data?: T };
type ReviewListener = (reviews: Review[]) => void;

type ReviewCreateInput = Omit<Review, 'id' | 'createdAt' | 'status' | 'productName' | 'customerName' | 'customerCity' | 'isVerifiedPurchase'> & {
  orderId: string;
  productId: string;
  rating: number;
  title: string;
  comment: string;
};

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  const payload = await response.json().catch(() => ({})) as Envelope<T>;
  if (response.status === 401 && retry && !path.includes('/auth/')) {
    try { const refreshPath = /(^|\/)admin(\/|$)/.test(path) ? '/auth/admin/refresh' : '/auth/refresh'; await request(refreshPath, { method: 'POST', body: '{}' }, false); return request<T>(path, init, false); } catch { /* original error below */ }
  }
  if (!response.ok || !payload.success) throw new Error(payload.message || `Request failed (${response.status})`);
  return payload.data as T;
}

class ReviewService {
  private reviews: Review[] = [];
  private listeners = new Set<ReviewListener>();

  private notify() { const list = [...this.reviews]; this.listeners.forEach((listener) => listener(list)); }
  subscribe(listener: ReviewListener) { this.listeners.add(listener); listener([...this.reviews]); return () => this.listeners.delete(listener); }

  private merge(incoming: Review[], replaceAll = false) {
    if (replaceAll) this.reviews = incoming;
    else {
      const map = new Map(this.reviews.map((review) => [review.id, review]));
      incoming.forEach((review) => map.set(review.id, review));
      this.reviews = [...map.values()].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }
    this.notify();
    return incoming;
  }

  getProductReviews(productId: string, includePending = false) {
    return this.reviews.filter((review) => review.productId === productId && (includePending || review.status === 'APPROVED'));
  }
  getReviewsForProduct(productId: string, includePending = false) { return this.getProductReviews(productId, includePending); }
  getAllReviews() { return [...this.reviews]; }
  getApprovedReviews() { return this.reviews.filter((review) => review.status === 'APPROVED' && review.isVerifiedPurchase); }
  getReviewForOrderProduct(orderId: string, productId: string) { return this.reviews.find((review) => review.orderId === orderId && review.productId === productId); }

  async refreshApproved(limit = 50) {
    const data = await request<Review[]>(`/reviews/approved?limit=${limit}`);
    return this.merge(data, false);
  }
  async refreshProduct(productId: string) {
    const data = await request<Review[]>(`/reviews/product/${encodeURIComponent(productId)}`);
    const others = this.reviews.filter((review) => review.productId !== productId || review.status !== 'APPROVED');
    this.reviews = [...others, ...data]; this.notify(); return data;
  }
  async refreshMine() {
    const data = await request<Review[]>('/reviews/mine');
    return this.merge(data, false);
  }
  async refreshAdmin() {
    const data = await request<Review[]>('/admin/reviews');
    return this.merge(data, true);
  }

  async submitReview(data: ReviewCreateInput) {
    const created = await request<Review>('/reviews', {
      method: 'POST',
      body: JSON.stringify({ orderId: data.orderId, productId: data.productId, rating: data.rating, title: data.title, comment: data.comment }),
    });
    this.merge([created]);
    return created;
  }

  async updateReviewStatus(id: string, status: 'APPROVED' | 'PENDING' | 'REJECTED') {
    const updated = await request<Review>(`/admin/reviews/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    this.merge([updated]); return updated;
  }
  async approveReview(id: string) { return this.updateReviewStatus(id, 'APPROVED'); }
  async rejectReview(id: string) { return this.updateReviewStatus(id, 'REJECTED'); }
  async replyToReview(id: string, sellerReply: string) {
    const updated = await request<Review>(`/admin/reviews/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ sellerReply }) });
    this.merge([updated]); return updated;
  }
  async deleteReview(id: string) {
    await request(`/admin/reviews/${encodeURIComponent(id)}`, { method: 'DELETE' });
    this.reviews = this.reviews.filter((review) => review.id !== id); this.notify();
  }
}

export const reviewService = new ReviewService();
