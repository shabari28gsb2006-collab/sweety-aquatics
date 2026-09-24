import { CareArticle } from '../types';
import { INITIAL_CARE_ARTICLES } from '../data/mockData';
const API = (import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:4000/api' : '/api')).replace(/\/$/, '');
class ArticleService {
  private articles: CareArticle[] = [...INITIAL_CARE_ARTICLES]; private listeners = new Set<() => void>();
  constructor() { void this.refresh(); }
  async refresh() { try { const response = await fetch(`${API}/customer-experience/care-articles`, { credentials: 'include' }); const body = await response.json().catch(() => ({})); if (!response.ok || !body.success || !Array.isArray(body.data)) throw new Error(body.message || 'Unable to load care articles'); if (body.data.length) this.articles = body.data; } catch (error) { console.warn('Using built-in guppy care guides while the API is unavailable.', error); } this.listeners.forEach(listener => listener()); return this.getAllArticles(); }
  subscribe(listener: () => void) { this.listeners.add(listener); return () => this.listeners.delete(listener); }
  getAllArticles() { return [...this.articles]; }
  getArticleBySlug(slug: string) { return this.articles.find(article => article.slug === slug); }
  getByCategory(category: CareArticle['category']) { return this.articles.filter(article => article.category === category); }
}
export const articleService = new ArticleService();
