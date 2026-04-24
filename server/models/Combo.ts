import mongoose, { Document, Model } from 'mongoose';

export interface ICombo extends Document {
  name: string;
  description?: string;
  price: number;
  category: string;
  products: mongoose.Types.ObjectId[];
  includedPerfumes?: string[];
  highlights?: string[];
  image?: string;
  featured: boolean;
  isCustomizable: boolean;
  customSize: number;
}

const comboSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, enum: ['Male', 'Female', 'Couple'], required: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  includedPerfumes: [{ type: String }],
  highlights: [{ type: String }],
  image: { type: String },
  featured: { type: Boolean, default: false },
  isCustomizable: { type: Boolean, default: false },
  customSize: { type: Number, default: 0 },
}, { timestamps: true });

const Combo = (mongoose.models.Combo as Model<ICombo>) || mongoose.model<ICombo>('Combo', comboSchema);
export default Combo;
