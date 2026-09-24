import { Product, ProductCategory, ProductStatus } from "../types";

const API = (
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:4000/api" : "/api")
).replace(/\/$/, "");
type Listener = (products: Product[]) => void;
type Envelope<T> = { success: boolean; message?: string; data?: T };
async function request<T>(
  path: string,
  init: RequestInit = {},
  retry = true,
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
  });
  const body = (await res.json().catch(() => ({}))) as Envelope<T>;
  if (res.status === 401 && retry) {
    try {
      const refreshPath = /(^|\/)admin(\/|$)/.test(path)
        ? "/auth/admin/refresh"
        : "/auth/refresh";
      await request(refreshPath, { method: "POST", body: "{}" }, false);
      return request<T>(path, init, false);
    } catch {
      /* original error below */
    }
  }
  if (!res.ok || !body.success)
    throw new Error(body.message || `Product request failed (${res.status})`);
  return body.data as T;
}
const categoryFromDb = (value: string): ProductCategory =>
  value === "GUPPY"
    ? "guppies"
    : value === "FISH_FOOD"
      ? "fish-food"
      : value === "COMBO_PACK"
        ? "combo-packs"
        : "wholesale";
const categoryToDb = (value: ProductCategory) =>
  value === "guppies"
    ? "GUPPY"
    : value === "fish-food"
      ? "FISH_FOOD"
      : value === "combo-packs"
        ? "COMBO_PACK"
        : "WHOLESALE";
const imageUrl = (url: string) =>
  url.startsWith("/uploads/") ? `${API.replace(/\/api$/, "")}${url}` : url;
function mapProduct(p: any): Product {
  const urls = (p.images || [])
    .map((item: any) => imageUrl(item.url))
    .filter(Boolean);
  const reviews = p.reviews || [];
  const regularPrice = Number(p.price);
  const offerEndsAt = p.offerEndsAt ? String(p.offerEndsAt) : undefined;
  const offerPrice = p.offerPrice == null ? undefined : Number(p.offerPrice);
  const offerActive =
    offerPrice != null &&
    offerEndsAt != null &&
    new Date(offerEndsAt).getTime() > Date.now();
  return {
    id: p.id,
    sku: p.sku || undefined,
    name: p.name,
    slug: p.slug,
    category: categoryFromDb(p.category),
    price: offerActive ? offerPrice : regularPrice,
    regularPrice,
    mrp: p.mrp == null ? undefined : Number(p.mrp),
    offerPrice,
    offerEndsAt,
    stock: p.stock,
    status: p.status,
    images: urls,
    thumbnail: imageUrl(
      (p.images || []).find((item: any) => item.isPrimary)?.url ||
        urls[0] ||
        "",
    ),
    shortDescription: p.shortDescription || "",
    description: p.description || "",
    rating: reviews.length
      ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) /
        reviews.length
      : 0,
    sellerRating: p.sellerRating == null ? undefined : Number(p.sellerRating),
    sellerRatingCount: Number(p.sellerRatingCount || 0),
    reviewCount: reviews.length,
    isFeatured: p.isFeatured,
    updatedAt: p.updatedAt,
    guppyDetails:
      p.category === "GUPPY"
        ? {
            variety: p.variety || "",
            colour: p.color || "",
            gender: p.gender || "Pair",
            size: p.size || "",
            age: p.age || "",
            suggestedTemperature: p.temperature || "",
            suggestedPh: p.ph || "",
          }
        : undefined,
    fishFoodDetails:
      p.category === "FISH_FOOD"
        ? {
            feedType: "Micro Pellets",
            netWeight: p.foodPackSize || "",
            suitableFor: "Guppies",
            keyIngredients: (p.foodIngredients || "")
              .split(",")
              .filter(Boolean),
            proteinContent: "",
            crudeFat: "",
            feedingGuide: p.feedingDirections || "",
          }
        : undefined,
  } as Product;
}
function toDb(p: Partial<Product>) {
  return {
    name: p.name,
    slug: p.slug,
    category: categoryToDb(p.category!),
    status: p.status,
    description: p.description,
    shortDescription: p.shortDescription || null,
    price: p.regularPrice ?? p.price,
    mrp: p.mrp || null,
    offerPrice: p.offerPrice || null,
    offerEndsAt: p.offerEndsAt || null,
    sellerRating: p.sellerRating ?? null,
    sellerRatingCount: p.sellerRatingCount ?? 0,
    stock: p.stock,
    isFeatured: !!p.isFeatured,
    isBestSeller: false,
    isNewArrival: false,
    variety: p.guppyDetails?.variety || null,
    color: p.guppyDetails?.colour || null,
    gender: p.guppyDetails?.gender || null,
    size: p.guppyDetails?.size || null,
    age: p.guppyDetails?.age || null,
    temperature: p.guppyDetails?.suggestedTemperature || null,
    ph: p.guppyDetails?.suggestedPh || null,
    foodPackSize: p.fishFoodDetails?.netWeight || null,
    foodIngredients: p.fishFoodDetails?.keyIngredients?.join(", ") || null,
    feedingDirections: p.fishFoodDetails?.feedingGuide || null,
    images: (p.images || []).map((url, index) => ({
      url: url.startsWith(API.replace(/\/api$/, ""))
        ? url.slice(API.replace(/\/api$/, "").length)
        : url,
      isPrimary: url === p.thumbnail || index === 0,
      sortOrder: index,
    })),
  };
}

