import mongoose, { Document, Model } from 'mongoose';

export interface IAddress extends Document {
  customerId: mongoose.Types.ObjectId;
  type: string;
  isDefault: boolean;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  zip?: string;
}

const addressSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['Shipping', 'Billing'], default: 'Shipping' },
  isDefault: { type: Boolean, default: false },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  state: { type: String },
  zip: { type: String }
}, { timestamps: true });

const Address = (mongoose.models.Address as Model<IAddress>) || mongoose.model<IAddress>('Address', addressSchema);
export default Address;
