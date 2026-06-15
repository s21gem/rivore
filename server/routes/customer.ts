import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Order from '../models/Order';
import Address from '../models/Address';
import Reward from '../models/Reward';
import Referral from '../models/Referral';
import { authenticate } from '../middleware/auth';

// Define the authenticated request interface
interface AuthRequest extends express.Request {
  user?: any;
}

// Ensure authenticate middleware passes the customer checks
const authenticateCustomer = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  authenticate(req, res, () => {
    if (req.user && req.user.role === 'customer') {
      next();
    } else {
      res.status(403).json({ message: 'Forbidden: Customers only' });
    }
  });
};

const router = express.Router();

router.use(authenticateCustomer);

// =================== PROFILE ===================
router.get('/profile', async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otp -otpExpiry');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/profile', async (req: AuthRequest, res) => {
  try {
    const { fullName, phone, dob, gender } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, phone, dob, gender },
      { new: true }
    ).select('-password -otp -otpExpiry');
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/password', async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Invalid input data' });
    }

    const user = await User.findById(req.user.id);
    if (!user || !(await bcrypt.compare(currentPassword, user.password!))) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// =================== ORDERS ===================
router.get('/orders', async (req: AuthRequest, res) => {
  try {
    const orders = await Order.find({ customerId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// =================== ADDRESSES ===================
router.get('/addresses', async (req: AuthRequest, res) => {
  try {
    const addresses = await Address.find({ customerId: req.user.id });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/addresses', async (req: AuthRequest, res) => {
  try {
    const address = new Address({ ...req.body, customerId: req.user.id });
    
    // If this is set to default, unset other defaults
    if (address.isDefault) {
      await Address.updateMany({ customerId: req.user.id }, { isDefault: false });
    }
    
    await address.save();
    res.status(201).json(address);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/addresses/:id', async (req: AuthRequest, res) => {
  try {
    if (req.body.isDefault) {
      await Address.updateMany({ customerId: req.user.id }, { isDefault: false });
    }
    
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, customerId: req.user.id },
      req.body,
      { new: true }
    );
    if (!address) return res.status(404).json({ message: 'Address not found' });
    res.json(address);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/addresses/:id', async (req: AuthRequest, res) => {
  try {
    const result = await Address.findOneAndDelete({ _id: req.params.id, customerId: req.user.id });
    if (!result) return res.status(404).json({ message: 'Address not found' });
    res.json({ success: true, message: 'Address deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// =================== REWARDS ===================
router.get('/rewards', async (req: AuthRequest, res) => {
  try {
    let reward = await Reward.findOne({ customerId: req.user.id });
    if (!reward) {
      reward = await new Reward({ customerId: req.user.id, points: 0 }).save();
    }
    res.json(reward);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// =================== REFERRALS ===================
router.get('/referrals', async (req: AuthRequest, res) => {
  try {
    let referral = await Referral.findOne({ customerId: req.user.id }).populate('referredUsers.referredUserId', 'fullName email');
    if (!referral) {
      // Should have been created on registration, but fallback just in case
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      
      const refCode = user.email.split('@')[0].toUpperCase().substring(0, 5) + Math.floor(100 + Math.random() * 900);
      referral = await new Referral({ customerId: req.user.id, referralCode: refCode }).save();
    }
    res.json(referral);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
