import express from 'express';
import Settings from '../models/Settings';
import Order from '../models/Order';
import { authenticateAdmin } from '../middleware/auth';

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

    const { amount, orderId } = req.body;
    if (!amount || !orderId) {
      return res.status(400).json({ message: 'Amount and orderId are required' });
    }

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

    const { amount, orderId, customerName, customerEmail, customerPhone, customerAddress, customerCity } = req.body;
    
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
      product_name: 'Rivore Perfumes',
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

router.post('/uddoktapay/init', async (req, res) => {
  try {
    const settings = await Settings.findOne();
    if (!settings?.paymentUddoktaPay?.enabled || !settings.paymentUddoktaPay.apiKey) {
      return res.status(400).json({ message: 'UddoktaPay is not configured' });
    }

    const { amount, orderId, customerName, customerEmail, customerPhone } = req.body;

    const baseUrl = settings.paymentUddoktaPay.isLive
      ? 'https://pay.uddoktapay.com'
      : 'https://sandbox.uddoktapay.com';

    const uddoktaRes = await fetch(`${baseUrl}/api/checkout-v2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'RT-UDDOKTAPAY-API-KEY': settings.paymentUddoktaPay.apiKey,
      },
      body: JSON.stringify({
        full_name: customerName || 'Customer',
        email: customerEmail || 'customer@rivore.com',
        amount: String(amount),
        metadata: { order_id: orderId, phone: customerPhone },
        redirect_url: `${req.protocol}://${req.get('host')}/api/payment/uddoktapay/callback`,
        cancel_url: `${req.protocol}://${req.get('host')}/checkout?payment=cancelled`,
        webhook_url: `${req.protocol}://${req.get('host')}/api/payment/uddoktapay/webhook`,
      }),
    });
    const uddoktaData = await uddoktaRes.json();

    if (uddoktaData.payment_url) {
      res.json({ paymentUrl: uddoktaData.payment_url, invoiceId: uddoktaData.invoice_id });
    } else {
      res.status(500).json({ message: 'Failed to init UddoktaPay', detail: uddoktaData });
    }
  } catch (error: any) {
    console.error('UddoktaPay init error:', error);
    res.status(500).json({ message: 'UddoktaPay error', error: error.message });
  }
});

// UddoktaPay callback — user redirect after payment
router.get('/uddoktapay/callback', async (req, res) => {
  try {
    const { invoice_id } = req.query;
    
    const settings = await Settings.findOne();
    if (!settings?.paymentUddoktaPay?.apiKey) {
      return res.redirect('/checkout?payment=failed&reason=config');
    }

    const baseUrl = settings.paymentUddoktaPay.isLive
      ? 'https://pay.uddoktapay.com'
      : 'https://sandbox.uddoktapay.com';

    // Verify payment
    const verifyRes = await fetch(`${baseUrl}/api/verify-payment`, {
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
        await Order.findByIdAndUpdate(orderId, {
          $set: { paymentStatus: 'Paid', paymentMethod: 'UddoktaPay' }
        });
      }
      res.redirect(`/checkout?payment=success&trxID=${verifyData.transaction_id || invoice_id}`);
    } else {
      res.redirect(`/checkout?payment=failed&reason=${verifyData.status || 'unknown'}`);
    }
  } catch (error: any) {
    console.error('UddoktaPay callback error:', error);
    res.redirect('/checkout?payment=failed&reason=server_error');
  }
});

// UddoktaPay Webhook (IPN)
router.post('/uddoktapay/webhook', async (req, res) => {
  try {
    const { status, metadata } = req.body;
    if (status === 'COMPLETED' && metadata?.order_id) {
      await Order.findByIdAndUpdate(metadata.order_id, {
        $set: { paymentStatus: 'Paid', paymentMethod: 'UddoktaPay' }
      });
    }
    res.status(200).json({ message: 'Webhook received' });
  } catch (error) {
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
      methods.push({ id: 'UddoktaPay', name: 'UddoktaPay', icon: 'uddoktapay' });
    }
    res.json(methods);
  } catch (error) {
    res.json([{ id: 'COD', name: 'Cash on Delivery', icon: 'truck' }]);
  }
});

export default router;
