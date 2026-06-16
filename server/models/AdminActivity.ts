import mongoose, { Document, Model } from 'mongoose';

export interface IAdminActivity extends Document {
  adminId: string;
  adminName: string;
  action: string; // e.g., 'Product Created', 'Settings Updated'
  target: string; // e.g., 'Product: 12345', 'Hero Media'
  details: string; // Optional JSON string or text for extra info
  ipAddress: string;
  country: string;
  city: string;
  isp: string;
  browser: string;
  os: string;
  deviceType: string;
  userAgent: string;
  createdAt: Date;
}

const adminActivitySchema = new mongoose.Schema({
  adminId: { type: String, required: true },
  adminName: { type: String, required: true },
  action: { type: String, required: true },
  target: { type: String, required: true },
  details: { type: String, default: '' },
  ipAddress: { type: String, default: '' },
  country: { type: String, default: 'Unknown' },
  city: { type: String, default: 'Unknown' },
  isp: { type: String, default: 'Unknown' },
  browser: { type: String, default: 'Unknown' },
  os: { type: String, default: 'Unknown' },
  deviceType: { type: String, default: 'Desktop' },
  userAgent: { type: String, default: '' }
}, { timestamps: { createdAt: true, updatedAt: false } });

const AdminActivity = (mongoose.models.AdminActivity as Model<IAdminActivity>) || mongoose.model<IAdminActivity>('AdminActivity', adminActivitySchema);
export default AdminActivity;
