import mongoose, { Document, Schema } from 'mongoose';

export interface IHeroMedia extends Document {
  // Old fields (backward compatibility)
  type: 'image' | 'video_upload' | 'video_url';
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  mediaUrl: string;
  thumbnail: string;
  
  // New unified fields
  desktopImageUrl?: string;
  mobileImageUrl?: string;
  videoFile?: string;
  videoUrl?: string;
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  ctaLink?: string;

  // Shared
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
  controls: boolean;
  isActive: boolean;
  sortOrder: number;
}

const HeroMediaSchema: Schema = new Schema({
  // Old fields
  type: {
    type: String,
    enum: ['image', 'video_upload', 'video_url'],
    default: 'image'
  },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  buttonText: { type: String, default: '' },
  buttonLink: { type: String, default: '' },
  mediaUrl: { type: String, default: '' }, // Removed strict required for new unified slides
  thumbnail: { type: String, default: '' },

  // New fields
  desktopImageUrl: { type: String, default: '' },
  mobileImageUrl: { type: String, default: '' },
  videoFile: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  headline: { type: String, default: '' },
  subheadline: { type: String, default: '' },
  ctaText: { type: String, default: '' },
  ctaLink: { type: String, default: '' },

  // Shared
  autoplay: { type: Boolean, default: true },
  loop: { type: Boolean, default: true },
  muted: { type: Boolean, default: true },
  controls: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<IHeroMedia>('HeroMedia', HeroMediaSchema);
