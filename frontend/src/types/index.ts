export type ProductCategory = 'guppies' | 'fish-food' | 'combo-packs' | 'wholesale';

export type ProductStatus = 'ACTIVE' | 'OUT_OF_STOCK' | 'COMING_SOON' | 'DRAFT' | 'ARCHIVED';

export interface GuppyDetails {
  variety: string;
  colour: string;
  gender: 'Male' | 'Female' | 'Pair';
  size: string; // e.g. "2.5 - 3.5 cm"
  age: string; // e.g. "3 - 4 months"
  suggestedTemperature: string; // e.g. "24°C - 28°C"
  suggestedPh: string; // e.g. "6.8 - 7.8"
  waterHardness?: string;
  breedingDifficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface FishFoodDetails {
  feedType: 'Micro Pellets' | 'Flakes' | 'Freeze-Dried' | 'Baby Brine Shrimp Feed';
  netWeight: string; // e.g. "50g", "100g"
  suitableFor: string; // e.g. "Fry, Juvenile, and Adult Guppies"
  keyIngredients: string[];
  proteinContent: string; // e.g. "45% min"
  crudeFat: string; // e.g. "6% min"
  feedingGuide: string;
}

export interface ComboItem {
  name: string;
  quantity: string;
  thumbnail: string;
}

export interface ComboDetails {
  includedItems: ComboItem[];
  originalPrice: number;
  savingsAmount: number;
  badgeText?: string;
}

export interface Product {
  id: string;
  sku?: string;
  name: string;
  slug: string;
  category: ProductCategory;
  price: number;
  regularPrice?: number;
  mrp?: number;
  offerPrice?: number;
  offerEndsAt?: string;
  stock: number;
  status: ProductStatus;
  images: string[];
  thumbnail: string;
  shortDescription: string;
  description: string;
  rating: number;
  sellerRating?: number;
  sellerRatingCount?: number;
  reviewCount: number;
  isFeatured?: boolean;
  guppyDetails?: GuppyDetails;
  fishFoodDetails?: FishFoodDetails;
  comboDetails?: ComboDetails;
  careGuidelines?: string[];
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  isEmailVerified: boolean;
  createdAt: string;
  addresses: Address[];
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine: string;
  area: string;
  city: string;
  district: string;
  state: string; // Must be 'Tamil Nadu' for delivery
  pincode: string;
  isDefault?: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
}

export type OrderStatus =
  | 'ORDER_PLACED'
  | 'PAYMENT_CONFIRMED'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'PAYMENT_FAILED'
  | 'CANCELLED'
  | 'DELIVERY_FAILED'
  | 'RETURNED';

export interface TrackingEvent {
  id: string;
  status: OrderStatus;
  title: string;
  location: string;
  description: string;
  timestamp: string;
}

export interface Shipment {
  id: string;
  courierName: string; // e.g. "Professional Courier"
  awbNumber: string;
  trackingUrl: string;
  shippedDate?: string;
  estimatedDelivery?: string;
  currentStatus: OrderStatus;
  trackingEvents: TrackingEvent[];
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  category: ProductCategory;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  guppyDetailsSummary?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "SB-2026-00124"
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  deliveryAddress: Address;
  paymentMethod: 'UPI';
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED';
  paymentId?: string;
  orderStatus: OrderStatus;
  createdAt: string;
  packingScheduledAt?: string;
  packedAt?: string;
  dispatchedAt?: string;
  receivedAt?: string;
  receivedConfirmedBy?: 'SELLER' | 'CUSTOMER';
  shipment?: Shipment;
}

export interface ServiceablePincode {
  id: string;
  pincode: string;
  area: string;
  district: string;
  state: string; // 'Tamil Nadu'
  courier: string; // 'Professional Courier'
  isActive: boolean;
  updatedDate: string;
  estimatedDays?: string;
}

export interface Review {
  id: string;
  userId?: string;
  orderId?: string;
  productId: string;
  productName: string;
  customerName: string;
  customerCity?: string;
  rating: number;
  title: string;
  comment: string;
  productQuality?: number;
  packingRating?: number;
  deliveryRating?: number;
  imageUrl?: string;
  sellerReply?: string;
  isVerifiedPurchase: boolean;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  createdAt: string;
}

export interface CareArticle {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: 'Breeding' | 'Seasonal' | 'Beginner' | 'Nutrition' | 'Acclimation';
  readTime: string;
  bannerImage: string;
  summary: string;
  content: {
    heading: string;
    body: string[];
    tips?: string[];
  }[];
  publishedAt: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}
