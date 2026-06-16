import mongoose, { Document, Model } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  discountType: 'percentage' | 'flat' | 'free_delivery' | 'gift';
  discountAmount: number; // 0 for free_delivery and gift
  isActive: boolean;
  usageCount: number;
  customerId?: mongoose.Types.ObjectId;
  expiresAt?: Date;
  isBirthdayCoupon?: boolean;
  description?: string;
}

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType: { type: String, enum: ['percentage', 'flat', 'free_delivery', 'gift'], required: true },
  discountAmount: { type: Number, required: true, min: 0 },
  isActive: { type: Boolean, default: true },
  usageCount: { type: Number, default: 0 },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  expiresAt: { type: Date },
  isBirthdayCoupon: { type: Boolean, default: false },
  description: { type: String }
}, { timestamps: true });

const Coupon = (mongoose.models.Coupon as Model<ICoupon>) || mongoose.model<ICoupon>('Coupon', couponSchema);
export default Coupon;
