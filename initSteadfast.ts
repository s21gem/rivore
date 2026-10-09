import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './server/models/Settings';

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

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
    apiKey: requireEnv('STEADFAST_API_KEY'),
    secretKey: requireEnv('STEADFAST_SECRET_KEY'),
    baseUrl: 'https://portal.packzy.com/api/v1',
    autoSend: true
  };

  await settings.save();
  console.log('Steadfast credentials configured successfully.');
  process.exit(0);
}

run().catch(console.error);
