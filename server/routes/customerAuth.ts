import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Reward from '../models/Reward';
import Referral from '../models/Referral';
import sgMail from '@sendgrid/mail';

const router = express.Router();

// Helper: generate & send OTP (reused logic from admin setup but modified for customer)
const generateAndSendCustomerOtp = async (targetEmail: string): Promise<string> => {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) throw new Error('Email service not configured (SENDGRID_API_KEY missing)');

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  sgMail.setApiKey(apiKey);
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@rivore.com';

  await sgMail.send({
    to: targetEmail,
    from: fromEmail,
    subject: 'Rivoré - Password Reset Code',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0f172a; font-size: 22px; font-weight: 400; letter-spacing: 0.1em; text-transform: uppercase; margin: 0;">Rivoré</h1>
          <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px;">Password Reset</p>
        </div>
        <div style="background: linear-gradient(135deg, #f8f5ff 0%, #f0ebff 100%); border: 1px solid #e9e0ff; border-radius: 16px; padding: 30px; text-align: center;">
          <p style="color: #334155; font-size: 14px; margin: 0 0 20px;">Your password reset verification code is:</p>
          <div style="background: white; border-radius: 12px; padding: 20px; display: inline-block; min-width: 200px; border: 2px dashed #c4b5fd;">
            <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #4f46e5; font-family: monospace;">${otp}</span>
          </div>
          <p style="color: #94a3b8; font-size: 12px; margin: 20px 0 0;">This code expires in <strong>15 minutes</strong>.</p>
        </div>
        <p style="color: #94a3b8; font-size: 11px; text-align: center; margin-top: 20px;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  });

  return otp;
};

// Customer Registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      fullName,
      role: 'customer'
    });

    await user.save();

    // Initialize Reward and Referral models
    await new Reward({ customerId: user._id, points: 0 }).save();
    
    // Generate a simple unique referral code based on email prefix and random numbers
    const refCode = email.split('@')[0].toUpperCase().substring(0, 5) + Math.floor(100 + Math.random() * 900);
    await new Referral({ customerId: user._id, referralCode: refCode }).save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'rivore_secret_key', {
      expiresIn: '7d',
    });

    res.status(201).json({ 
      token, 
      user: { id: user._id, email: user.email, fullName: user.fullName, role: user.role } 
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Customer Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });

    if (!user || user.role !== 'customer') {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!(await bcrypt.compare(password, user.password!))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'rivore_secret_key', {
      expiresIn: '7d',
    });

    res.json({ token, user: { id: user._id, email: user.email, fullName: user.fullName, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send OTP for password reset
router.post('/reset-password/request', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email, role: 'customer' });
    
    if (!user) {
      // Don't leak whether the email exists, just return success
      return res.json({ success: true, message: 'If your email is registered, you will receive an OTP shortly.' });
    }

    const otp = await generateAndSendCustomerOtp(user.email);
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry
    await user.save();

    res.json({ success: true, message: 'OTP has been sent to your email.' });
  } catch (error: any) {
    console.error('OTP send error:', error);
    res.status(500).json({ message: error.message || 'Failed to send OTP' });
  }
});

// Verify OTP and set new password
router.post('/reset-password/verify', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email, role: 'customer' });
    if (!user) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({ message: 'No OTP was requested. Please request a new one.' });
    }

    if (new Date() > user.otpExpiry) {
      user.otp = undefined; user.otpExpiry = undefined; await user.save();
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (user.otp !== otp.toString()) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    // OTP matches, change password
    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ success: true, message: 'Password has been successfully reset. You can now login.' });
  } catch (error: any) {
    console.error('Password reset verify error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

export default router;
