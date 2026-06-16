import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import Product from '../models/Product';
import { authenticateAdmin } from '../middleware/auth';
import { uploadToCloudinary } from '../utils/cloudinary';
import { logAdminActivity } from '../middleware/auditLogger';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Get all products
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json({ products: [], totalPages: 0, currentPage: 1, totalProducts: 0 });

    const { category, featured, search, page, limit, ...attributes } = req.query;
    const filter: any = {};
    
    if (category && category !== 'All') filter.category = category;
    if (featured) {
      filter.$or = [{ featured: true }, { isFeatured: true }];
    }
    if (search) filter.name = { $regex: search, $options: 'i' };

    // Handle dynamic attributes
    Object.keys(attributes).forEach(key => {
      if (attributes[key]) {
        filter[`attributes.${key}`] = attributes[key];
      }
    });

    const pageNum = parseInt((page as string) || '1', 10);
    const limitNum = parseInt((limit as string) || '1000', 10); // Default high limit for admin if not specified
    const skip = (pageNum - 1) * limitNum;

    const totalProducts = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.json({
      products,
      totalPages: Math.ceil(totalProducts / limitNum),
      currentPage: pageNum,
      totalProducts
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get personalized recommendations
router.get('/recommendations', async (req, res) => {
  try {
    let user = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rivore_secret_key');
        const User = require('../models/User').default;
        user = await User.findById(decoded.id);
      } catch (err) {
        // invalid token, ignore
      }
    }

    let products = [];
    const limit = 8; // Number of recommended products

    if (user) {
      // Find past purchased product IDs
      const Order = require('../models/Order').default;
      const orders = await Order.find({ customerId: user._id });
      const purchasedIds = new Set();
      orders.forEach((order: any) => {
        order.items.forEach((item: any) => {
          if (item.product) purchasedIds.add(item.product.toString());
        });
      });

      // Find products matching favorite categories that they haven't bought
      const matchCriteria: any = {
        _id: { $nin: Array.from(purchasedIds) },
        isOutOfStock: false
      };

      if (user.favoriteCategories && user.favoriteCategories.length > 0) {
        matchCriteria.category = { $in: user.favoriteCategories };
      }

      products = await Product.find(matchCriteria)
        .sort({ boostScore: -1, createdAt: -1 })
        .limit(limit)
        .lean();

      // If we don't have enough, fill with generic recommendations
      if (products.length < limit) {
        const excludeIds = new Set([...Array.from(purchasedIds), ...products.map(p => p._id.toString())]);
        const fillProducts = await Product.find({
          _id: { $nin: Array.from(excludeIds) },
          isOutOfStock: false
        })
          .sort({ boostScore: -1, isFeatured: -1, createdAt: -1 })
          .limit(limit - products.length)
          .lean();
        products = [...products, ...fillProducts];
      }
    } else {
      // Generic recommendations
      products = await Product.find({ isOutOfStock: false })
        .sort({ boostScore: -1, isFeatured: -1, createdAt: -1 })
        .limit(limit)
        .lean();
    }

    res.json(products);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single product by id or slug
router.get('/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let product;
    
    // Check if it's a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      product = await Product.findById(idOrSlug).lean();
    }
    
    // If not found by ID, try finding by slug
    if (!product) {
      product = await Product.findOne({ slug: idOrSlug }).lean();
    }

    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create product (Admin)
router.post('/', authenticateAdmin, upload.single('image'), logAdminActivity('Product Created', req => `Product Name: ${req.body?.name || 'Unknown'}`), async (req, res) => {
  try {
    let imageUrl = req.body.image;

    if (req.file && req.file.buffer) {
      imageUrl = await uploadToCloudinary(req.file.buffer, "rivore");
    } else if (!imageUrl) {
      return res.status(400).json({ message: "Image is required" });
    }

    // Parse JSON strings back to objects/arrays
    const productData = {
      ...req.body,
      image: imageUrl,
      images: req.body.images ? JSON.parse(req.body.images) : (imageUrl ? [imageUrl] : []),
      topNotes: req.body.topNotes ? JSON.parse(req.body.topNotes) : [],
      midNotes: req.body.midNotes ? JSON.parse(req.body.midNotes) : [],
      baseNotes: req.body.baseNotes ? JSON.parse(req.body.baseNotes) : [],
      sizes: req.body.sizes ? JSON.parse(req.body.sizes) : {},
      attributes: req.body.attributes ? JSON.parse(req.body.attributes) : {},
      isFeatured: req.body.isFeatured === 'true',
      stock: Number(req.body.stock),
      lowStockThreshold: Number(req.body.lowStockThreshold),
      discountAmount: Number(req.body.discountAmount) || 0,
    };

    const product = new Product(productData);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ message: 'Error creating product', error });
  }
});

// Update product (Admin)
router.put('/:id', authenticateAdmin, upload.single('image'), logAdminActivity('Product Updated', req => `Product ID: ${req.params.id}`), async (req, res) => {
  try {
    let imageUrl = req.body.image;

    if (req.file && req.file.buffer) {
      imageUrl = await uploadToCloudinary(req.file.buffer, "rivore");
    }

    // Parse JSON strings back to objects/arrays
    const productData = {
      ...req.body,
      image: imageUrl,
      images: req.body.images ? JSON.parse(req.body.images) : (imageUrl ? [imageUrl] : []),
      topNotes: req.body.topNotes ? JSON.parse(req.body.topNotes) : [],
      midNotes: req.body.midNotes ? JSON.parse(req.body.midNotes) : [],
      baseNotes: req.body.baseNotes ? JSON.parse(req.body.baseNotes) : [],
      sizes: req.body.sizes ? JSON.parse(req.body.sizes) : {},
      attributes: req.body.attributes ? JSON.parse(req.body.attributes) : {},
      isFeatured: req.body.isFeatured === 'true',
      stock: Number(req.body.stock),
      lowStockThreshold: Number(req.body.lowStockThreshold),
      discountAmount: Number(req.body.discountAmount) || 0,
    };

    const product = await Product.findByIdAndUpdate(req.params.id, productData, { returnDocument: 'after' });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error: any) {
    console.error('Error updating product:', error);
    res.status(400).json({ message: error.message || 'Error updating product', stack: error.stack, name: error.name });
  }
});

// Delete product (Admin)
router.delete('/:id', authenticateAdmin, logAdminActivity('Product Deleted', req => `Product ID: ${req.params.id}`), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
