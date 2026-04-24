import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../server/models/Order';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined in .env file');
  process.exit(1);
}

const restoreData = async () => {
  try {
    console.log('--- Rivoré Data Restore Script ---');
    console.log('Connecting to database...');
    
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully.');

    const db = mongoose.connection.db;
    if (!db) throw new Error('Database connection failed');

    // 1. Fetch from Archive
    console.log('Fetching orders from archived_orders...');
    const archivedOrders = await db.collection('archived_orders').find({}).toArray();

    if (archivedOrders.length === 0) {
      console.log('No archived orders found to restore.');
      return;
    }

    // 2. Prepare for Restore (Remove the archive-specific fields)
    const ordersToRestore = archivedOrders.map(item => {
      const { archivedAt, originalId, _id, ...originalData } = item;
      return {
        ...originalData,
        _id: originalId || _id // Restore original ID if available
      };
    });

    // 3. Restore to Live Orders
    console.log(`Restoring ${ordersToRestore.length} orders to live dashboard...`);
    
    // Using insertMany on the Model to respect validation
    await Order.insertMany(ordersToRestore);
    
    console.log('Successfully restored all archived orders.');

    // 4. Cleanup Archive (Optional - usually safer to leave it or clear it)
    console.log('Clearing archive collection...');
    await db.collection('archived_orders').deleteMany({});
    console.log('Archive cleared.');

    console.log('--------------------------------');
    console.log('Success: All data brought back to live dashboard!');
    
  } catch (error) {
    console.error('Error during restore:', error);
  } finally {
    await mongoose.disconnect();
    console.log('DB Connection closed.');
    process.exit(0);
  }
};

restoreData();
