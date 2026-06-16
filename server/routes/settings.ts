import express from 'express';
import mongoose from 'mongoose';
import Settings from '../models/Settings';
import { authenticateAdmin } from '../middleware/auth';
import AdminActivity from '../models/AdminActivity';
import { logAdminActivity } from '../middleware/auditLogger';
import AuditTrail from '../models/AuditTrail';

const router = express.Router();

let settingsCache: any = null;
let cacheTime = 0;
const CACHE_TTL = 60 * 1000; // 1 min

// Get settings (Public — strips sensitive payment credentials)
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json({ metaPixelId: '', storeName: 'Rivore', contactEmail: 'contact@rivore.com', contactPhone: '', heroImage: '', comboSectionImage: '' });

    if (settingsCache && Date.now() - cacheTime < CACHE_TTL) {
      return res.json(settingsCache);
    }

    let settings = await Settings.findOne().lean();
    if (!settings) {
      settings = await new Settings().save();
    }

    // Strip sensitive payment credentials from public response
    const publicSettings = { ...settings } as any;
    if (publicSettings.paymentBkash) {
      publicSettings.paymentBkash = { enabled: publicSettings.paymentBkash.enabled } as any;
    }
    if (publicSettings.paymentSslCommerz) {
      publicSettings.paymentSslCommerz = { enabled: publicSettings.paymentSslCommerz.enabled, isLive: publicSettings.paymentSslCommerz.isLive } as any;
    }
    if (publicSettings.paymentUddoktaPay) {
      publicSettings.paymentUddoktaPay = { enabled: publicSettings.paymentUddoktaPay.enabled } as any;
    }
    if (publicSettings.deliverySteadfast) {
      publicSettings.deliverySteadfast = { enabled: publicSettings.deliverySteadfast.enabled } as any;
    }
    if (publicSettings.securitySettings) {
      publicSettings.securitySettings = {
        turnstileEnabled: publicSettings.securitySettings.turnstileEnabled,
        turnstileSiteKey: publicSettings.securitySettings.turnstileSiteKey,
      } as any;
    }

    settingsCache = publicSettings;
    cacheTime = Date.now();
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
    
    const adminSettings = settings.toObject() as any;
    if (adminSettings.paymentUddoktaPay && adminSettings.paymentUddoktaPay.apiKey) {
      const key = adminSettings.paymentUddoktaPay.apiKey;
      const visible = key.length > 4 ? key.slice(-4) : key;
      adminSettings.paymentUddoktaPay.apiKey = '*'.repeat(20) + visible;
    }
    
    res.json(adminSettings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update settings (Admin)
router.put('/', authenticateAdmin, logAdminActivity('Settings Updated', req => Object.keys(req.body).join(', ')), async (req, res) => {
  try {
    const oldSettings = await Settings.findOne().lean();
    
    // Prevent overwriting API key with masked string
    if (req.body.paymentUddoktaPay && req.body.paymentUddoktaPay.apiKey && req.body.paymentUddoktaPay.apiKey.startsWith('********************')) {
       delete req.body.paymentUddoktaPay.apiKey;
       // If apiKey is deleted, we must ensure we don't accidentally blank it out during $set.
       // mongoose $set will just use whatever is passed in req.body.paymentUddoktaPay. 
       // We should preserve the old apiKey inside req.body if it's there.
       if (oldSettings?.paymentUddoktaPay?.apiKey) {
           req.body.paymentUddoktaPay.apiKey = oldSettings.paymentUddoktaPay.apiKey;
       }
    }

    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: req.body },
      { returnDocument: 'after', upsert: true, runValidators: true }
    );
    settingsCache = null; // invalidate cache

    // Generate Audit Trail
    if (oldSettings && settings) {
      const changes = [];
      for (const key of Object.keys(req.body)) {
        if (JSON.stringify((oldSettings as any)[key]) !== JSON.stringify((settings as any)[key])) {
          changes.push(key);
          await AuditTrail.create({
            settingName: key,
            oldValue: JSON.stringify((oldSettings as any)[key] || ''),
            newValue: JSON.stringify((settings as any)[key] || ''),
            adminName: (req as any).user?.email || 'Unknown Admin',
            adminId: (req as any).user?.id || 'unknown'
          });
        }
      }
    }

    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: 'Error updating settings', error });
  }
});

export default router;
