import express from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order';
import Product from '../models/Product';
import { authenticateAdmin } from '../middleware/auth';
import Combo from '../models/Combo';
import Coupon from '../models/Coupon';
import Settings from '../models/Settings';
import * as XLSX from 'xlsx';
import { sendOrderConfirmationEmail } from '../utils/sendEmail';
import { sendOrderToSteadfast } from '../services/courierService';

const router = express.Router();

// Create order (Public)
router.post('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      // Mock successful order creation for demo purposes
      return res.status(201).json({
        _id: 'mock-order-' + Date.now(),
        ...req.body,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString()
      });
    }

    const { items } = req.body;

    // Validate and reduce stock
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      for (const item of items) {
        if (item.type === 'product') {
          const productId = (item.product || item.id).split('-')[0]; // Extract actual product ID
          const product = await Product.findById(productId).session(session);
          
          if (!product) {
            throw new Error(`Product not found: ${item.name}`);
          }

          if (product.stock < item.quantity) {
            throw new Error(`Insufficient stock for ${product.name}. Only ${product.stock} left.`);
          }

          // Reduce stock
          product.stock -= item.quantity;
          if (product.stock <= 0) {
            product.stock = 0;
            product.isOutOfStock = true;
          }
          await product.save({ session });
        } else if (item.type === 'combo' && item.customProducts && item.customProducts.length > 0) {
          const combo = await Combo.findById(item.combo || item.id).session(session);
          if (!combo) throw new Error(`Combo reference not found: ${item.name}`);
          
          if (combo.isCustomizable) {
            if (item.customProducts.length !== combo.customSize) {
              throw new Error(`Custom combo requires exactly ${combo.customSize} items. You provided ${item.customProducts.length}.`);
            }
            
            for (const customId of item.customProducts) {
               const cProduct = await Product.findById(customId).session(session);
               if (!cProduct) throw new Error(`Invalid custom combo item found.`);
               
               if (cProduct.stock < item.quantity) {
                  throw new Error(`Insufficient stock for ${cProduct.name} in your custom combo. Only ${cProduct.stock} left.`);
               }
               
               cProduct.stock -= item.quantity;
               if (cProduct.stock <= 0) {
                 cProduct.stock = 0;
                 cProduct.isOutOfStock = true;
               }
               await cProduct.save({ session });
            }
          }
        }
      }

      const order = new Order(req.body);
      await order.save({ session });

      // If coupon used, increment usage count
      if (req.body.couponCode) {
        await Coupon.findOneAndUpdate(
          { code: req.body.couponCode },
          { $inc: { usageCount: 1 } },
          { session }
        );
      }

      await session.commitTransaction();
      session.endSession();

      // Send email asynchronously so it doesn't block the response
      try {
        const settings = await Settings.findOne();
        sendOrderConfirmationEmail(order, settings).catch(e => console.error('Email send failed:', e));
      } catch (emailErr) {
        console.error('Failed to prepare order confirmation email:', emailErr);
      }

      // PART 5: ORDER INTEGRATION (Auto-send)
      try {
        const settings = await Settings.findOne();
        if (settings?.deliverySteadfast?.enabled && settings?.deliverySteadfast?.autoSend) {
          const courierResult = await sendOrderToSteadfast(order);
          if (courierResult?.success) {
            order.delivery = {
              consignmentId: courierResult.consignmentId,
              trackingCode: courierResult.trackingCode,
              status: 'sent'
            };
            await order.save();
          } else if (courierResult) {
            order.delivery = {
              ...order.delivery,
              status: 'failed',
              error: courierResult.error
            };
            await order.save();
          }
        }
      } catch (courierErr) {
        console.error('Automated Courier Dispatch Failed:', courierErr);
      }

      res.status(201).json(order);
    } catch (error: any) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: error.message || 'Error creating order' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error creating order', error });
  }
});

// Get all orders (Admin)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json([]);

    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Track order by phone number (Public — no auth required, must be before /:id)
