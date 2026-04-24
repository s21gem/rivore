import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User';

const router = express.Router();

// Initial Setup - Create Admin if none exists
router.post('/setup', async (req, res) => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount > 0) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new User({ email, password: hashedPassword, role: 'admin' });
    await admin.save();

    res.status(201).json({ message: 'Admin created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Fallback for demo purposes if MongoDB is not connected
    if (mongoose.connection.readyState !== 1) {
      if (email === 'admin@rivore.com' && password === 'admin123') {
        const token = jwt.sign({ id: 'mock-admin-id', role: 'admin' }, process.env.JWT_SECRET || 'rivore_secret_key', {
          expiresIn: '1d',
        });
        return res.json({ token, user: { id: 'mock-admin-id', email: 'admin@rivore.com', role: 'admin' } });
      } else {
        return res.status(401).json({ message: 'Invalid credentials. (Demo: admin@rivore.com / admin123)' });
      }
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Fallback to demo credentials if no user found in DB
      if (email === 'admin@rivore.com' && password === 'admin123') {
        const token = jwt.sign({ id: 'mock-admin-id', role: 'admin' }, process.env.JWT_SECRET || 'rivore_secret_key', {
          expiresIn: '1d',
        });
        return res.json({ token, user: { id: 'mock-admin-id', email: 'admin@rivore.com', role: 'admin' } });
      }
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'rivore_secret_key', {
      expiresIn: '1d',
    });

    res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
