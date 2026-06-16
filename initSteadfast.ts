import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './server/models/Settings';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rivore';

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  let settings = await Settings.findOne();
  if (!settings) {
    settings = new Settings({});
  }

  settings.deliverySteadfast = {
    enabled: true,
    apiKey: 'guwrinjbwwl64qmf8w8qfmv1a92petl8',
    secretKey: 'q0xthpavau5xxykg5f2xkkzb',
    baseUrl: 'https://portal.packzy.com/api/v1',
    autoSend: true
  };

  await settings.save();
  console.log('Steadfast credentials configured successfully.');
  process.exit(0);
}

run().catch(console.error);
