import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../server/models/Order';
import Coupon from '../server/models/Coupon';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined in .env file');
  process.exit(1);
}

const purgeData = async () => {
  try {
    console.log('--- Rivoré Data Purge Script ---');
    console.log('Connecting to database...');
    
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully.');

    // 1. Recycle Orders (Archive them)
    console.log('Recycling orders...');
    const allOrders = await Order.find({});
    
    if (allOrders.length > 0) {
      const db = mongoose.connection.db;
      if (db) {
        const archivedOrders = allOrders.map(order => ({
          ...order.toObject(),
          archivedAt: new Date(),
          originalId: order._id
        }));
        
        await db.collection('archived_orders').insertMany(archivedOrders);
        console.log(`Successfully recycled ${allOrders.length} orders to 'archived_orders' collection.`);
        
        const orderResult = await Order.deleteMany({});
        console.log(`Cleaned up ${orderResult.deletedCount} orders from live dashboard.`);
      }
    } else {
      console.log('No orders found to recycle.');
    }

    // 2. Reset Coupon Usage
    console.log('Resetting coupon usage counts...');
    const couponResult = await Coupon.updateMany({}, { usageCount: 0 });
    console.log(`Reset usage count for ${couponResult.modifiedCount} coupons.`);

    console.log('--------------------------------');
    console.log('Success: All test data purged successfully!');
    
  } catch (error) {
    console.error('Error during purge:', error);
  } finally {
    await mongoose.disconnect();
    console.log('DB Connection closed.');
    process.exit(0);
  }
};

purgeData();
