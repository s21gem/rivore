import express from 'express';
import Settings from '../models/Settings';
import Order from '../models/Order';
import { authenticateAdmin } from '../middleware/auth';
import { sendMetaCapiEvent } from '../utils/metaCapi';

const router = express.Router();

// ============================================
// bKash Tokenized Payment Flow
// ============================================

// Step 1: Create bKash Payment — called from frontend checkout
router.post('/bkash/create', async (req, res) => {
  try {
    const settings = await Settings.findOne();
    if (!settings?.paymentBkash?.enabled || !settings.paymentBkash.apiKey) {
      return res.status(400).json({ message: 'bKash payment is not configured' });
    }

    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ message: 'orderId is required' });
    }
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const amount = order.totalAmount;

    // Step 1a: Get bKash Grant Token
    const tokenRes = await fetch('https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout/token/grant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        username: settings.paymentBkash.merchantId,
        password: settings.paymentBkash.apiSecret,
      },
      body: JSON.stringify({
        app_key: settings.paymentBkash.apiKey,
        app_secret: settings.paymentBkash.apiSecret,
      }),
    });
    const tokenData = await tokenRes.json();
    
    if (!tokenData.id_token) {
      return res.status(500).json({ message: 'Failed to get bKash token', detail: tokenData });
    }

    // Step 1b: Create Payment
    const paymentRes = await fetch('https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: tokenData.id_token,
        'X-APP-Key': settings.paymentBkash.apiKey,
      },
      body: JSON.stringify({
        mode: '0011',
        payerReference: orderId,
        callbackURL: `${req.protocol}://${req.get('host')}/api/payment/bkash/callback`,
        amount: String(amount),
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: orderId,
      }),
    });
    const paymentData = await paymentRes.json();

    if (paymentData.bkashURL) {
      res.json({ bkashURL: paymentData.bkashURL, paymentID: paymentData.paymentID });
    } else {
      res.status(500).json({ message: 'Failed to create bKash payment', detail: paymentData });
    }
  } catch (error: any) {
    console.error('bKash create error:', error);
    res.status(500).json({ message: 'bKash payment error', error: error.message });
  }
});

// Step 2: bKash Callback — user is redirected here after bKash app
router.get('/bkash/callback', async (req, res) => {
  try {
    const { paymentID, status } = req.query;
    
    if (status !== 'success') {
      return res.redirect(`/checkout?payment=failed&reason=${status}`);
    }

    const settings = await Settings.findOne();
    if (!settings?.paymentBkash?.apiKey) {
      return res.redirect('/checkout?payment=failed&reason=config');
    }

    // Get token again for execute
    const tokenRes = await fetch('https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout/token/grant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        username: settings.paymentBkash.merchantId,
        password: settings.paymentBkash.apiSecret,
      },
      body: JSON.stringify({
        app_key: settings.paymentBkash.apiKey,
        app_secret: settings.paymentBkash.apiSecret,
      }),
    });
    const tokenData = await tokenRes.json();

    // Execute Payment
    const executeRes = await fetch('https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: tokenData.id_token,
        'X-APP-Key': settings.paymentBkash.apiKey,
      },
      body: JSON.stringify({ paymentID }),
    });
    const executeData = await executeRes.json();

    if (executeData.transactionStatus === 'Completed') {
      // Update order payment status
      await Order.findByIdAndUpdate(executeData.merchantInvoiceNumber, {
        $set: { paymentStatus: 'Paid', paymentMethod: 'bKash' }
      });
      res.redirect(`/checkout?payment=success&trxID=${executeData.trxID}`);
    } else {
      res.redirect(`/checkout?payment=failed&reason=execute_failed`);
    }
  } catch (error: any) {
    console.error('bKash callback error:', error);
    res.redirect('/checkout?payment=failed&reason=server_error');
  }
});


// ============================================
// SSLCommerz Payment Flow
// ============================================

