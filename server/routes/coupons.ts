import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import Coupon from '../models/Coupon.js';
import { logAdminActivity } from '../middleware/auditLogger';

const router = express.Router();

// Removed manual isAdmin in favor of authenticateAdmin

// Get all coupons (Admin only)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching coupons' });
  }
});

// Create a new coupon (Admin only)
router.post('/', authenticateAdmin, logAdminActivity('Coupon Created', req => `Code: ${req.body?.code || 'Unknown'}`), async (req, res) => {
  try {
    const { code, discountType, discountAmount, isActive } = req.body;
    
    // Check if code exists
    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const newCoupon = new Coupon({
      code,
      discountType,
      discountAmount,
      isActive: isActive !== undefined ? isActive : true
    });

    await newCoupon.save();
    res.status(201).json(newCoupon);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error creating coupon' });
  }
});

// Update a coupon (Admin only)
router.put('/:id', authenticateAdmin, logAdminActivity('Coupon Updated', req => `Coupon ID: ${req.params.id}`), async (req, res) => {
  try {
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after' }
    );
    if (!updatedCoupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json(updatedCoupon);
  } catch (error) {
    res.status(500).json({ message: 'Error updating coupon' });
  }
});

// Delete a coupon (Admin only)
router.delete('/:id', authenticateAdmin, logAdminActivity('Coupon Deleted', req => `Coupon ID: ${req.params.id}`), async (req, res) => {
  try {
    const deleted = await Coupon.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Coupon not found' });
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting coupon' });
  }
});

// Public: Validate a coupon
router.post('/validate', async (req, res) => {
  try {
    const { code, customerId } = req.body;
    if (!code) return res.status(400).json({ message: 'Coupon code is required' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid or expired coupon' });
    }

    // Check expiration if expiresAt is set
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return res.status(400).json({ message: 'This coupon has expired' });
    }

    // Check customerId if coupon is customer specific
    if (coupon.customerId) {
      if (!customerId || coupon.customerId.toString() !== customerId.toString()) {
        return res.status(400).json({ message: 'This coupon is not valid for this account' });
      }
    }

    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountAmount: coupon.discountAmount
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error validating coupon' });
  }
});

export default router;
