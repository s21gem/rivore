import express from 'express';
import mongoose from 'mongoose';
import Combo from '../models/Combo';
import { authenticateAdmin } from '../middleware/auth';

const router = express.Router();

// Get all combos
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json([]);

    const { category, featured } = req.query;
    const filter: any = {};
    if (category) filter.category = category;
    if (featured) filter.featured = featured === 'true';

    const combos = await Combo.find(filter).populate('products').sort({ displayOrder: 1, createdAt: -1 });
    res.json(combos);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single combo
router.get('/:id', async (req, res) => {
  try {
    const combo = await Combo.findById(req.params.id).populate('products');
    if (!combo) return res.status(404).json({ message: 'Combo not found' });
    res.json(combo);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create combo (Admin)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const combo = new Combo(req.body);
    await combo.save();
    req.app.get('io')?.emit('combos_updated');
    res.status(201).json(combo);
  } catch (error) {
    res.status(400).json({ message: 'Error creating combo', error });
  }
});

// Reorder combos (Admin)
router.put('/reorder', authenticateAdmin, async (req, res) => {
  try {
    const { items } = req.body; // Array of { _id, displayOrder }
    if (!Array.isArray(items)) return res.status(400).json({ message: 'Invalid data format' });

    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { _id: item._id },
        update: { displayOrder: item.displayOrder },
      },
    }));

    if (bulkOps.length > 0) {
      await Combo.bulkWrite(bulkOps);
      req.app.get('io')?.emit('combos_updated');
    }

    res.json({ message: 'Combos reordered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while reordering', error });
  }
});

// Update combo (Admin)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const combo = await Combo.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!combo) return res.status(404).json({ message: 'Combo not found' });
    req.app.get('io')?.emit('combos_updated');
    res.json(combo);
  } catch (error) {
    res.status(400).json({ message: 'Error updating combo', error });
  }
});

// Delete combo (Admin)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const combo = await Combo.findByIdAndDelete(req.params.id);
    if (!combo) return res.status(404).json({ message: 'Combo not found' });
    req.app.get('io')?.emit('combos_updated');
    res.json({ message: 'Combo deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
