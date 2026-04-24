import mongoose, { Document, Model } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  discountType: 'percentage' | 'flat';
  discountAmount: number;
  isActive: boolean;
  usageCount: number;
}

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType: { type: String, enum: ['percentage', 'flat'], required: true },
  discountAmount: { type: Number, required: true, min: 0 },
  isActive: { type: Boolean, default: true },
  usageCount: { type: Number, default: 0 }
}, { timestamps: true });

const Coupon = (mongoose.models.Coupon as Model<ICoupon>) || mongoose.model<ICoupon>('Coupon', couponSchema);
export default Coupon;
