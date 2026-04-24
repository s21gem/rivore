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

    const combos = await Combo.find(filter).populate('products').sort({ createdAt: -1 });
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
    res.status(201).json(combo);
  } catch (error) {
    res.status(400).json({ message: 'Error creating combo', error });
  }
});

// Update combo (Admin)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const combo = await Combo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!combo) return res.status(404).json({ message: 'Combo not found' });
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
    res.json({ message: 'Combo deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
