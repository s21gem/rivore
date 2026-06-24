import express from 'express';
import Wishlist from '../models/Wishlist';
import Product from '../models/Product';
import Combo from '../models/Combo';
import { authenticateAdmin as authenticate } from '../middleware/auth';

const router = express.Router();

// Define AuthRequest to include user object from authenticate middleware
interface AuthRequest extends express.Request {
  user?: any;
}

// All wishlist routes require authentication as a customer
const authenticateCustomer = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  authenticate(req, res, () => {
    if (req.user && req.user.role === 'customer') {
      next();
    } else {
      res.status(403).json({ message: 'Forbidden: Customers only' });
    }
  });
};

router.use(authenticateCustomer);

// Get user's wishlist
router.get('/', async (req: AuthRequest, res) => {
  try {
    let wishlist = await Wishlist.findOne({ customerId: req.user.id })
      .populate('products')
      .populate('combos');
      
    if (!wishlist) {
      wishlist = await new Wishlist({ customerId: req.user.id, products: [], combos: [] }).save();
    }
    
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching wishlist' });
  }
});

// Add item to wishlist
router.post('/add', async (req: AuthRequest, res) => {
  try {
    const { itemId, type } = req.body;
    if (!itemId || !type || !['product', 'combo'].includes(type)) {
      return res.status(400).json({ message: 'Invalid item data' });
    }

    let wishlist = await Wishlist.findOne({ customerId: req.user.id });
    if (!wishlist) {
      wishlist = new Wishlist({ customerId: req.user.id, products: [], combos: [] });
    }

    if (type === 'product') {
      if (!wishlist.products.includes(itemId)) {
        wishlist.products.push(itemId);
      }
    } else if (type === 'combo') {
      if (!wishlist.combos.includes(itemId)) {
        wishlist.combos.push(itemId);
      }
    }

    await wishlist.save();
    
    // Return populated wishlist
    const populatedWishlist = await Wishlist.findById(wishlist._id)
      .populate('products')
      .populate('combos');
      
    res.json(populatedWishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error adding to wishlist' });
  }
});

// Remove item from wishlist
router.post('/remove', async (req: AuthRequest, res) => {
  try {
    const { itemId, type } = req.body;
    if (!itemId || !type || !['product', 'combo'].includes(type)) {
      return res.status(400).json({ message: 'Invalid item data' });
    }

    const wishlist = await Wishlist.findOne({ customerId: req.user.id });
    if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });

    if (type === 'product') {
      wishlist.products = wishlist.products.filter(id => id.toString() !== itemId);
    } else if (type === 'combo') {
      wishlist.combos = wishlist.combos.filter(id => id.toString() !== itemId);
    }

    await wishlist.save();
    
    const populatedWishlist = await Wishlist.findById(wishlist._id)
      .populate('products')
      .populate('combos');
      
    res.json(populatedWishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error removing from wishlist' });
  }
});

export default router;
