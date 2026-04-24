import mongoose, { Document, Model } from 'mongoose';

export interface IOrder extends Document {
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zip: string;
  };
  items: {
    product?: mongoose.Types.ObjectId;
    combo?: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    type: string;
  }[];
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  couponCode?: string;
  discountApplied?: number;
  delivery?: {
    consignmentId: string;
    trackingCode: string;
    status: 'none' | 'created' | 'sent' | 'failed';
    error?: string;
  };
}

const orderSchema = new mongoose.Schema({
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: false },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    zip: { type: String, required: false },
  },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    combo: { type: mongoose.Schema.Types.ObjectId, ref: 'Combo' },
    customProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    size: { type: String },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    type: { type: String, enum: ['product', 'combo'], required: true },
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Called', 'Delivered', 'Cancelled'], default: 'Pending' },
  paymentMethod: { type: String, enum: ['COD', 'bKash', 'SSLCommerz', 'UddoktaPay', 'Online'], default: 'COD' },
  paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
  couponCode: { type: String, default: '' },
  discountApplied: { type: Number, default: 0 },
  delivery: {
    consignmentId: { type: String },
    trackingCode: { type: String },
    status: { type: String, enum: ['none', 'created', 'sent', 'failed'], default: 'none' },
    error: { type: String }
  }
}, { timestamps: true });

const Order = (mongoose.models.Order as Model<IOrder>) || mongoose.model<IOrder>('Order', orderSchema);
export default Order;
