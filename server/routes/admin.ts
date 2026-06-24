import express from 'express';
import User from '../models/User';
import Address from '../models/Address';
import Reward from '../models/Reward';
import { authenticateAdmin as authenticate } from '../middleware/auth';
import AdminActivity from '../models/AdminActivity';
import AuditTrail from '../models/AuditTrail';
import FailedLogin from '../models/FailedLogin';
import SecurityEvent from '../models/SecurityEvent';
import BackupLog from '../models/BackupLog';
import { generateBackup } from '../services/backupCron';
import mongoose from 'mongoose';
import { apiHealthStore } from '../middleware/responseTracker';
import Product from '../models/Product';
import HeroMedia from '../models/HeroMedia';

const router = express.Router();

// Middleware to ensure the user is an admin
const authenticateAdmin = (req: express.Request & { user?: any }, res: express.Response, next: express.NextFunction) => {
  authenticate(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Forbidden: Admins only' });
    }
  });
};

router.use(authenticateAdmin);

// Get all customers with their addresses
router.get('/customers', async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' }).select('-password -otp -otpExpiry').lean();
    
    // Fetch addresses and rewards for all customers
    const addresses = await Address.find({ customerId: { $in: customers.map(c => c._id) } }).lean();
    const rewards = await Reward.find({ customerId: { $in: customers.map(c => c._id) } }).lean();
    
    // Attach addresses and rewards to customers
    const customersWithData = customers.map(customer => {
      const customerAddresses = addresses.filter(a => a.customerId.toString() === customer._id.toString());
      const customerReward = rewards.find(r => r.customerId.toString() === customer._id.toString());
      return {
        ...customer,
        addresses: customerAddresses,
        reward: customerReward || { points: 0, transactions: [] }
      };
    });

    res.json(customersWithData);
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Server error fetching customers' });
  }
});

// Update customer rewards
router.put('/customers/:id/rewards', async (req, res) => {
  try {
    const { action, amount, description } = req.body;
    if (!['add', 'remove', 'set'].includes(action) || typeof amount !== 'number') {
      return res.status(400).json({ message: 'Invalid action or amount' });
    }

    let reward = await Reward.findOne({ customerId: req.params.id });
    if (!reward) {
      reward = new Reward({ customerId: req.params.id, points: 0, transactions: [] });
    }

    const previousPoints = reward.points;
    if (action === 'add') {
      reward.points += amount;
    } else if (action === 'remove') {
      reward.points = Math.max(0, reward.points - amount);
    } else if (action === 'set') {
      reward.points = Math.max(0, amount);
    }

    const diff = reward.points - previousPoints;
    if (diff !== 0) {
      reward.transactions.push({
        type: diff > 0 ? 'Earned' : 'Redeemed',
        amount: Math.abs(diff),
        description: description || `Admin ${action}`,
        date: new Date()
      });
      await reward.save();
    }

    res.json({ success: true, reward });
  } catch (error: any) {
    console.error('Error updating rewards:', error);
    res.status(500).json({ message: 'Server error updating rewards' });
  }
});

// Security & Audit Routes

router.get('/security/events', async (req, res) => {
  try {
    const events = await SecurityEvent.find().sort({ createdAt: -1 }).limit(100).lean();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching security events' });
  }
});

router.get('/security/failed-logins', async (req, res) => {
  try {
    const logins = await FailedLogin.find().sort({ lastAttempt: -1 }).limit(100).lean();
    res.json(logins);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching failed logins' });
  }
});

router.get('/security/audit-trails', async (req, res) => {
  try {
    const trails = await AuditTrail.find().sort({ createdAt: -1 }).limit(100).lean();
    res.json(trails);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching audit trails' });
  }
});

router.get('/security/admin-activities', async (req, res) => {
  try {
    const activities = await AdminActivity.find().sort({ createdAt: -1 }).limit(100).lean();
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching admin activities' });
  }
});

// System Health
router.get('/health', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    const dbName = mongoose.connection.name;
    const collectionsCount = Object.keys(mongoose.connection.collections).length;
    const totalRecords = await User.countDocuments() + await AdminActivity.countDocuments(); // Approximate

    const latestBackup = await BackupLog.findOne({ status: 'success' }).sort({ createdAt: -1 }).lean();
    
    // Calculate average response times
    const apiPerformance: any = {};
    for (const [key, metrics] of Object.entries(apiHealthStore)) {
      const avg = metrics.recentCalls.length ? Math.round(metrics.recentCalls.reduce((a, b) => a + b, 0) / metrics.recentCalls.length) : 0;
      apiPerformance[key] = avg;
    }

    // Active users in last 24 hours
    const activeUsers = await User.countDocuments({ updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } });
    const failedJobs = await SecurityEvent.countDocuments({ type: { $in: ['Failed Login', 'Blocked Request'] }, createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } });

    // Mock cloudinary count based on products and media
    const productCount = await Product.countDocuments();
    const heroMediaCount = await HeroMedia.countDocuments();
    const cloudinaryFilesCount = (productCount * 4) + heroMediaCount; // Rough estimate of images

    res.json({
      dbStatus,
      dbName,
      collectionsCount,
      totalRecords,
      latestBackup,
      apiPerformance,
      activeUsers,
      failedJobs,
      cloudinaryFilesCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching health data' });
  }
});

router.post('/health/test-courier', async (req, res) => {
  // Simulate courier API test
  try {
    const start = Date.now();
    // Here we would normally make a request to Steadfast API.
    // Simulating delay
    await new Promise(resolve => setTimeout(resolve, 150));
    res.json({ success: true, latency: Date.now() - start });
  } catch (e) {
    res.status(500).json({ success: false });
  }
});

router.post('/health/test-payment', async (req, res) => {
  // Simulate bKash API test
  try {
    const start = Date.now();
    await new Promise(resolve => setTimeout(resolve, 200));
    res.json({ success: true, latency: Date.now() - start });
  } catch (e) {
    res.status(500).json({ success: false });
  }
});

// Advanced Activity Logs with Pagination & Filters
router.get('/activity-logs', async (req, res) => {
  try {
    const { page = '1', limit = '50', search, adminName, action, dateFrom, dateTo } = req.query;
    const query: any = {};

    if (search) {
      query.$or = [
        { target: new RegExp(search as string, 'i') },
        { details: new RegExp(search as string, 'i') }
      ];
    }
    if (adminName) query.adminName = new RegExp(adminName as string, 'i');
    if (action) query.action = action;
    
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom as string);
      if (dateTo) query.createdAt.$lte = new Date(dateTo as string);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const logs = await AdminActivity.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean();
    const total = await AdminActivity.countDocuments(query);

    res.json({ logs, total, pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching activity logs' });
  }
});

export default router;
