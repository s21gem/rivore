import express from 'express';
import HeroMedia from '../models/HeroMedia';
import { authenticateAdmin } from '../middleware/auth';
import { logAdminActivity } from '../middleware/auditLogger';

const router = express.Router();

let activeCache: any = null;
let cacheTime = 0;
const CACHE_TTL = 60 * 1000;

// Public route to get all active hero media ordered by sortOrder
router.get('/active', async (_req, res) => {
  try {
    if (activeCache && Date.now() - cacheTime < CACHE_TTL) {
      return res.json(activeCache);
    }
    const heroMedias = await HeroMedia.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 }).lean();
    activeCache = heroMedias;
    cacheTime = Date.now();
    res.json(heroMedias);
  } catch (error) {
    console.error('Error fetching active hero media:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin route to get all hero media
router.get('/', authenticateAdmin, async (_req, res) => {
  try {
    const heroMedias = await HeroMedia.find().sort({ sortOrder: 1, createdAt: -1 }).lean();
    res.json(heroMedias);
  } catch (error) {
    console.error('Error fetching hero media:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin route to create a new hero media
router.post('/', authenticateAdmin, logAdminActivity('Hero Created', req => `Title: ${req.body?.title || 'Unknown'}`), async (req, res) => {
  try {
    const media = new HeroMedia(req.body);
    await media.save();
    activeCache = null; // invalidate cache
    res.status(201).json(media);
  } catch (error: any) {
    console.error('Error creating hero media:', error);
    res.status(400).json({ message: error.message || 'Error creating hero media' });
  }
});

// Admin route to update a hero media
router.put('/:id', authenticateAdmin, logAdminActivity('Hero Updated', req => `Hero ID: ${req.params.id}`), async (req, res) => {
  try {
    const media = await HeroMedia.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!media) {
      return res.status(404).json({ message: 'Hero media not found' });
    }
    activeCache = null; // invalidate cache
    res.json(media);
  } catch (error: any) {
    console.error('Error updating hero media:', error);
    res.status(400).json({ message: error.message || 'Error updating hero media' });
  }
});

// Admin route to delete a hero media
router.delete('/:id', authenticateAdmin, logAdminActivity('Hero Deleted', req => `Hero ID: ${req.params.id}`), async (req, res) => {
  try {
    const media = await HeroMedia.findByIdAndDelete(req.params.id);
    if (!media) {
      return res.status(404).json({ message: 'Hero media not found' });
    }
    activeCache = null; // invalidate cache
    res.json({ message: 'Hero media deleted successfully' });
  } catch (error) {
    console.error('Error deleting hero media:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin route to batch update sort order
router.post('/reorder', authenticateAdmin, logAdminActivity('Hero Reordered', () => 'Batch Order Update'), async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, sortOrder }
    
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'Items must be an array' });
    }

    const updates = items.map((item: any) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { sortOrder: item.sortOrder } }
      }
    }));

    if (updates.length > 0) {
      await HeroMedia.bulkWrite(updates);
      activeCache = null; // invalidate cache
    }
    
    res.json({ message: 'Reordered successfully' });
  } catch (error) {
    console.error('Error reordering hero media:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