router.get('/track', async (req, res) => {
  try {
    const phone = req.query.phone as string;
    if (!phone || phone.length < 11) {
      return res.status(400).json({ message: 'Valid phone number is required' });
    }

    const orders = await Order.find({ 'customer.phone': phone })
      .sort({ createdAt: -1 })
      .select('customer.name items.name items.quantity items.price totalAmount status paymentMethod paymentStatus createdAt')
      .limit(10);

    if (orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this phone number' });
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Export orders as CSV or XLSX (Admin) — must be before /:id route
router.get('/export', authenticateAdmin, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(400).json({ message: 'Database not connected' });
    }

    const format = (req.query.format as string) || 'csv';
    const orders = await Order.find().sort({ createdAt: -1 }).lean();

    // Build rows
    const rows = orders.map((order: any) => ({
      'Order ID': order._id?.toString() || '',
      'Customer Name': order.customer?.name || '',
      'Phone': order.customer?.phone || '',
      'Email': order.customer?.email || '',
      'Address': `${order.customer?.address || ''}, ${order.customer?.city || ''} ${order.customer?.zip || ''}`.trim(),
      'Products': (order.items || []).map((i: any) => `${i.quantity}x ${i.name}`).join(' | '),
      'Total (৳)': order.totalAmount?.toFixed(2) || '0.00',
      'Coupon Applied': order.couponCode ? `${order.couponCode} (-৳${order.discountApplied})` : 'None',
      'Payment': order.paymentMethod || 'COD',
      'Payment Status': order.paymentStatus || 'Pending',
      'Order Status': order.status || 'Pending',
      'Date': order.createdAt ? new Date(order.createdAt).toLocaleString('en-BD', { timeZone: 'Asia/Dhaka' }) : '',
    }));

    if (format === 'xlsx') {
      const ws = XLSX.utils.json_to_sheet(rows);
      // Auto-size columns
      const colWidths = Object.keys(rows[0] || {}).map(key => ({
        wch: Math.max(key.length, ...rows.map(r => String((r as any)[key] || '').length)).valueOf()
      }));
      ws['!cols'] = colWidths.map(w => ({ wch: Math.min(w.wch + 2, 60) }));

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Orders');
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Disposition', 'attachment; filename=rivore-orders.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      return res.send(buf);
    }

    // CSV format
    if (rows.length === 0) {
      res.setHeader('Content-Disposition', 'attachment; filename=rivore-orders.csv');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      return res.send('No orders found');
    }

    const headers = Object.keys(rows[0]);
    const csvLines = [
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(row =>
        headers.map(h => `"${String((row as any)[h] || '').replace(/"/g, '""')}"`).join(',')
      ),
    ];
    const csv = '\uFEFF' + csvLines.join('\n'); // BOM for Excel UTF-8 compat

    res.setHeader('Content-Disposition', 'attachment; filename=rivore-orders.csv');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    return res.send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Failed to export orders' });
  }
});

// Get single order (Admin)
router.get('/:id', authenticateAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product').populate('items.combo');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status (Admin)
router.put('/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const update: any = {};
    if (status) update.status = status;
    if (paymentStatus) update.paymentStatus = paymentStatus;

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: 'Error updating order', error });
  }
});

// Manual send to courier (Admin)
router.post('/:id/send-to-courier', authenticateAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const result = await sendOrderToSteadfast(order);
    
    if (result?.success) {
      order.delivery = {
        consignmentId: result.consignmentId,
        trackingCode: result.trackingCode,
        status: 'sent'
      };
      await order.save();
      return res.json({ success: true, order });
    } else {
      order.delivery = {
        ...order.delivery,
        status: 'failed',
        error: result?.error || 'Unknown error'
      };
      await order.save();
      return res.status(400).json({ success: false, message: result?.error || 'Failed to send to courier' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete order (Admin) — restores stock if order wasn't cancelled/delivered
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Restore stock for non-cancelled/delivered orders
    if (order.status !== 'Cancelled' && order.status !== 'Delivered') {
      for (const item of order.items) {
        if (item.type === 'product' && item.product) {
          await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
        }
      }
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting order', error });
  }
});


export default router;
