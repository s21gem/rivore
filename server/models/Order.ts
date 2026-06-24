import mongoose, { Document, Model } from 'mongoose';

export interface IOrder extends Document {
  customerId?: mongoose.Types.ObjectId;
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
    image?: string;
    size?: string;
    price: number;
    quantity: number;
    type: string;
  }[];
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentDetails?: {
    invoice_id?: string;
    transaction_id?: string;
    sender_number?: string;
    charged_amount?: number;
    payment_date?: string;
    gateway_name?: string;
    verification_time?: string;
    full_gateway_response?: any;
  };
  refundDetails?: {
    refundStatus?: string;
    refundAmount?: number;
    refundReason?: string;
    refundDate?: string;
    refundTransactionId?: string;
    refundRequestedBy?: string;
  };
  couponCode?: string;
  discountApplied?: number;
  redeemedPoints?: number;
  delivery?: {
    consignmentId: string;
    trackingCode: string;
    status: 'none' | 'created' | 'sent' | 'failed';
    error?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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
    image: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    type: { type: String, enum: ['product', 'combo'], required: true },
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Processing', 'Packed', 'Courier Received', 'In Transit', 'Shipped', 'Called', 'Delivered', 'Cancelled'], default: 'Pending' },
  paymentMethod: { type: String, enum: ['COD', 'bKash', 'SSLCommerz', 'UddoktaPay', 'Online'], default: 'COD' },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Cancelled', 'Refunded'], default: 'Pending' },
  paymentDetails: {
    invoice_id: { type: String },
    transaction_id: { type: String },
    sender_number: { type: String },
    charged_amount: { type: Number },
    payment_date: { type: String },
    gateway_name: { type: String },
    verification_time: { type: String },
    full_gateway_response: { type: mongoose.Schema.Types.Mixed },
  },
  refundDetails: {
    refundStatus: { type: String, enum: ['None', 'Requested', 'Processed', 'Failed'], default: 'None' },
    refundAmount: { type: Number },
    refundReason: { type: String },
    refundDate: { type: String },
    refundTransactionId: { type: String },
    refundRequestedBy: { type: String }
  },
  couponCode: { type: String, default: '' },
  discountApplied: { type: Number, default: 0 },
  redeemedPoints: { type: Number, default: 0 },
  delivery: {
    consignmentId: { type: String },
    trackingCode: { type: String },
    status: { type: String, enum: ['none', 'created', 'sent', 'failed'], default: 'none' },
    error: { type: String }
  }
}, { timestamps: true });
orderSchema.index({ customerId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

const Order = (mongoose.models.Order as Model<IOrder>) || mongoose.model<IOrder>('Order', orderSchema);
export default Order;
