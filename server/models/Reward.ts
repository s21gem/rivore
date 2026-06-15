import mongoose, { Document, Model } from 'mongoose';

export interface IReward extends Document {
  customerId: mongoose.Types.ObjectId;
  points: number;
  transactions: {
    type: 'Earned' | 'Redeemed';
    amount: number;
    description: string;
    date: Date;
  }[];
}

const rewardSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  points: { type: Number, default: 0 },
  transactions: [{
    type: { type: String, enum: ['Earned', 'Redeemed'], required: true },
    amount: { type: Number, required: true },
    description: { type: String },
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const Reward = (mongoose.models.Reward as Model<IReward>) || mongoose.model<IReward>('Reward', rewardSchema);
export default Reward;
