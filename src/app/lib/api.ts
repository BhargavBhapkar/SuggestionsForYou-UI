const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const TOKEN_KEY = "sfy_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data as T;
}

function toQuery(params?: Record<string, string | number | undefined>): string {
  if (!params) return "";
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

// ─── Types (mirrors the backend Mongoose schemas) ──────────────────────────

export interface StoreOffer {
  name: string; abbr: string; color: string;
  price: number; originalPrice: number;
  inStock: boolean; verified: boolean;
  deliveryLabel: string; deliveryTime: string;
  offer?: string; cashback?: string; coupon?: string;
  rating: number; reviews: number;
  badge?: string; lowestEver?: boolean;
  url?: string;
}

export interface PricePoint {
  day: string; amazon: number; flipkart: number; croma: number;
}

export interface Spec {
  label: string; value: string;
}

export interface Product {
  _id: string;
  name: string; brand: string; category: string; image: string;
  rating: number; reviews: number;
  lowestPrice: number; originalPrice: number; discount: number;
  badge?: string;
  tags: string[];
  inStock: boolean;
  stores: StoreOffer[];
  aiScore?: number; aiReason?: string;
  dealStore?: string; dealStoreColor?: string; dealStock?: number; dealLimited?: boolean;
  specs: Spec[];
  priceHistory: { "30d": PricePoint[]; "90d": PricePoint[]; "1y": PricePoint[] };
}

export interface Category {
  _id: string; name: string; iconName: string; count: string;
  color: string; bg: string; darkBg: string;
}

export interface Retailer {
  _id: string; name: string; abbr: string; color: string;
}

export interface Testimonial {
  _id: string; name: string; role: string; text: string; avatar: string; saved: string;
  translations?: { hi?: { role: string; text: string }; gu?: { role: string; text: string } };
}

export interface Faq {
  _id: string; q: string; a: string;
  translations?: { hi?: { q: string; a: string }; gu?: { q: string; a: string } };
}

export interface AuthUser {
  id: string; name: string; email: string; role: "user" | "admin"; createdAt: string;
}

export interface ProductQuery {
  tag?: string;
  category?: string;
  q?: string;
  brand?: string;
  limit?: number;
}

export interface Address {
  _id: string;
  label: string; line1: string; line2?: string;
  city: string; state: string; pincode: string; phone: string;
  isDefault: boolean;
}

export interface CartItem {
  product: Product;
  storeName: string;
  qty: number;
  priceSnapshot: number;
}

export interface CartResponse {
  items: CartItem[];
  subtotal: number;
}

export interface OrderItem {
  product: string;
  name: string;
  image: string;
  storeName: string;
  qty: number;
  price: number;
}

export interface OrderAddress {
  label: string; line1: string; line2?: string;
  city: string; state: string; pincode: string; phone: string;
}

export interface Order {
  _id: string;
  items: OrderItem[];
  shippingAddress: OrderAddress;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  couponCode?: string;
  paymentMethod: "cod" | "razorpay";
  paymentStatus: "pending" | "paid" | "failed";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paidAt?: string;
  orderStatus: "placed" | "confirmed" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface PaymentParams {
  keyId: string; razorpayOrderId: string; amount: number; currency: string;
}

export interface RazorpaySuccess {
  razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const api = {
  sendChatMessage: (messages: ChatMessage[]) =>
    request<{ reply: string }>("/chat", { method: "POST", body: JSON.stringify({ messages }) }),
  subscribeNewsletter: (email: string) =>
    request<{ ok: true }>("/newsletter", { method: "POST", body: JSON.stringify({ email }) }),
  getProducts: (params?: ProductQuery) => request<Product[]>(`/products${toQuery(params as Record<string, string | number | undefined>)}`),
  getProduct: (name: string) => request<Product>(`/products/${encodeURIComponent(name)}`),
  getCategories: () => request<Category[]>("/categories"),
  getRetailers: () => request<Retailer[]>("/retailers"),
  getTestimonials: () => request<Testimonial[]>("/testimonials"),
  getFaqs: () => request<Faq[]>("/faqs"),
  signup: (body: { name: string; email: string; password: string }) =>
    request<{ token: string; user: AuthUser }>("/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: AuthUser }>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => request<{ user: AuthUser }>("/auth/me"),

  getCart: () => request<CartResponse>("/cart"),
  addToCart: (body: { productId: string; storeName: string; qty?: number }) =>
    request<CartResponse>("/cart/items", { method: "POST", body: JSON.stringify(body) }),
  updateCartItem: (productId: string, body: { storeName: string; qty: number }) =>
    request<CartResponse>(`/cart/items/${productId}`, { method: "PATCH", body: JSON.stringify(body) }),
  removeCartItem: (productId: string, storeName: string) =>
    request<CartResponse>(`/cart/items/${productId}?storeName=${encodeURIComponent(storeName)}`, { method: "DELETE" }),
  clearCart: () => request<CartResponse>("/cart", { method: "DELETE" }),

  getWishlist: () => request<Product[]>("/users/wishlist"),
  addToWishlist: (productId: string) =>
    request<string[]>("/users/wishlist", { method: "POST", body: JSON.stringify({ productId }) }),
  removeFromWishlist: (productId: string) =>
    request<string[]>(`/users/wishlist/${productId}`, { method: "DELETE" }),

  getAddresses: () => request<Address[]>("/addresses"),
  addAddress: (body: Omit<Address, "_id">) =>
    request<Address[]>("/addresses", { method: "POST", body: JSON.stringify(body) }),
  updateAddress: (id: string, body: Partial<Omit<Address, "_id">>) =>
    request<Address[]>(`/addresses/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteAddress: (id: string) => request<Address[]>(`/addresses/${id}`, { method: "DELETE" }),

  getPaymentConfig: () => request<{ online: boolean }>("/payments/config"),
  createOrder: (addressId: string, paymentMethod: "cod" | "razorpay" = "cod") =>
    request<{ order: Order; payment: PaymentParams | null }>("/orders", { method: "POST", body: JSON.stringify({ addressId, paymentMethod }) }),
  startPayment: (orderId: string) =>
    request<{ order: Order; payment: PaymentParams }>(`/orders/${orderId}/pay`, { method: "POST" }),
  verifyPayment: (orderId: string, body: RazorpaySuccess) =>
    request<Order>(`/orders/${orderId}/verify-payment`, { method: "POST", body: JSON.stringify(body) }),
  getOrders: () => request<Order[]>("/orders"),
  getOrder: (id: string) => request<Order>(`/orders/${id}`),
  cancelOrder: (id: string) => request<Order>(`/orders/${id}/cancel`, { method: "POST" }),
};
