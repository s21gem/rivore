import express from 'express';
import mongoose from 'mongoose';
import Settings from '../models/Settings';
import { authenticateAdmin } from '../middleware/auth';

const router = express.Router();

// Get settings (Public — strips sensitive payment credentials)
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json({ metaPixelId: '', storeName: 'Rivore', contactEmail: 'contact@rivore.com', contactPhone: '', heroImage: '', comboSectionImage: '' });

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }

    // Strip sensitive payment credentials from public response
    const publicSettings = settings.toObject();
    if (publicSettings.paymentBkash) {
      publicSettings.paymentBkash = { enabled: publicSettings.paymentBkash.enabled } as any;
    }
    if (publicSettings.paymentSslCommerz) {
      publicSettings.paymentSslCommerz = { enabled: publicSettings.paymentSslCommerz.enabled, isLive: publicSettings.paymentSslCommerz.isLive } as any;
    }
    if (publicSettings.paymentUddoktaPay) {
      publicSettings.paymentUddoktaPay = { enabled: publicSettings.paymentUddoktaPay.enabled, isLive: publicSettings.paymentUddoktaPay.isLive } as any;
    }

    res.json(publicSettings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get full settings including payment credentials (Admin only)
router.get('/admin', authenticateAdmin, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json({});

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update settings (Admin)
router.put('/', authenticateAdmin, async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: req.body },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: 'Error updating settings', error });
  }
});

export default router;
