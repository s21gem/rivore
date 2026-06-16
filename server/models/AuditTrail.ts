import mongoose, { Document, Model } from 'mongoose';

export interface IAuditTrail extends Document {
  settingName: string;
  oldValue: string;
  newValue: string;
  adminName: string;
  adminId: string;
  createdAt: Date;
}

const auditTrailSchema = new mongoose.Schema({
  settingName: { type: String, required: true },
  oldValue: { type: String, required: true },
  newValue: { type: String, required: true },
  adminName: { type: String, required: true },
  adminId: { type: String, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

const AuditTrail = (mongoose.models.AuditTrail as Model<IAuditTrail>) || mongoose.model<IAuditTrail>('AuditTrail', auditTrailSchema);
export default AuditTrail;
