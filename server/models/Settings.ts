import mongoose, { Document, Model } from 'mongoose';

export interface ISettings extends Document {
  // Existing fields
  metaPixelId: string;
  storeName: string;
  shippingCharge: number;
  contactEmail: string;
  contactPhone: string;
  heroImage: string;
  heroImages: string[];
  heroHeading: string;
  heroSubheading: string;
  heroButtonText: string;
  heroButtonLink: string;
  heroHeadingColor: string;
  heroSubheadingColor: string;
  heroButtonBgColor: string;
  heroButtonTextColor: string;
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

  // CMS: Notification Banner
  bannerEnabled: boolean;
  bannerMessages: string[];

  // CMS: Signature Collection
  signatureProducts: { productId: string; tagline: string }[];

  // CMS: Best Sellers Slider
  bestSellerSliderItems: { image: string; productId: string; title: string }[];

  // CMS: Why Rivore
  whyRivoreItems: { icon: string; title: string; description: string }[];

  // CMS: Store Location
  storeLocationName: string;
  storeLocationAddress: string;
  storeLocationHours: string;
  storeLocationMapUrl: string;
  storeLocationImage: string;

  // CMS: Contact Page
  contactMapEmbedUrl: string;
  contactServiceEmail: string;
  contactServicePhone: string;
  contactHeadquartersAddress: string;

  // CMS: Social Links
  socialFacebook: string;
  socialInstagram: string;
  socialTiktok: string;
  socialWhatsapp: string;

  // CMS: Payment Gateways
  paymentBkash: { merchantId: string; apiKey: string; apiSecret: string; enabled: boolean };
  paymentSslCommerz: { storeId: string; storePassword: string; enabled: boolean; isLive: boolean };
  paymentUddoktaPay: { apiKey: string; enabled: boolean; isLive: boolean };
  deliverySteadfast: { 
    enabled: boolean; 
    apiKey: string; 
    secretKey: string; 
    baseUrl: string; 
    autoSend: boolean; 
  };
}

const settingsSchema = new mongoose.Schema({
  // Existing fields
  metaPixelId: { type: String, default: '' },
  storeName: { type: String, default: 'Rivore' },
  shippingCharge: { type: Number, default: 0 },
  contactEmail: { type: String, default: 'contact@rivore.com' },
  contactPhone: { type: String, default: '' },
  heroImage: { type: String, default: '' },
  heroImages: { type: [String], default: [] },
  heroHeading: { type: String, default: 'Smell Unforgettable.' },
  heroSubheading: { type: String, default: 'Experience premium-inspired fragrances crafted for confidence, elegance, and lasting impressions.' },
  heroButtonText: { type: String, default: 'Shop Now' },
  heroButtonLink: { type: String, default: '/shop' },
  heroHeadingColor: { type: String, default: '#111111' },
  heroSubheadingColor: { type: String, default: '#333333' },
  heroButtonBgColor: { type: String, default: '#111111' },
  heroButtonTextColor: { type: String, default: '#ffffff' },
  comboSectionImage: { type: String, default: '' },
  categories: { type: [String], default: ['Male', 'Female', 'Couple'] },
  filters: [
    {
      name: { type: String },
      options: [{ type: String }]
    }
  ],
  invoiceCompanyName: { type: String, default: 'Rivoré' },
  invoiceAddress: { type: String, default: 'Dhaka, Bangladesh' },
  invoicePhone: { type: String, default: '' },
  invoiceEmail: { type: String, default: 'contact@rivore.com' },
  invoiceFooter: { type: String, default: 'Thank you for choosing Rivoré. Crafted with Elegance.' },
  invoiceLogo: { type: String, default: 'https://res.cloudinary.com/dum9idrbx/image/upload/f_png/q_80/v1776089332/Rivor%C3%A9_fhepjw.png' },
  logoDark: { type: String, default: '' },
  logoWhite: { type: String, default: '' },
  fragranceNotesImage: { type: String, default: '' },

  // CMS: Notification Banner
  bannerEnabled: { type: Boolean, default: true },
  bannerMessages: { type: [String], default: [
    'Free Shipping on orders over ৳5000',
    'Visit our new flagship store at Banani',
    'Use code RIVORE10 for 10% off',
    'Luxury Fragrances Reimagined'
  ]},

  // CMS: Signature Collection
  signatureProducts: [{
    productId: { type: String },
    tagline: { type: String, default: '' }
  }],

  // CMS: Best Sellers Slider
  bestSellerSliderItems: [{
    image: { type: String },
    productId: { type: String },
    title: { type: String, default: '' }
  }],

  // CMS: Why Rivore
  whyRivoreItems: [{
    icon: { type: String, default: 'Sparkles' },
    title: { type: String },
    description: { type: String }
  }],

  // CMS: Store Location
  storeLocationName: { type: String, default: 'RIVORÉ Flagship Store' },
  storeLocationAddress: { type: String, default: 'House 50, Road 11\nBlock F, Banani\nDhaka 1213, Bangladesh' },
  storeLocationHours: { type: String, default: '11:00 AM - 9:00 PM (Everyday)' },
  storeLocationMapUrl: { type: String, default: 'https://maps.google.com' },
  storeLocationImage: { type: String, default: '' },

  // CMS: Contact Page
  contactMapEmbedUrl: { type: String, default: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14604.466542735709!2d90.40427384999999!3d23.7933939!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c70c15cea1e1%3A0x600f68d9f48ac218!2sBanani%2C%20Dhaka!5e0!3m2!1sen!2sbd!4v1700000000000!5m2!1sen!2sbd' },
  contactServiceEmail: { type: String, default: 'support@rivore.com' },
  contactServicePhone: { type: String, default: '+1 (555) 123-4567' },
  contactHeadquartersAddress: { type: String, default: '123 Fragrance Lane\nNew York, NY 10001\nUnited States' },

  // CMS: Social Links
  socialFacebook: { type: String, default: '' },
  socialInstagram: { type: String, default: '' },
  socialTiktok: { type: String, default: '' },
  socialWhatsapp: { type: String, default: '' },

  // CMS: Payment Gateways
  paymentBkash: {
    merchantId: { type: String, default: '' },
    apiKey: { type: String, default: '' },
    apiSecret: { type: String, default: '' },
    enabled: { type: Boolean, default: false }
  },
  paymentSslCommerz: {
    storeId: { type: String, default: '' },
    storePassword: { type: String, default: '' },
    enabled: { type: Boolean, default: false },
    isLive: { type: Boolean, default: false }
  },
  paymentUddoktaPay: {
    apiKey: { type: String, default: '' },
    enabled: { type: Boolean, default: false },
    isLive: { type: Boolean, default: false }
  },
  deliverySteadfast: {
    enabled: { type: Boolean, default: false },
    apiKey: { type: String, default: '' },
    secretKey: { type: String, default: '' },
    baseUrl: { type: String, default: 'https://portal.packzy.com/api/v1' },
    autoSend: { type: Boolean, default: false }
  },
}, { timestamps: true });

const Settings = (mongoose.models.Settings as Model<ISettings>) || mongoose.model<ISettings>('Settings', settingsSchema);
export default Settings;