router.post('/sslcommerz/init', async (req, res) => {
  try {
    const settings = await Settings.findOne();
    if (!settings?.paymentSslCommerz?.enabled || !settings.paymentSslCommerz.storeId) {
      return res.status(400).json({ message: 'SSLCommerz is not configured' });
    }

    const { orderId, customerName, customerEmail, customerPhone, customerAddress, customerCity } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ message: 'orderId is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const amount = order.totalAmount;
    
    const baseUrl = settings.paymentSslCommerz.isLive
      ? 'https://securepay.sslcommerz.com'
      : 'https://sandbox.sslcommerz.com';

    const sslData = new URLSearchParams({
      store_id: settings.paymentSslCommerz.storeId,
      store_passwd: settings.paymentSslCommerz.storePassword,
      total_amount: String(amount),
      currency: 'BDT',
      tran_id: orderId,
      success_url: `${req.protocol}://${req.get('host')}/api/payment/sslcommerz/success`,
      fail_url: `${req.protocol}://${req.get('host')}/api/payment/sslcommerz/fail`,
      cancel_url: `${req.protocol}://${req.get('host')}/api/payment/sslcommerz/cancel`,
      ipn_url: `${req.protocol}://${req.get('host')}/api/payment/sslcommerz/ipn`,
      cus_name: customerName || 'Customer',
      cus_email: customerEmail || 'customer@example.com',
      cus_phone: customerPhone || '01700000000',
      cus_add1: customerAddress || 'Dhaka',
      cus_city: customerCity || 'Dhaka',
      cus_country: 'Bangladesh',
      shipping_method: 'Courier',
      product_name: 'Rivoré Perfumes',
      product_category: 'Perfume',
      product_profile: 'general',
    });

    const sslRes = await fetch(`${baseUrl}/gwprocess/v4/api.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: sslData.toString(),
    });
    const sslResult = await sslRes.json();

    if (sslResult.status === 'SUCCESS') {
      res.json({ gatewayUrl: sslResult.GatewayPageURL });
    } else {
      res.status(500).json({ message: 'Failed to init SSLCommerz', detail: sslResult });
    }
  } catch (error: any) {
    console.error('SSLCommerz init error:', error);
    res.status(500).json({ message: 'SSLCommerz error', error: error.message });
  }
});

// SSLCommerz IPN + Success/Fail/Cancel handlers
router.post('/sslcommerz/success', async (req, res) => {
  try {
    const { tran_id, val_id } = req.body;
    
    // Validate transaction
    const settings = await Settings.findOne();
    if (!settings?.paymentSslCommerz?.storeId) {
      return res.redirect('/checkout?payment=failed&reason=config');
    }
    
    const baseUrl = settings.paymentSslCommerz.isLive
      ? 'https://securepay.sslcommerz.com'
      : 'https://sandbox.sslcommerz.com';

    const valRes = await fetch(`${baseUrl}/validator/api/validationserverAPI.php?val_id=${val_id}&store_id=${settings.paymentSslCommerz.storeId}&store_passwd=${settings.paymentSslCommerz.storePassword}&format=json`);
    const valData = await valRes.json();

    if (valData.status === 'VALID' || valData.status === 'VALIDATED') {
      await Order.findByIdAndUpdate(tran_id, {
        $set: { paymentStatus: 'Paid', paymentMethod: 'SSLCommerz' }
      });
      res.redirect(`/checkout?payment=success&trxID=${tran_id}`);
    } else {
      res.redirect(`/checkout?payment=failed&reason=validation_failed`);
    }
  } catch (error) {
    console.error('SSLCommerz success handler error:', error);
    res.redirect('/checkout?payment=failed&reason=server_error');
  }
});

router.post('/sslcommerz/fail', (req, res) => {
  res.redirect('/checkout?payment=failed&reason=payment_failed');
});

router.post('/sslcommerz/cancel', (req, res) => {
  res.redirect('/checkout?payment=cancelled');
});

router.post('/sslcommerz/ipn', async (req, res) => {
  try {
    const { tran_id, status } = req.body;
    if (status === 'VALID') {
      await Order.findByIdAndUpdate(tran_id, {
        $set: { paymentStatus: 'Paid', paymentMethod: 'SSLCommerz' }
      });
    }
    res.status(200).json({ message: 'IPN received' });
  } catch (error) {
    res.status(500).json({ message: 'IPN error' });
  }
});


// ============================================
// UddoktaPay Payment Flow
// ============================================

import Reward from '../models/Reward';
import User from '../models/User';
import Referral from '../models/Referral';
import { sendOrderToSteadfast } from '../services/courierService';
import AdminActivity from '../models/AdminActivity';
import SecurityEvent from '../models/SecurityEvent';

// Post Payment Automation Helper
const processPostPaymentAutomations = async (orderId: string, invoiceId?: string, transactionId?: string) => {
  const order = await Order.findById(orderId);
  if (!order || order.paymentStatus !== 'Paid') return;

  const settings = await Settings.findOne();
  const upSettings = settings?.paymentUddoktaPay;

  // 1. Award Loyalty Points
  if (upSettings?.autoAwardLoyaltyPoints && settings?.rewardSettings?.enabled) {
    if (order.customerId) {
      let rewardDoc = await Reward.findOne({ customerId: order.customerId });
      if (!rewardDoc) rewardDoc = new Reward({ customerId: order.customerId, points: 0, transactions: [] });
      
      // Check if this specific order was already awarded to prevent duplicate processing
      const alreadyAwarded = rewardDoc.transactions.some(t => t.description.includes(order._id.toString()));
      if (!alreadyAwarded) {
        const pointsEarned = Math.floor(order.totalAmount / (settings.rewardSettings.spendForOnePoint || 100));
        if (pointsEarned > 0) {
          rewardDoc.points += pointsEarned;
          rewardDoc.transactions.push({
            type: 'Earned',
            amount: pointsEarned,
            description: `Earned from Order Purchase (Online): ${order._id}`,
            date: new Date()
          });
          await rewardDoc.save();
        }
      }
    }
  }

  // 2. Update Membership Tier & Lifetime Spend
  if (upSettings?.autoUpdateMembershipTier && order.customerId) {
    const userDoc = await User.findById(order.customerId);
    if (userDoc) {
      // Recalculate lifetime spend properly or just append
      // For safety against double appending, it's better to aggregate all 'Paid' and 'COD' orders
      const allOrders = await Order.find({ 
        customerId: order.customerId, 
        status: { $ne: 'Cancelled' },
        $or: [{ paymentMethod: 'COD' }, { paymentStatus: 'Paid' }]
      });
      const totalSpend = allOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      userDoc.lifetimeSpend = totalSpend;

      let newTier = 'Regular';
      if (totalSpend >= 15000) newTier = 'Platinum';
      else if (totalSpend >= 10000) newTier = 'Gold';
      else if (totalSpend >= 5000) newTier = 'Silver';
      userDoc.tier = newTier;
      await userDoc.save();
    }
  }

  // 3. Send to Steadfast
  if (upSettings?.autoSendToSteadfast && settings?.deliverySteadfast?.enabled && order.delivery?.status === 'none') {
    const courierResult = await sendOrderToSteadfast(order);
    if (courierResult?.success) {
      order.delivery = { consignmentId: courierResult.consignmentId, trackingCode: courierResult.trackingCode, status: 'sent' };
      await order.save();
    } else if (courierResult) {
      order.delivery = { ...order.delivery, status: 'failed', error: courierResult.error };
      await order.save();
    }
  }

  // 4. Activity Log
  if (upSettings?.enableActivityLogging) {
    await AdminActivity.create({
      adminId: 'system',
      adminName: 'System Automation',
      action: 'Payment Verified',
      target: `Order ${orderId}`,
      ipAddress: '127.0.0.1',
      deviceType: 'Server'
    }).catch(() => {});
  }
  
  // 5. Trigger Meta CAPI for successful online payment
  if (settings?.metaPixelId && settings?.metaConversionApiToken) {
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
      settings.metaConversionApiToken
    );
  }
};


router.post('/uddoktapay/create', async (req, res) => {
  try {
    const settings = await Settings.findOne();
    if (!settings?.paymentUddoktaPay?.enabled || !settings.paymentUddoktaPay.apiKey) {
      return res.status(400).json({ message: 'UddoktaPay is not configured' });
    }

    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ message: 'orderId is required' });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const baseUrl = settings.paymentUddoktaPay.baseUrl || 'https://rivore.paymently.io/api';
    
    const payload = {
      full_name: order.customer.name || 'Customer',
      email: order.customer.email || 'customer@rivore.com',
      amount: String(order.totalAmount),
      metadata: { order_id: orderId, customer_id: order.customerId?.toString() || '' },
      redirect_url: settings.paymentUddoktaPay.successUrl || `${req.protocol}://${req.get('host')}/payment/uddoktapay/success`,
      cancel_url: settings.paymentUddoktaPay.cancelUrl || `${req.protocol}://${req.get('host')}/payment/uddoktapay/cancel`,
      webhook_url: settings.paymentUddoktaPay.webhookUrl || `${req.protocol}://${req.get('host')}/api/payment/uddoktapay/webhook`,
      return_type: "GET"
    };

    const uddoktaRes = await fetch(`${baseUrl}/checkout-v2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'RT-UDDOKTAPAY-API-KEY': settings.paymentUddoktaPay.apiKey,
      },
      body: JSON.stringify(payload),
    });
    
    const uddoktaData = await uddoktaRes.json();

    if (uddoktaData.status && uddoktaData.payment_url) {
      if (settings.paymentUddoktaPay.enableActivityLogging) {
        await AdminActivity.create({
          adminId: 'system', adminName: 'System Automation',
          action: 'Payment Created', target: `Order ${orderId}`,
          ipAddress: req.ip || req.connection.remoteAddress || '', deviceType: 'Server'
        }).catch(() => {});
      }
      res.json({ payment_url: uddoktaData.payment_url });
    } else {
      res.status(500).json({ message: 'Failed to init UddoktaPay', detail: uddoktaData });
    }
  } catch (error: any) {
    console.error('UddoktaPay create error:', error);
    res.status(500).json({ message: 'UddoktaPay error', error: error.message });
  }
});

// Verify Payment (Called by frontend success page)
router.post('/uddoktapay/verify', async (req, res) => {
  try {
    const { invoice_id } = req.body;
    
    const settings = await Settings.findOne();
    if (!settings?.paymentUddoktaPay?.apiKey) {
      return res.status(400).json({ message: 'Gateway not configured' });
    }

    const baseUrl = settings.paymentUddoktaPay.baseUrl || 'https://rivore.paymently.io/api';

    // Verify payment
    const verifyRes = await fetch(`${baseUrl}/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'RT-UDDOKTAPAY-API-KEY': settings.paymentUddoktaPay.apiKey,
      },
      body: JSON.stringify({ invoice_id }),
    });
    const verifyData = await verifyRes.json();

    if (verifyData.status === 'COMPLETED') {
      const orderId = verifyData.metadata?.order_id;
      if (orderId) {
        const order = await Order.findById(orderId);
        
        // Prevent duplicate processing
        if (order && order.paymentStatus !== 'Paid') {
          await Order.findByIdAndUpdate(orderId, {
            $set: { 
              paymentStatus: 'Paid', 
              paymentMethod: 'UddoktaPay',
              paymentDetails: {
                invoice_id: invoice_id,
                transaction_id: verifyData.transaction_id,
                sender_number: verifyData.sender_number,
                charged_amount: verifyData.amount,
                payment_date: verifyData.date,
                gateway_name: 'UddoktaPay',
                verification_time: new Date().toISOString(),
                full_gateway_response: verifyData
              }
            }
          });
          
          await processPostPaymentAutomations(orderId, invoice_id, verifyData.transaction_id);
        }
      }
      res.json({ success: true, verifyData });
    } else {
      res.json({ success: false, verifyData });
    }
  } catch (error: any) {
    console.error('UddoktaPay verify error:', error);
    res.status(500).json({ success: false, message: 'Verification error' });
  }
});

