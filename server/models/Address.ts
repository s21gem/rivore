import mongoose, { Document, Model } from 'mongoose';

export interface IAddress extends Document {
  customerId: mongoose.Types.ObjectId;
  type: string;
  isDefault: boolean;
  recipientName: string;
  phone: string;
  division: string;
  district: string;
  area: string;
  fullAddress: string;
  landmark?: string;
}

const addressSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['Shipping', 'Billing'], default: 'Shipping' },
  isDefault: { type: Boolean, default: false },
  recipientName: { type: String, required: true },
  phone: { type: String, required: true },
  division: { type: String, required: true },
  district: { type: String, required: true },
  area: { type: String, required: true },
  fullAddress: { type: String, required: true },
  landmark: { type: String }
}, { timestamps: true });

const Address = (mongoose.models.Address as Model<IAddress>) || mongoose.model<IAddress>('Address', addressSchema);
export default Address;
