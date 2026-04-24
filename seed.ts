import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './server/models/Product';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rivore';

const products = [
  {
    name: 'Bloom',
    slug: 'bloom',
    description: 'A delicate and enchanting floral bouquet that captures the essence of a spring morning. Bloom blends fresh rose and peony with a warm, musky base for a scent that is both romantic and unforgettable.',
    category: 'Female',
    topNotes: ['Rose', 'Peony'],
    midNotes: ['Jasmine', 'Lily of the Valley'],
    baseNotes: ['Musk', 'Vanilla'],
    sizes: {
      '10ml': 450,
      '30ml': 1050,
      '50ml': 1460
    },
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop',
    isFeatured: true
  },
  {
    name: 'Mistero',
    slug: 'mistero',
    description: 'A bold, woody, and spicy fragrance designed for the modern man. Mistero opens with a sharp burst of bergamot and black pepper, settling into a deep, mysterious heart of cedarwood and nutmeg.',
    category: 'Male',
    topNotes: ['Bergamot', 'Black Pepper'],
    midNotes: ['Cedarwood', 'Nutmeg'],
    baseNotes: ['Vetiver', 'Amber'],
    sizes: {
      '10ml': 450,
      '30ml': 1050,
      '50ml': 1460
    },
    image: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?q=80&w=800&auto=format&fit=crop',
    isFeatured: true
  },
  {
    name: 'Intense',
    slug: 'intense',
    description: 'An unapologetically bold and luxurious oud-based fragrance. Intense is a unisex masterpiece that combines the richness of saffron and raspberry with a dark, leathery base.',
    category: 'Unisex',
    topNotes: ['Saffron', 'Raspberry'],
    midNotes: ['Rose', 'Oud'],
    baseNotes: ['Patchouli', 'Leather'],
    sizes: {
      '10ml': 450,
      '30ml': 1050,
      '50ml': 1460
    },
    image: 'https://images.unsplash.com/photo-1615486171448-4df171221b06?q=80&w=800&auto=format&fit=crop',
    isFeatured: true
  },
  {
    name: 'Seduction',
    slug: 'seduction',
    description: 'A sweet, fruity, and irresistibly alluring scent. Seduction wraps you in a comforting yet sensual aura of cherry, almond, and warm sandalwood.',
    category: 'Female',
    topNotes: ['Cherry', 'Almond'],
    midNotes: ['Rose', 'Jasmine'],
    baseNotes: ['Tonka Bean', 'Sandalwood'],
    sizes: {
      '10ml': 450,
      '30ml': 1050,
      '50ml': 1460
    },
    image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=800&auto=format&fit=crop',
    isFeatured: false
  },
  {
    name: 'Amber',
    slug: 'amber',
    description: 'A warm, resinous, and deeply comforting fragrance. Amber is a unisex classic that perfectly balances spicy cinnamon with sweet vanilla and rich labdanum.',
    category: 'Unisex',
    topNotes: ['Mandarin', 'Cardamom'],
    midNotes: ['Amber', 'Cinnamon'],
    baseNotes: ['Vanilla', 'Labdanum'],
    sizes: {
      '10ml': 450,
      '30ml': 1050,
      '50ml': 1460
    },
    image: 'https://images.unsplash.com/photo-1595425970377-c9703bc48baf?q=80&w=800&auto=format&fit=crop',
    isFeatured: false
  },
  {
    name: 'Infina',
    slug: 'infina',
    description: 'A fresh, aquatic, and endlessly uplifting scent. Infina captures the feeling of a cool ocean breeze with notes of lemon, mint, and white musk.',
    category: 'Female',
    topNotes: ['Lemon', 'Mint'],
    midNotes: ['Water Lily', 'Lotus'],
    baseNotes: ['Cedar', 'White Musk'],
    sizes: {
      '10ml': 450,
      '30ml': 1050,
      '50ml': 1460
    },
    image: 'https://images.unsplash.com/photo-1608528577891-eb055944f2e7?q=80&w=800&auto=format&fit=crop',
    isFeatured: false
  },
  {
    name: 'Bloodlust',
    slug: 'bloodlust',
    description: 'A dark, intense, and captivating leather fragrance. Bloodlust is for the daring, featuring a sharp citrus opening that descends into a deep, earthy base of oakmoss and patchouli.',
    category: 'Male',
    topNotes: ['Blood Orange', 'Grapefruit'],
    midNotes: ['Leather', 'Black Rose'],
    baseNotes: ['Oakmoss', 'Patchouli'],
    sizes: {
      '10ml': 450,
      '30ml': 1050,
      '50ml': 1460
    },
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop',
    isFeatured: false
  },
  {
    name: 'Aurora',
    slug: 'aurora',
    description: 'A bright, luminous, and sparkling citrus fragrance. Aurora awakens the senses with grapefruit and yuzu, leaving a lingering trail of warm ambergris and musk.',
    category: 'Female',
    topNotes: ['Grapefruit', 'Yuzu'],
    midNotes: ['Orange Blossom', 'Neroli'],
    baseNotes: ['Ambergris', 'Musk'],
    sizes: {
      '10ml': 450,
      '30ml': 1050,
      '50ml': 1460
    },
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop',
    isFeatured: true
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert new products
    await Product.insertMany(products);
    console.log('Successfully inserted 8 production products');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
