import mongoose, { Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string;
  role: string;
}

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
}, { timestamps: true });

const User = (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', userSchema);
export default User;