// Test Connection (Admin)
router.post('/uddoktapay/test', authenticateAdmin, async (req, res) => {
  try {
    const { apiKey, baseUrl } = req.body;
    if (!apiKey) return res.status(400).json({ message: 'API Key is required' });

    const apiUrl = baseUrl || 'https://rivore.paymently.io/api';
    
    // We can test by verifying a dummy invoice or just hitting the base verify endpoint
    // An invalid invoice will return an error, but it proves we can reach the server.
    // However, let's just make a dummy request to /verify-payment
    const startTime = Date.now();
    const testRes = await fetch(`${apiUrl}/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'RT-UDDOKTAPAY-API-KEY': apiKey,
      },
      body: JSON.stringify({ invoice_id: 'test_connection' }),
    });
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    const data = await testRes.json();
    
    // UddoktaPay will return {"status": false, "message": "Invoice ID not found."} if API key is valid.
    // If API key is invalid, it might return 401 Unauthorized or similar.
    if (testRes.status === 401 || data.message === 'Unauthorized API Key.') {
       return res.status(400).json({ status: 'Failed', message: 'Invalid API Key', responseTime });
    }

    res.json({ status: 'Connected', responseTime, message: 'API connected successfully' });
  } catch (error: any) {
    res.status(500).json({ status: 'Failed', message: error.message || 'Connection failed' });
  }
});

// UddoktaPay Webhook (IPN)
router.post('/uddoktapay/webhook', async (req, res) => {
  try {
    const settings = await Settings.findOne();
    if (!settings?.paymentUddoktaPay?.enableWebhookProcessing) {
      return res.status(200).json({ message: 'Webhook ignored by settings' });
    }

    const apiKey = req.headers['rt-uddoktapay-api-key'];
    if (apiKey !== settings.paymentUddoktaPay.apiKey) {
      if (settings.paymentUddoktaPay.enableSecurityLogging) {
        await SecurityEvent.create({
          type: 'Webhook Unauthorized',
          description: `Invalid API key in UddoktaPay webhook from ${req.ip || 'Unknown'}`,
          ipAddress: req.ip || req.connection.remoteAddress || ''
        }).catch(() => {});
      }
      return res.status(401).json({ message: 'Unauthorized webhook request' });
    }

    const { status, metadata, invoice_id, transaction_id, sender_number, amount, date } = req.body;
    
    if (status === 'COMPLETED' && metadata?.order_id) {
      const orderId = metadata.order_id;
      const order = await Order.findById(orderId);
      
      // Idempotency: Prevent duplicate webhook processing
      if (order && order.paymentStatus !== 'Paid') {
        await Order.findByIdAndUpdate(orderId, {
          $set: { 
            paymentStatus: 'Paid', 
            paymentMethod: 'UddoktaPay',
            paymentDetails: {
              invoice_id: invoice_id,
              transaction_id: transaction_id,
              sender_number: sender_number,
              charged_amount: amount,
              payment_date: date,
              gateway_name: 'UddoktaPay',
              verification_time: new Date().toISOString(),
              full_gateway_response: req.body
            }
          }
        });
        
        await processPostPaymentAutomations(orderId, invoice_id, transaction_id);
        
        if (settings.paymentUddoktaPay.enableActivityLogging) {
          await AdminActivity.create({
            adminId: 'system', adminName: 'System Automation',
            action: 'Webhook Processed', target: `Order ${orderId}`,
            ipAddress: req.ip || req.connection.remoteAddress || '', deviceType: 'Server'
          }).catch(() => {});
        }
      }
    }
    
    res.status(200).json({ message: 'Webhook received' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Webhook error' });
  }
});


// ============================================
// Get enabled payment methods (Public)
// ============================================
router.get('/methods', async (req, res) => {
  try {
    const settings = await Settings.findOne();
    const methods: { id: string; name: string; icon: string }[] = [
      { id: 'COD', name: 'Cash on Delivery', icon: 'truck' }
    ];
    if (settings?.paymentBkash?.enabled) {
      methods.push({ id: 'bKash', name: 'bKash', icon: 'bkash' });
    }
    if (settings?.paymentSslCommerz?.enabled) {
      methods.push({ id: 'SSLCommerz', name: 'Online Payment (Card/Mobile)', icon: 'card' });
    }
    if (settings?.paymentUddoktaPay?.enabled) {
      methods.push({ id: 'UddoktaPay', name: 'Pay Online', icon: 'uddoktapay' });
    }
    res.json(methods);
  } catch (error) {
    res.json([{ id: 'COD', name: 'Cash on Delivery', icon: 'truck' }]);
  }
});

export default router;
