// ============================================
// Shared Frontend Type Definitions
// ============================================

export interface Product {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  description: string;
  category: 'Male' | 'Female' | 'Unisex' | 'Couple' | 'All';
  topNotes: string[];
  midNotes: string[];
  baseNotes: string[];
  sizes: Record<string, number>;
  image: string;
  images?: string[];
  isFeatured: boolean;
  stock: number;
  lowStockThreshold: number;
  isOutOfStock: boolean;
  price?: number;
  notesImage?: string;
  discountAmount?: number; // Percentage discount 0-100 (e.g. 20 = 20% off)
  featured?: boolean;
  attributes?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}

export interface Combo {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  price: number;
  category: 'Male' | 'Female' | 'Couple';
  products: string[];
  includedPerfumes?: string[];
  highlights?: string[];
  image?: string;
  featured: boolean;
  isCustomizable: boolean;
  customSize: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderCustomer {
  name: string;
  email?: string;
  phone: string;
  address: string;
  city: string;
  zip?: string;
}

export interface OrderItem {
  product?: string;
  combo?: string;
  customProducts?: string[];
  size?: string;
  name: string;
  price: number;
  quantity: number;
  type: 'product' | 'combo';
}

export interface Order {
  _id: string;
  customer: OrderCustomer;
  items: OrderItem[];
  totalAmount: number;
  status: 'Pending' | 'Confirmed' | 'Called' | 'Delivered' | 'Cancelled';
  paymentMethod: 'COD' | 'bKash' | 'SSLCommerz' | 'UddoktaPay' | 'Online';
  paymentStatus: 'Pending' | 'Paid';
  createdAt: string;
  updatedAt?: string;
}

export interface Testimonial {
  _id: string;
  name: string;
  message: string;
  rating: number;
  image?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface SiteSettings {
  metaPixelId: string;
  storeName: string;
  contactEmail: string;
  contactPhone: string;
  heroImage: string;
  comboSectionImage: string;
  categories: string[];
  filters: { name: string; options: string[] }[];
  invoiceCompanyName: string;
  invoiceAddress: string;
  invoicePhone: string;
  invoiceEmail: string;
  invoiceFooter: string;
  invoiceLogo: string;
  logoDark: string;
  logoWhite: string;
  fragranceNotesImage: string;
  bannerEnabled: boolean;
  bannerMessages: string[];
  signatureProducts: { productId: string; tagline: string }[];
  whyRivoreItems: { icon: string; title: string; description: string }[];
  storeLocationName: string;
  storeLocationAddress: string;
  storeLocationHours: string;
  storeLocationMapUrl: string;
  storeLocationImage: string;
  contactMapEmbedUrl: string;
  contactServiceEmail: string;
  contactServicePhone: string;
  contactHeadquartersAddress: string;
  socialFacebook: string;
  socialInstagram: string;
  socialTiktok: string;
  socialWhatsapp: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
}
