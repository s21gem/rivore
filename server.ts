import express from 'express';
import { createServer as createViteServer } from 'vite';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Import Routes
import authRoutes from './server/routes/auth';
import productRoutes from './server/routes/products';
import comboRoutes from './server/routes/combos';
import orderRoutes from './server/routes/orders';
import settingsRoutes from './server/routes/settings';
import uploadRoutes from './server/routes/upload';
import testimonialRoutes from './server/routes/testimonials';
import paymentRoutes from './server/routes/payment';
import couponRoutes from './server/routes/coupons';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Request logging
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Database Connection
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rivore';
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('Running without database connection. APIs will return mock data or fail.');
  }

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/combos', comboRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/testimonials', testimonialRoutes);
  app.use('/api/payment', paymentRoutes);
  app.use('/api/coupons', couponRoutes);

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Rivore API is running' });
  });

  // Global error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Global error handler:', err);
    res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
