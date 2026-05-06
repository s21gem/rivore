import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Combo from './server/models/Combo';

dotenv.config();

const combos = [
  {
    name: 'Male Signature Combo',
    description: 'A powerful collection of our finest male fragrances. Perfect for the modern gentleman.',
    price: 1240,
    category: 'Male',
    includedPerfumes: ['Sereno (6ml)', 'Marigold (6ml)', 'Sage (6ml)', 'Mistero (6ml)'],
    highlights: ['Best Value', 'Perfect Gift'],
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop',
    featured: true,
  },
  {
    name: 'Female Elegance Combo',
    description: 'An enchanting set of our most loved female fragrances. Discover your new signature scent.',
    price: 1240,
    category: 'Female',
    includedPerfumes: ['Aurora (6ml)', 'Cocktail (6ml)', 'Bloom (6ml)', 'Seduction (6ml)'],
    highlights: ['Best Value', 'Perfect Gift'],
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop',
    featured: true,
  },
  {
    name: 'Couple Harmony Combo',
    description: 'The perfect pairing of masculine and feminine scents. Share the luxury with your loved one.',
    price: 1240,
    category: 'Couple',
    includedPerfumes: ['Aurora (6ml)', 'Bloom (6ml)', 'Sage (6ml)', 'Marigold (6ml)'],
    highlights: ['Best Value', 'Perfect Gift'],
    image: 'https://images.unsplash.com/photo-1615486171448-4df171221b06?q=80&w=800&auto=format&fit=crop',
    featured: true,
  }
];

async function seedCombos() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');

    await Combo.deleteMany({});
    console.log('Cleared existing combos');

    await Combo.insertMany(combos);
    console.log('Successfully seeded combos');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding combos:', error);
    process.exit(1);
  }
}

seedCombos();
