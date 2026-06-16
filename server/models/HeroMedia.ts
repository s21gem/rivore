import mongoose, { Document, Schema } from 'mongoose';

export interface IHeroMedia extends Document {
  type: 'image' | 'video_upload' | 'video_url';
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  mediaUrl: string;
  thumbnail: string;
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
  controls: boolean;
  isActive: boolean;
  sortOrder: number;
}

const HeroMediaSchema: Schema = new Schema({
  type: {
    type: String,
    enum: ['image', 'video_upload', 'video_url'],
    required: true,
    default: 'image'
  },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  buttonText: { type: String, default: '' },
  buttonLink: { type: String, default: '' },
  mediaUrl: { type: String, required: true },
  thumbnail: { type: String, default: '' },
  autoplay: { type: Boolean, default: true },
  loop: { type: Boolean, default: true },
  muted: { type: Boolean, default: true },
  controls: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<IHeroMedia>('HeroMedia', HeroMediaSchema);