class ProductService {
  private products: Product[] = [];
  private listeners = new Set<Listener>();
  private offerTimer: number | undefined;
  constructor() {
    void this.refreshPublic();
  }
  private notify() {
    this.listeners.forEach((listener) => listener([...this.products]));
  }
  private scheduleOfferExpiry() {
    if (this.offerTimer) window.clearTimeout(this.offerTimer);
    const now = Date.now();
    const nextExpiry = this.products
      .map((product) =>
        product.offerEndsAt ? new Date(product.offerEndsAt).getTime() : 0,
      )
      .filter((time) => time > now)
      .sort((a, b) => a - b)[0];
    if (!nextExpiry) return;
    this.offerTimer = window.setTimeout(
      () => {
        const currentTime = Date.now();
        this.products = this.products.map((product) =>
          product.offerEndsAt &&
          new Date(product.offerEndsAt).getTime() <= currentTime
            ? { ...product, price: product.regularPrice ?? product.price }
            : product,
        );
        this.notify();
        this.scheduleOfferExpiry();
      },
      Math.min(nextExpiry - now + 250, 2_147_000_000),
    );
  }
  private set(rows: any[]) {
    this.products = rows.map(mapProduct);
    this.scheduleOfferExpiry();
    this.notify();
    return this.getAllProducts(true);
  }
  subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener([...this.products]);
    return () => this.listeners.delete(listener);
  }
  async refreshPublic() {
    return this.set(await request<any[]>("/products"));
  }
  async refreshAdmin() {
    return this.set(await request<any[]>("/admin/products"));
  }
  getAllProducts(includeHidden = false) {
    return includeHidden
      ? [...this.products]
      : this.products.filter(
          (p) => p.status !== "DRAFT" && p.status !== "ARCHIVED",
        );
  }
  getByCategory(category: ProductCategory, includeHidden = false) {
    return this.getAllProducts(includeHidden).filter(
      (p) => p.category === category,
    );
  }
  getFeaturedGuppies() {
    return this.getAllProducts().filter(
      (p) => p.category === "guppies" && p.isFeatured,
    );
  }
  getComboPacks() {
    return this.getByCategory("combo-packs");
  }
  getFishFood() {
    return this.getByCategory("fish-food");
  }
  getBySlug(slug: string) {
    return this.products.find((p) => p.slug === slug);
  }
  getById(id: string) {
    return this.products.find((p) => p.id === id);
  }
  getProductById(id: string) {
    return this.getById(id);
  }
  searchProducts(query: string, category?: ProductCategory) {
    const q = query.toLowerCase().trim();
    return this.getAllProducts().filter(
      (p) =>
        (!category || p.category === category) &&
        (!q ||
          [
            p.name,
            p.shortDescription,
            p.description,
            p.guppyDetails?.variety,
            p.guppyDetails?.colour,
          ].some((value) => value?.toLowerCase().includes(q))),
    );
  }
  async createProduct(data: Omit<Product, "id" | "updatedAt">) {
    const product = mapProduct(
      await request("/admin/products", {
        method: "POST",
        body: JSON.stringify(toDb(data)),
      }),
    );
    this.products.unshift(product);
    this.scheduleOfferExpiry();
    this.notify();
    return product;
  }
  async updateProduct(id: string, updates: Partial<Product>) {
    const current = this.getById(id);
    if (!current) throw new Error("Product not found");
    const product = mapProduct(
      await request(`/admin/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(toDb({ ...current, ...updates })),
      }),
    );
    this.products = this.products.map((item) =>
      item.id === id ? product : item,
    );
    this.scheduleOfferExpiry();
    this.notify();
    return product;
  }
  async updateStock(id: string, stock: number) {
    const current = this.getById(id);
    if (!current) throw new Error("Product not found");
    return this.updateProduct(id, {
      stock: Math.max(0, stock),
      status:
        stock <= 0 && current.status === "ACTIVE"
          ? "OUT_OF_STOCK"
          : stock > 0 && current.status === "OUT_OF_STOCK"
            ? "ACTIVE"
            : current.status,
    });
  }
  async duplicateProduct(id: string) {
    const product = mapProduct(
      await request(`/admin/products/${id}/duplicate`, {
        method: "POST",
        body: "{}",
      }),
    );
    this.products.unshift(product);
    this.scheduleOfferExpiry();
    this.notify();
    return product;
  }
  async bulkUpdate(
    ids: string[],
    change: {
      status?: ProductStatus;
      stockDelta?: number;
      pricePercent?: number;
    },
  ) {
    const result = await request<{ updated: number }>("/admin/products/bulk", {
      method: "PATCH",
      body: JSON.stringify({ ids, ...change }),
    });
    await this.refreshAdmin();
    return result.updated;
  }
  bulkUpdateStatus(ids: string[], status: ProductStatus) {
    return this.bulkUpdate(ids, { status });
  }
  bulkAdjustPrice(ids: string[], pricePercent: number) {
    return this.bulkUpdate(ids, { pricePercent });
  }
  bulkAdjustStock(ids: string[], stockDelta: number) {
    return this.bulkUpdate(ids, { stockDelta });
  }
  async deleteProduct(id: string) {
    await request(`/admin/products/${id}`, { method: "DELETE" });
    await this.refreshAdmin();
    return true;
  }
  async uploadImage(dataUrl: string) {
    return request<{ url: string }>("/admin/products/images", {
      method: "POST",
      body: JSON.stringify({ dataUrl }),
    });
  }
}
export const productService = new ProductService();
