import mongoose, { Document, Model } from 'mongoose';

export interface IBackupLog extends Document {
  filename: string;
  sizeBytes: number;
  status: 'success' | 'failed';
  type: 'manual' | 'daily' | 'weekly' | 'monthly';
  errorDetails?: string;
  createdAt: Date;
}

const backupLogSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  sizeBytes: { type: Number, default: 0 },
  status: { type: String, enum: ['success', 'failed'], required: true },
  type: { type: String, enum: ['manual', 'daily', 'weekly', 'monthly'], required: true },
  errorDetails: { type: String },
}, { timestamps: { createdAt: true, updatedAt: false } });

const BackupLog = (mongoose.models.BackupLog as Model<IBackupLog>) || mongoose.model<IBackupLog>('BackupLog', backupLogSchema);
export default BackupLog;
