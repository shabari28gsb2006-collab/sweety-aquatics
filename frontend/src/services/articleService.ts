import { CareArticle } from '../types';
const API = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api').replace(/\/$/, '');
class ArticleService {
  private articles: CareArticle[] = []; private listeners = new Set<() => void>();
  constructor() { void this.refresh(); }
  async refresh() { const response = await fetch(`${API}/customer-experience/care-articles`, { credentials: 'include' }); const body = await response.json().catch(() => ({})); if (!response.ok || !body.success) throw new Error(body.message || 'Unable to load care articles'); this.articles = body.data; this.listeners.forEach(listener => listener()); return this.getAllArticles(); }
  subscribe(listener: () => void) { this.listeners.add(listener); return () => this.listeners.delete(listener); }
  getAllArticles() { return [...this.articles]; }
  getArticleBySlug(slug: string) { return this.articles.find(article => article.slug === slug); }
  getByCategory(category: CareArticle['category']) { return this.articles.filter(article => article.category === category); }
}
export const articleService = new ArticleService();
