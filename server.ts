import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import dotenv from 'dotenv';
import path from 'path';
import logger from './server/utils/logger';

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
import customerAuthRoutes from './server/routes/customerAuth';
import customerRoutes from './server/routes/customer';
import adminRoutes from './server/routes/admin';
import wishlistRoutes from './server/routes/wishlist';
import heroMediaRoutes from './server/routes/heroMedia';
import { initBirthdayCron } from './server/utils/birthdayCron';
import { startCourierCron } from './server/services/courierCron';
import { startBackupCron } from './server/services/backupCron';
import { apiLimiter, authLimiter, checkoutLimiter } from './server/middleware/rateLimiter';
import { responseTracker } from './server/middleware/responseTracker';

async function startServer() {
  const app = express();
  const PORT = 3000;

  const httpServer = createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"]
    }
  });

  app.set('io', io);

  io.on('connection', (socket) => {
    console.log('Client connected for real-time updates:', socket.id);
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Security and Performance Middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://challenges.cloudflare.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://maps.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        frameSrc: ["'self'", "https://challenges.cloudflare.com", "https://www.google.com"],
        connectSrc: ["'self'", "https://api.cloudinary.com"],
        mediaSrc: ["'self'", "https://res.cloudinary.com"]
      },
    },
    xFrameOptions: { action: 'deny' },
    xContentTypeOptions: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    strictTransportSecurity: { maxAge: 31536000, includeSubDomains: true },
  }));
  app.disable('x-powered-by');
  app.use(compression());
  app.use(cors());
  
  // Global Middleware
  app.use(responseTracker);
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Limit body size
  app.use(mongoSanitize()); // Prevent NoSQL injection
  app.use(xss()); // Prevent XSS

  app.use(express.static(path.join(process.cwd(), 'public')));

  // Request logging using winston
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
  });

  // Database Connection
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rivore';
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Initialize background jobs
    initBirthdayCron();
    console.log('Initialized birthday cron job');
    startCourierCron();
    startBackupCron();
    console.log('Initialized backup cron job');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    logger.info('Running without database connection. APIs will return mock data or fail.');
  }

  // API Routes
  app.use('/api/', apiLimiter); // Apply general API limit
  app.use('/api/auth', authLimiter, authRoutes);
  app.use('/api/customer/auth', authLimiter, customerAuthRoutes);
  
  // Apply checkout limiter specifically to order creation (assumes POST /api/orders)
  app.use('/api/orders', (req, res, next) => {
    if (req.method === 'POST') {
      return checkoutLimiter(req, res, next);
    }
    next();
  }, orderRoutes);

  app.use('/api/products', productRoutes);
  app.use('/api/combos', comboRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/testimonials', testimonialRoutes);
  app.use('/api/payment', paymentRoutes);
  app.use('/api/coupons', couponRoutes);
  app.use('/api/customer', customerRoutes);
  app.use('/api/wishlist', wishlistRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/heroMedia', heroMediaRoutes);

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Rivoré API is running' });
  });

  // Global error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error(`Global error handler: ${err.message}`, { stack: err.stack, url: req.url });
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

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
