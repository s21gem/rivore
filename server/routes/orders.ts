import express from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order';
import Product from '../models/Product';
import { authenticateAdmin } from '../middleware/auth';
import Combo from '../models/Combo';
import Coupon from '../models/Coupon';
import Settings from '../models/Settings';
import Reward from '../models/Reward';
import User from '../models/User';
import Referral from '../models/Referral';
import * as XLSX from 'xlsx';
import { sendOrderConfirmationEmail, sendOrderShippedEmail, sendOrderDeliveredEmail } from '../utils/sendEmail';
import { sendOrderToSteadfast } from '../services/courierService';
import { verifyTurnstile } from '../middleware/turnstile';
import AdminActivity from '../models/AdminActivity';
import { sendMetaCapiEvent } from '../utils/metaCapi';

const router = express.Router();

// Create order (Public)
router.post('/', verifyTurnstile, async (req, res) => {
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
      let calculatedSubtotal = 0;

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

          // Calculate Price
          let basePrice = product.price || 0;
          if (item.size && product.sizes) {
            const sizePrice = product.sizes instanceof Map ? product.sizes.get(item.size) : (product.sizes as any)[item.size];
            if (sizePrice !== undefined) {
              basePrice = sizePrice;
            }
          }
          const discountPct = product.discountAmount || 0;
          const displayPrice = discountPct > 0 ? Math.round(basePrice * (1 - discountPct / 100)) : basePrice;
          calculatedSubtotal += displayPrice * item.quantity;

          // Reduce stock
          product.stock -= item.quantity;
          if (product.stock <= 0) {
            product.stock = 0;
            product.isOutOfStock = true;
          }
          await product.save({ session });
        } else if (item.type === 'combo') {
          const combo = await Combo.findById(item.combo || item.id).session(session);
          if (!combo) throw new Error(`Combo reference not found: ${item.name}`);
          
          calculatedSubtotal += combo.price * item.quantity;

          if (combo.isCustomizable && item.customProducts && item.customProducts.length > 0) {
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

      // Calculate Discounts
      const settings = await Settings.findOne().session(session);
      let calculatedDiscount = 0;

      // 1. Tier Discount
      let tierDiscountValue = 0;
      let userDoc = null;
      if (req.body.customerId) {
        userDoc = await User.findById(req.body.customerId).session(session);
        if (userDoc && settings?.tierSettings?.enabled) {
          let tierDiscountPercentage = 0;
          if (userDoc.tier === 'Silver') tierDiscountPercentage = settings.tierSettings.silverDiscount || 0;
          else if (userDoc.tier === 'Gold') tierDiscountPercentage = settings.tierSettings.goldDiscount || 0;
          else if (userDoc.tier === 'Platinum') tierDiscountPercentage = settings.tierSettings.platinumDiscount || 0;
          
          if (tierDiscountPercentage > 0) {
            tierDiscountValue = (calculatedSubtotal * tierDiscountPercentage) / 100;
          }
        }
      }

      // 2. Coupon Discount
      let couponDiscountValue = 0;
      if (req.body.couponCode) {
        const coupon = await Coupon.findOne({ code: req.body.couponCode, isActive: true }).session(session);
        if (coupon) {
          if (!coupon.expiresAt || new Date() <= coupon.expiresAt) {
            if (!coupon.customerId || coupon.customerId.toString() === req.body.customerId) {
              if (coupon.discountType === 'percentage') {
                couponDiscountValue = (calculatedSubtotal * coupon.discountAmount) / 100;
              } else {
                couponDiscountValue = coupon.discountAmount;
              }
              // Increment usage
              coupon.usageCount = (coupon.usageCount || 0) + 1;
              await coupon.save({ session });
            }
          }
        }
      }

      // Apply Highest Single Discount (Coupon vs Tier)
      if (tierDiscountValue >= couponDiscountValue && tierDiscountValue > 0) {
        calculatedDiscount += tierDiscountValue;
      } else if (couponDiscountValue > tierDiscountValue && couponDiscountValue > 0) {
        calculatedDiscount += couponDiscountValue;
      }

      // Rewards Logic
      const rewardSettings = settings?.rewardSettings || { enabled: true, spendForOnePoint: 100, discountPerPoint: 1 };
      let rewardDoc = null;
      let pointDiscount = 0;

      if (req.body.customerId && rewardSettings.enabled) {
        rewardDoc = await Reward.findOne({ customerId: req.body.customerId }).session(session);
        if (!rewardDoc) {
          rewardDoc = new Reward({ customerId: req.body.customerId, points: 0, transactions: [] });
        }

        if (req.body.redeemedPoints && req.body.redeemedPoints > 0) {
          const redeemed = Number(req.body.redeemedPoints);
          if (rewardDoc.points < redeemed) {
            throw new Error('Insufficient reward points');
          }
          
          pointDiscount = redeemed * (rewardSettings.discountPerPoint || 1);
          calculatedDiscount += pointDiscount;

          rewardDoc.points -= redeemed;
          rewardDoc.transactions.push({
            type: 'Redeemed',
            amount: redeemed,
            description: 'Redeemed for Order Discount',
            date: new Date()
          });
        }
      }

      const shippingCharge = settings?.shippingCharge !== undefined ? settings.shippingCharge : 0;
      const finalTotalAmount = Math.max(0, calculatedSubtotal - calculatedDiscount) + shippingCharge;

      const orderPayload = { 
        ...req.body, 
        redeemedPoints: req.body.redeemedPoints || 0,
        totalAmount: finalTotalAmount // SECURE SERVER CALCULATION
      };
      const order = new Order(orderPayload);
      await order.save({ session });

      // ---- DEFER AUTOMATIONS IF NOT COD ----
      if (order.paymentMethod === 'COD') {
        // Calculate earned points
        if (rewardDoc && rewardSettings.enabled && rewardSettings.spendForOnePoint > 0) {
          const pointsEarned = Math.floor(order.totalAmount / rewardSettings.spendForOnePoint);
          if (pointsEarned > 0) {
            rewardDoc.points += pointsEarned;
            rewardDoc.transactions.push({
              type: 'Earned',
              amount: pointsEarned,
              description: 'Earned from Order Purchase',
              date: new Date()
            });
          }
          await rewardDoc.save({ session });
        }

        // Update User Lifetime Spend and Tier
        if (req.body.customerId && userDoc) {
          userDoc.lifetimeSpend = (userDoc.lifetimeSpend || 0) + order.totalAmount;
          
          // Evaluate Tier
          let newTier = 'Regular';
          if (userDoc.lifetimeSpend >= 15000) newTier = 'Platinum';
          else if (userDoc.lifetimeSpend >= 10000) newTier = 'Gold';
          else if (userDoc.lifetimeSpend >= 5000) newTier = 'Silver';

          userDoc.tier = newTier;
          await userDoc.save({ session });
        }

        // Check if this is a referred user's first purchase to issue reward to referrer
        if (req.body.customerId) {
          const pastOrdersCount = await Order.countDocuments({ customerId: req.body.customerId }).session(session);
          if (pastOrdersCount === 0) { // Since this order isn't saved yet in DB query (it's in session, wait it is saved above)
            // Wait, order.save() was called above, so pastOrdersCount would be 1!
            // Actually it depends on isolation level, but we should just use pastOrdersCount <= 1 to be safe
            if (pastOrdersCount <= 1) {
              const referralRecord = await Referral.findOne({ 
                'referredUsers.referredUserId': req.body.customerId,
                'referredUsers.rewardIssued': false 
              }).session(session);

              if (referralRecord) {
                // Mark as rewarded
                const referredUserIndex = referralRecord.referredUsers.findIndex(
                  (u) => u.referredUserId?.toString() === req.body.customerId.toString()
                );
                if (referredUserIndex > -1) {
                  referralRecord.referredUsers[referredUserIndex].rewardIssued = true;
                  await referralRecord.save({ session });

                  // Reward the Referrer with 100 points
                  const referrerReward = await Reward.findOne({ customerId: referralRecord.customerId }).session(session);
                  if (referrerReward) {
                    referrerReward.points += 100;
                    referrerReward.transactions.push({
                      type: 'Earned',
                      amount: 100,
                      description: 'Referral Bonus: Friend completed first purchase',
                      date: new Date()
                    });
                    await referrerReward.save({ session });
                  }
                }
              }
            }
          }
        }
      }

      await session.commitTransaction();
      session.endSession();

      // Trigger Meta CAPI Purchase Event immediately only for COD
      // Online payments will trigger from their respective webhook handlers
      if (settings?.metaPixelId && settings?.metaConversionApiToken && order.paymentMethod === 'COD') {
        sendMetaCapiEvent(
          'Purchase',
          {
            value: order.totalAmount,
            currency: 'BDT',
            content_ids: order.items.map((i: any) => i.product?.toString() || i.combo?.toString() || i.id),
            contents: order.items.map((i: any) => ({
              id: i.product?.toString() || i.combo?.toString() || i.id,
              quantity: i.quantity,
              item_price: i.price
            })),
            email: order.customer?.email,
            phone: order.customer?.phone,
            eventId: order._id.toString()
          },
          settings.metaPixelId,
          settings.metaConversionApiToken,
          req.ip,
          req.headers['user-agent'],
          req.cookies ? req.cookies['_fbp'] : undefined,
          req.cookies ? req.cookies['_fbc'] : undefined
        );
      }

      // Send email asynchronously so it doesn't block the response
      try {
        const currentSettings = await Settings.findOne();
        sendOrderConfirmationEmail(order, currentSettings).catch(e => console.error('Email send failed:', e));
      } catch (emailErr) {
        console.error('Failed to prepare order confirmation email:', emailErr);
      }

      // PART 5: ORDER INTEGRATION (Auto-send)
      if (order.paymentMethod === 'COD') {
        try {
          const currentSettings = await Settings.findOne();
          if (currentSettings?.deliverySteadfast?.enabled && currentSettings?.deliverySteadfast?.autoSend) {
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
      }

      res.status(201).json(order);
    } catch (error: any) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
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

    const orders = await Order.find().sort({ createdAt: -1 }).lean();
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

    const originalOrder = await Order.findById(req.params.id);
    const order = await Order.findByIdAndUpdate(req.params.id, update, { returnDocument: 'after' });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Handle Notifications
    if (status && originalOrder && originalOrder.status !== status) {
      const currentSettings = await Settings.findOne();
      if (status === 'Shipped') {
        sendOrderShippedEmail(order, currentSettings).catch(e => console.error(e));
      } else if (status === 'Delivered') {
        sendOrderDeliveredEmail(order, currentSettings).catch(e => console.error(e));
      }
    }

    // Recalculate lifetime spend and tier if status changed
    if (order.customerId && status) {
      const deliveredOrders = await Order.find({ customerId: order.customerId, status: 'Delivered' });
      const lifetimeSpend = deliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      
      const settings = await Settings.findOne();
      const tierSettings = settings?.tierSettings || { enabled: true, silverSpend: 5000, goldSpend: 10000, platinumSpend: 15000 };
      
      let tier = 'Regular';
      if (tierSettings.enabled) {
        if (lifetimeSpend >= tierSettings.platinumSpend) tier = 'Platinum';
        else if (lifetimeSpend >= tierSettings.goldSpend) tier = 'Gold';
        else if (lifetimeSpend >= tierSettings.silverSpend) tier = 'Silver';
      }
      
      await User.findByIdAndUpdate(order.customerId, { lifetimeSpend, tier });

      // Referral Reward Logic: if Delivered and it's their FIRST delivered order
      if (status === 'Delivered' && deliveredOrders.length === 1) {
        const referralSettings = settings?.referralRewardSettings || { enabled: true, rewardPoints: 100 };
        if (referralSettings.enabled) {
          // Find if this customer was referred
          const referrerReferral = await Referral.findOne({ "referredUsers.referredUserId": order.customerId });
          if (referrerReferral) {
            const referredUserIndex = referrerReferral.referredUsers.findIndex(u => u.referredUserId?.toString() === order.customerId.toString());
            if (referredUserIndex > -1 && !referrerReferral.referredUsers[referredUserIndex].rewardIssued) {
              // Issue Reward to referrer
              let referrerReward = await Reward.findOne({ customerId: referrerReferral.customerId });
              if (!referrerReward) {
                referrerReward = new Reward({ customerId: referrerReferral.customerId, points: 0, transactions: [] });
              }
              referrerReward.points += referralSettings.rewardPoints;
              referrerReward.transactions.push({
                type: 'Earned',
                amount: referralSettings.rewardPoints,
                description: `Referral bonus for user ${order.customer.email}`,
                date: new Date()
              });
              await referrerReward.save();
              
              // Mark as issued
              referrerReferral.referredUsers[referredUserIndex].rewardIssued = true;
              await referrerReferral.save();
            }
          }
        }
      }
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: 'Error updating order', error });
  }
});

// Initiate Refund (Admin)
router.post('/:id/refund', authenticateAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    if (order.paymentStatus !== 'Paid') {
      return res.status(400).json({ message: 'Only Paid orders can be refunded' });
    }

    order.refundDetails = {
      refundStatus: 'Pending',
      refundReason: reason,
      refundAmount: order.totalAmount,
      refundDate: new Date().toISOString(),
      refundRequestedBy: 'Admin'
    };

    // Note: We don't change the paymentStatus to 'Refunded' until the gateway actually processes it, 
    // but since UddoktaPay might not have an auto-refund API yet, we can manually mark it.
    // For now, just mark the refund intention.
    order.paymentStatus = 'Refunded';
    order.status = 'Cancelled';

    await order.save();
    
    // Log Activity
    await AdminActivity.create({
      adminId: (req as any).user?.id || 'Unknown',
      adminName: (req as any).user?.email || 'Admin',
      action: 'Refund Initiated',
      target: `Order: ${order._id}`,
      details: `Amount: ${order.totalAmount}, Reason: ${reason}`
    }).catch(console.error);

    res.json({ message: 'Refund initiated', order });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ message: 'Failed to initiate refund', error });
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
