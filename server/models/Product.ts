import mongoose, { Document, Model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  category: string;
  topNotes: string[];
  midNotes: string[];
  baseNotes: string[];
  sizes: Record<string, number>;
  image: string;
  isFeatured: boolean;
  stock: number;
  lowStockThreshold: number;
  isOutOfStock: boolean;
  // Keep old fields optional for backward compatibility during migration
  price?: number;
  images?: string[];
  notes?: { top?: string; middle?: string; base?: string };
  featured?: boolean;
  attributes?: Record<string, string>;
  notesImage?: string;
  discountAmount?: number;
}

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  topNotes: [{ type: String }],
  midNotes: [{ type: String }],
  baseNotes: [{ type: String }],
  sizes: { type: Map, of: Number, default: { '10ml': 450, '30ml': 1050, '50ml': 1460 } },
  image: { type: String },
  isFeatured: { type: Boolean, default: false },
  
  // Stock Management
  stock: { type: Number, default: 10 },
  lowStockThreshold: { type: Number, default: 5 },
  isOutOfStock: { type: Boolean, default: false },

  // Legacy fields
  price: { type: Number },
  images: [{ type: String }],
  notes: {
    top: { type: String },
    middle: { type: String },
    base: { type: String },
  },
  featured: { type: Boolean, default: false },
  attributes: { type: Map, of: String },
  notesImage: { type: String, default: '' },
  discountAmount: { type: Number, default: 0 },
}, { timestamps: true });

productSchema.pre('save', function(this: any) {
  if (this.stock <= 0) {
    this.isOutOfStock = true;
    this.stock = 0; // Prevent negative stock
  } else {
    this.isOutOfStock = false;
  }
});

productSchema.pre('findOneAndUpdate', function(this: any) {
  const update = this.getUpdate() as any;
  
  if (!update) return;

  // Handle direct updates or $set updates
  const stockValue = update.stock !== undefined ? update.stock : (update.$set && update.$set.stock !== undefined ? update.$set.stock : undefined);

  if (stockValue !== undefined) {
    const isOutOfStock = stockValue <= 0;
    const finalStock = isOutOfStock ? 0 : stockValue;

    if (update.$set) {
      update.$set.stock = finalStock;
      update.$set.isOutOfStock = isOutOfStock;
    } else {
      update.stock = finalStock;
      update.isOutOfStock = isOutOfStock;
    }
  }
});

const Product = (mongoose.models.Product as Model<IProduct>) || mongoose.model<IProduct>('Product', productSchema);
export default Product;
