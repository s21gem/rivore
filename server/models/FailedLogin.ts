import mongoose, { Document, Model } from 'mongoose';

export interface IFailedLogin extends Document {
  ipAddress: string;
  email: string;
  attempts: number;
  country: string;
  device: string;
  lockUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const failedLoginSchema = new mongoose.Schema({
  ipAddress: { type: String, required: true },
  email: { type: String, required: true },
  attempts: { type: Number, default: 1 },
  country: { type: String, default: 'Unknown' },
  device: { type: String, default: 'Unknown' },
  lockUntil: { type: Date },
}, { timestamps: true });

// Optional: Automatically clear out very old failed logins
failedLoginSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 * 7 }); // 7 days

const FailedLogin = (mongoose.models.FailedLogin as Model<IFailedLogin>) || mongoose.model<IFailedLogin>('FailedLogin', failedLoginSchema);
export default FailedLogin;
