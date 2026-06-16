import mongoose, { Document, Model } from 'mongoose';

export interface IWishlist extends Document {
  customerId: mongoose.Types.ObjectId;
  products: mongoose.Types.ObjectId[];
  combos: mongoose.Types.ObjectId[];
}

const wishlistSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  combos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Combo' }]
}, { timestamps: true });

const Wishlist = (mongoose.models.Wishlist as Model<IWishlist>) || mongoose.model<IWishlist>('Wishlist', wishlistSchema);
export default Wishlist;
