import mongoose, { Document, Model } from 'mongoose';

export interface ISecurityEvent extends Document {
  type: string; // 'Failed Login', 'Suspicious Request', 'Blocked Request', 'Payment Failure', 'Courier Failure', etc.
  description: string;
  ipAddress: string;
  userEmail?: string;
  endpoint?: string;
  createdAt: Date;
}

const securityEventSchema = new mongoose.Schema({
  type: { type: String, required: true },
  description: { type: String, required: true },
  ipAddress: { type: String, default: '' },
  userEmail: { type: String, default: '' },
  endpoint: { type: String, default: '' }
}, { timestamps: { createdAt: true, updatedAt: false } });

const SecurityEvent = (mongoose.models.SecurityEvent as Model<ISecurityEvent>) || mongoose.model<ISecurityEvent>('SecurityEvent', securityEventSchema);
export default SecurityEvent;
