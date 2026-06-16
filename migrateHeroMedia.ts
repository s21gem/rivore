import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './server/models/Settings';
import HeroMedia from './server/models/HeroMedia';

dotenv.config();

async function migrate() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rivore';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');

    const settings = await Settings.findOne();
    const count = await HeroMedia.countDocuments();

    if (count === 0 && settings) {
      console.log('No HeroMedia found, migrating from Settings...');
      
      const images = settings.heroImages && settings.heroImages.length > 0 
        ? settings.heroImages 
        : (settings.heroImage ? [settings.heroImage] : []);

      for (let i = 0; i < images.length; i++) {
        await HeroMedia.create({
          type: 'image',
          mediaUrl: images[i],
          sortOrder: i,
          isActive: true
        });
      }
      
      console.log('Migration complete. Inserted ' + images.length + ' hero media slides.');
    } else {
      console.log('Migration skipped. HeroMedia already exists or no settings found.');
    }
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

migrate();
