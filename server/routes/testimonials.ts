import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import { Testimonial } from '../models/Testimonial';
import { authenticateAdmin } from '../middleware/auth';
import { uploadToCloudinary } from '../utils/cloudinary';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Public: Get testimonials
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json([]);

    const { active, limit } = req.query;
    let query: any = {};
    
    if (active === 'true') {
      query.isActive = true;
    }

    const maxLimit = limit ? parseInt(limit as string) : 20;

    const testimonials = await Testimonial.find(query).sort({ createdAt: -1 }).limit(maxLimit);
    res.json(testimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ message: 'Server error fetching testimonials' });
  }
});

// Admin: Configure a new testimonial
router.post('/', authenticateAdmin, upload.single('image'), async (req, res) => {
  try {


    let imageUrl = '';

    if (req.file && req.file.buffer) {
      imageUrl = await uploadToCloudinary(req.file.buffer, "rivore-testimonials");
    }

    const testimonial = new Testimonial({
      name: req.body.name,
      message: req.body.message,
      rating: Number(req.body.rating),
      image: imageUrl,
      isActive: req.body.isActive === 'true' || req.body.isActive === true,
    });

    await testimonial.save();

    res.status(201).json(testimonial);

  } catch (error: any) {
    console.error("TESTIMONIAL ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// Admin: Update a testimonial
router.put('/:id', authenticateAdmin, upload.single('image'), async (req, res) => {
  try {


    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    let imageUrl = testimonial.image;

    if (req.file && req.file.buffer) {
      imageUrl = await uploadToCloudinary(req.file.buffer, "rivore-testimonials");
    } else if (req.body.image !== undefined) {
      imageUrl = req.body.image;
    }

    if (req.body.name !== undefined) testimonial.name = req.body.name;
    if (req.body.message !== undefined) testimonial.message = req.body.message;
    if (req.body.rating !== undefined) testimonial.rating = Number(req.body.rating);
    if (req.body.isActive !== undefined) testimonial.isActive = req.body.isActive === 'true' || req.body.isActive === true;
    
    testimonial.image = imageUrl || '';

    await testimonial.save();
    res.json(testimonial);
  } catch (error: any) {
    console.error('TESTIMONIAL ERROR:', error);
    res.status(500).json({ message: error.message });
  }
});

// Admin: Delete a testimonial
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }
    
    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({ message: 'Server error deleting testimonial' });
  }
});

export default router;
