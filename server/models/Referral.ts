import mongoose, { Document, Model } from 'mongoose';

export interface IReferral extends Document {
  customerId: mongoose.Types.ObjectId;
  referralCode: string;
  referredUsers: {
    referredUserId?: mongoose.Types.ObjectId;
    email: string;
    dateJoined: Date;
    rewardIssued: boolean;
  }[];
}

const referralSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  referralCode: { type: String, required: true, unique: true },
  referredUsers: [{
    referredUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: { type: String, required: true },
    dateJoined: { type: Date, default: Date.now },
    rewardIssued: { type: Boolean, default: false }
  }]
}, { timestamps: true });

const Referral = (mongoose.models.Referral as Model<IReferral>) || mongoose.model<IReferral>('Referral', referralSchema);
export default Referral;
