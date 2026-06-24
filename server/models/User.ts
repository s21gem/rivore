import mongoose, { Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string;
  role: string;
  fullName?: string;
  phone?: string;
  dob?: Date;
  gender?: string;
  otp?: string;
  otpExpiry?: Date;
  securityEmail?: string;
  pendingSecurityEmail?: string;
  pendingOtpVerified?: boolean;
  preferredPaymentMethod?: string;
  viewedProducts?: mongoose.Types.ObjectId[];
  favoriteCategories?: string[];
  lifetimeSpend: number;
  tier: string;
  lastBirthdayCouponYear?: number;
}

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  fullName: { type: String },
  phone: { type: String },
  dob: { type: Date },
  gender: { type: String },
  otp: { type: String },
  otpExpiry: { type: Date },
  securityEmail: { type: String },
  pendingSecurityEmail: { type: String },
  pendingOtpVerified: { type: Boolean, default: false },
  preferredPaymentMethod: { type: String, enum: ['COD', 'bKash', 'SSLCommerz', 'UddoktaPay', 'Online'] },
  viewedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  favoriteCategories: [{ type: String }],
  lifetimeSpend: { type: Number, default: 0 },
  tier: { type: String, enum: ['Regular', 'Silver', 'Gold', 'Platinum'], default: 'Regular' },
  lastBirthdayCouponYear: { type: Number },
}, { timestamps: true });

userSchema.index({ role: 1 });
userSchema.index({ tier: 1 });

const User = (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', userSchema);
export default User;
