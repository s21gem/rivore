import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Order from '../models/Order';
import Address from '../models/Address';
import Reward from '../models/Reward';
import Referral from '../models/Referral';
import Coupon from '../models/Coupon';
import { authenticateAdmin as authenticate } from '../middleware/auth';
import { checkSteadfastStatus } from '../services/courierService';
import Settings from '../models/Settings';
import Product from '../models/Product';

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
    const { fullName, phone, dob, gender, preferredPaymentMethod } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, phone, dob, gender, preferredPaymentMethod },
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

router.get('/orders/:id', async (req: AuthRequest, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customerId: req.user.id })
      .populate('items.product')
      .populate('items.combo');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/orders/:id/track', async (req: AuthRequest, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customerId: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Sync status if tracking code exists
    if (order.delivery?.consignmentId && order.status !== 'Delivered' && order.status !== 'Cancelled') {
      const result = await checkSteadfastStatus(order.delivery.consignmentId);
      if (result?.success && result.delivery_status) {
        let changed = false;
        
        // Map Steadfast status to local timeline
        if (result.delivery_status === 'delivered' && order.status !== 'Delivered') {
          order.status = 'Delivered';
          changed = true;
        } else if (result.delivery_status === 'in_transit' && order.status !== 'Shipped') {
          order.status = 'Shipped';
          changed = true;
        }

        if (changed) {
          await order.save();
        }
      }
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// =================== SCENT COLLECTION ===================
router.get('/scent-collection', async (req: AuthRequest, res) => {
  try {
    const customerId = req.user.id;

    // 1. Get History (Past Purchases)
    // Find all completed/delivered orders
    const pastOrders = await Order.find({ 
      customerId, 
      status: { $in: ['Delivered', 'paid', 'shipped', 'processing', 'completed', 'pending'] } 
    }).populate('items.product').sort({ createdAt: -1 });

    const historyMap = new Map();
    const purchasedCategorySet = new Set<string>();

    pastOrders.forEach(order => {
      order.items.forEach((item: any) => {
        if (item.type === 'product' && item.product) {
          const prodId = item.product._id.toString();
          
          if (item.product.category) purchasedCategorySet.add(item.product.category);

          if (!historyMap.has(prodId)) {
            historyMap.set(prodId, {
              product: item.product,
              firstPurchaseDate: order.createdAt,
              latestPurchaseDate: order.createdAt,
              purchaseCount: 1
            });
          } else {
            const entry = historyMap.get(prodId);
            entry.purchaseCount += 1;
            // Update first purchase date if older
            if (new Date(order.createdAt) < new Date(entry.firstPurchaseDate)) {
              entry.firstPurchaseDate = order.createdAt;
            }
          }
        }
      });
    });

    const history = Array.from(historyMap.values());

    // 2. Recommendations (You may also love)
    // If no history, return empty recommendations based on user instruction
    let recommendations: any[] = [];
    if (history.length > 0) {
      const purchasedProductIds = Array.from(historyMap.keys());
      const categories = Array.from(purchasedCategorySet);
      
      // Find products in same categories that haven't been purchased
      recommendations = await Product.find({
        category: { $in: categories },
        _id: { $nin: purchasedProductIds },
        isActive: true
      }).limit(4);
      
      // If we didn't find enough, backfill with top-selling/latest items not purchased
      if (recommendations.length < 4) {
        const extraRecs = await Product.find({
          _id: { $nin: [...purchasedProductIds, ...recommendations.map(r => r._id)] },
          isActive: true
        }).limit(4 - recommendations.length).sort({ createdAt: -1 });
        recommendations = [...recommendations, ...extraRecs];
      }
    }

    res.json({
      history,
      recommendations
    });
  } catch (error) {
    console.error('Scent Collection error:', error);
    res.status(500).json({ message: 'Server error fetching scent collection' });
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

// =================== REWARDS & COUPONS ===================
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

router.get('/birthday-coupon', async (req: AuthRequest, res) => {
  try {
    const coupon = await Coupon.findOne({
      customerId: req.user.id,
      isBirthdayCoupon: true,
      isActive: true,
      expiresAt: { $gt: new Date() }
    });
    res.json({ coupon });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/my-coupons', async (req: AuthRequest, res) => {
  try {
    const coupons = await Coupon.find({
      customerId: req.user.id,
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching coupons' });
  }
});

router.post('/rewards/redeem', async (req: AuthRequest, res) => {
  try {
    const { rewardType } = req.body;
    
    // Define the cost and logic for each reward type
    const rewardsMap: Record<string, { cost: number, type: 'flat' | 'free_delivery' | 'gift', amount: number, desc: string, prefix: string }> = {
      'DISCOUNT_100': { cost: 100, type: 'flat', amount: 100, desc: '৳100 Off Discount', prefix: 'RIV100' },
      'FREE_DELIVERY': { cost: 300, type: 'free_delivery', amount: 0, desc: 'Free Delivery', prefix: 'FREEDEL' },
      'MYSTERY_SAMPLE': { cost: 500, type: 'gift', amount: 0, desc: 'Mystery Sample Gift', prefix: 'SAMPLE' },
      'EXCLUSIVE_GIFT': { cost: 1000, type: 'gift', amount: 0, desc: 'Exclusive Premium Gift', prefix: 'VIPGIFT' }
    };

    const rewardConfig = rewardsMap[rewardType];
    if (!rewardConfig) {
      return res.status(400).json({ message: 'Invalid reward type' });
    }

    const reward = await Reward.findOne({ customerId: req.user.id });
    if (!reward || reward.points < rewardConfig.cost) {
      return res.status(400).json({ message: 'Insufficient points' });
    }

    // Deduct points
    reward.points -= rewardConfig.cost;
    await reward.save();

    // Generate unique coupon code
    const uniqueCode = `${rewardConfig.prefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create the coupon
    const newCoupon = new Coupon({
      code: uniqueCode,
      discountType: rewardConfig.type,
      discountAmount: rewardConfig.amount,
      isActive: true,
      customerId: req.user.id,
      description: rewardConfig.desc,
      // Expires in 30 days
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    await newCoupon.save();

    res.json({ success: true, newPoints: reward.points, coupon: newCoupon });
  } catch (error) {
    res.status(500).json({ message: 'Server error redeeming reward' });
  }
});

// =================== REFERRALS ===================
router.get('/referrals/leaderboard', async (req: AuthRequest, res) => {
  try {
    // Aggregate referrals to find top referrers
    const leaderboard = await Referral.aggregate([
      {
        $project: {
          customerId: 1,
          successfulReferrals: {
            $size: {
              $filter: {
                input: "$referredUsers",
                as: "user",
                cond: { $eq: ["$$user.rewardIssued", true] }
              }
            }
          }
        }
      },
      { $match: { successfulReferrals: { $gt: 0 } } },
      { $sort: { successfulReferrals: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customerDetails'
        }
      },
      { $unwind: '$customerDetails' },
      {
        $project: {
          _id: 0,
          fullName: '$customerDetails.fullName',
          successfulReferrals: 1
        }
      }
    ]);

    // Mask the names for privacy (e.g., "John Doe" -> "J*** D***")
    const maskedLeaderboard = leaderboard.map(entry => {
      const parts = (entry.fullName || 'Anonymous').split(' ');
      const maskedName = parts.map((p: string) => p.charAt(0) + '***').join(' ');
      return { ...entry, fullName: maskedName };
    });

    res.json(maskedLeaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching leaderboard' });
  }
});

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

// =================== TRACKING ===================
router.post('/track/view', async (req: AuthRequest, res) => {
  try {
    const { productId, category } = req.body;
    if (!productId) return res.status(400).json({ message: 'Product ID required' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update viewedProducts (keep last 20 unique)
    let viewed = user.viewedProducts || [];
    viewed = viewed.filter(id => id.toString() !== productId);
    viewed.unshift(productId);
    if (viewed.length > 20) viewed.pop();
    user.viewedProducts = viewed;

    // Update favoriteCategories (keep top 5)
    if (category) {
      let categories = user.favoriteCategories || [];
      // Simple logic: push to front, keep unique
      categories = categories.filter(c => c !== category);
      categories.unshift(category);
      if (categories.length > 5) categories.pop();
      user.favoriteCategories = categories;
    }

    await user.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
