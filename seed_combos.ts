import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Combo from './server/models/Combo';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rivore';

const seedCombos = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing combos
    await Combo.deleteMany({});
    console.log('Cleared existing combos');

    const combos = [
      {
        name: 'Male Collection',
        description: 'A curated selection of our finest male fragrances. 4x 6ml bottles.',
        price: 1240,
        category: 'Male',
        includedPerfumes: ['Sereno', 'Marigold', 'Sage', 'Mistero'],
        highlights: ['Best Value', 'Perfect Gift'],
        image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop',
        featured: true,
      },
      {
        name: 'Female Collection',
        description: 'An elegant assortment of our signature female scents. 4x 6ml bottles.',
        price: 1240,
        category: 'Female',
        includedPerfumes: ['Aurora', 'Cocktail', 'Bloom', 'Seduction'],
        highlights: ['Best Value', 'Perfect Gift'],
        image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop',
        featured: true,
      },
      {
        name: 'Couple Collection',
        description: 'The perfect pairing for you and your partner. 4x 6ml bottles.',
        price: 1240,
        category: 'Couple',
        includedPerfumes: ['Aurora', 'Bloom', 'Sage', 'Marigold'],
        highlights: ['Best Value', 'Perfect Gift'],
        image: 'https://images.unsplash.com/photo-1615486171448-4df171221b06?q=80&w=800&auto=format&fit=crop',
        featured: true,
      }
    ];

    await Combo.insertMany(combos);
    console.log('Combos seeded successfully');

    mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding combos:', error);
    mongoose.disconnect();
  }
};

seedCombos();
