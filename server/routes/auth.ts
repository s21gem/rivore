import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User';

import { authenticateAdmin } from '../middleware/auth';
import sgMail from '@sendgrid/mail';

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

    if (!(await bcrypt.compare(password, user.password!))) {
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

// ========== OTP-BASED SECURITY SYSTEM ==========

// Helper: generate & send OTP
const generateAndSendOtp = async (targetEmail: string): Promise<string> => {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) throw new Error('Email service not configured (SENDGRID_API_KEY missing)');

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  sgMail.setApiKey(apiKey);
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@rivore.com';

  await sgMail.send({
    to: targetEmail,
    from: fromEmail,
    subject: 'Rivoré Admin - Security Verification Code',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0f172a; font-size: 22px; font-weight: 400; letter-spacing: 0.1em; text-transform: uppercase; margin: 0;">Rivoré</h1>
          <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px;">Security Verification</p>
        </div>
        <div style="background: linear-gradient(135deg, #f8f5ff 0%, #f0ebff 100%); border: 1px solid #e9e0ff; border-radius: 16px; padding: 30px; text-align: center;">
          <p style="color: #334155; font-size: 14px; margin: 0 0 20px;">Your one-time verification code is:</p>
          <div style="background: white; border-radius: 12px; padding: 20px; display: inline-block; min-width: 200px; border: 2px dashed #c4b5fd;">
            <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #4f46e5; font-family: monospace;">${otp}</span>
          </div>
          <p style="color: #94a3b8; font-size: 12px; margin: 20px 0 0;">This code expires in <strong>5 minutes</strong>.</p>
        </div>
        <p style="color: #94a3b8; font-size: 11px; text-align: center; margin-top: 20px;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  });

  return otp;
};

// Helper: verify OTP on admin user
const verifyAdminOtp = (admin: any, otp: string): string | null => {
  if (!admin.otp || !admin.otpExpiry) return 'No OTP was requested. Please request a new one.';
  if (new Date() > admin.otpExpiry) return 'OTP has expired. Please request a new one.';
  if (admin.otp !== otp.toString()) return 'Invalid OTP. Please try again.';
  return null; // valid
};

// Check if admin email is set up
router.get('/admin-email', authenticateAdmin, async (req, res) => {
  try {
    const admin = await User.findOne({ role: 'admin' });
    if (!admin || !admin.securityEmail) {
      return res.json({ hasEmail: false, email: null });
    }
    const maskedEmail = admin.securityEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3');
    return res.json({ hasEmail: true, email: maskedEmail });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== 1. SECURITY EMAIL SETUP (FIRST TIME) =====
// Step 1: Send OTP to a NEW security email
router.post('/security/setup/send-otp', authenticateAdmin, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Valid email address is required' });
    }

    const admin = await User.findOne({ role: 'admin' });
    if (!admin) return res.status(404).json({ message: 'Admin account not found' });
    if (admin.securityEmail) return res.status(400).json({ message: 'Security email already set' });

    const otp = await generateAndSendOtp(email);
    admin.otp = otp;
    admin.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    admin.pendingSecurityEmail = email; 
    await admin.save();

    const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1***$3');
    res.json({ success: true, message: `OTP sent to ${maskedEmail}` });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to send OTP' });
  }
});

// Step 2: Verify OTP and save the security email
router.post('/security/setup/verify', authenticateAdmin, async (req, res) => {
  try {
    const { otp, email } = req.body;
    if (!otp) return res.status(400).json({ message: 'OTP is required' });

    const admin = await User.findOne({ role: 'admin' });
    if (!admin) return res.status(404).json({ message: 'Admin account not found' });
    if (admin.pendingSecurityEmail !== email) return res.status(400).json({ message: 'Email mismatch' });

    const err = verifyAdminOtp(admin, otp);
    if (err) {
      if (err.includes('expired')) {
        admin.otp = undefined; admin.otpExpiry = undefined; await admin.save();
      }
      return res.status(400).json({ message: err });
    }

    // Save
    admin.securityEmail = admin.pendingSecurityEmail;
    admin.pendingSecurityEmail = undefined;
    admin.otp = undefined;
    admin.otpExpiry = undefined;
    await admin.save();

    const maskedEmail = admin.securityEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3');
    res.json({ success: true, message: `Security email set to ${maskedEmail}` });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// ===== 2. SECURITY EMAIL CHANGE (DUAL OTP) =====
// Step 1: Send OTP to CURRENT security email
router.post('/security/change/send-current', authenticateAdmin, async (req, res) => {
  try {
    const admin = await User.findOne({ role: 'admin' });
    if (!admin || !admin.securityEmail) return res.status(400).json({ message: 'No security email set' });

    const otp = await generateAndSendOtp(admin.securityEmail);
    admin.otp = otp;
    admin.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    admin.pendingOtpVerified = false; // Reset verification state
    await admin.save();

    const maskedEmail = admin.securityEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3');
    res.json({ success: true, message: `OTP sent to your current email (${maskedEmail})` });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to send OTP' });
  }
});

// Step 2: Verify CURRENT OTP
router.post('/security/change/verify-current', authenticateAdmin, async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) return res.status(400).json({ message: 'OTP is required' });

    const admin = await User.findOne({ role: 'admin' });
    if (!admin) return res.status(404).json({ message: 'Admin account not found' });

    const err = verifyAdminOtp(admin, otp);
    if (err) {
      if (err.includes('expired')) {
        admin.otp = undefined; admin.otpExpiry = undefined; await admin.save();
      }
      return res.status(400).json({ message: err });
    }

    admin.pendingOtpVerified = true;
    admin.otp = undefined;
    admin.otpExpiry = undefined;
    await admin.save();

    res.json({ success: true, message: 'Current email verified. You can now enter a new security email.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Step 3: Send OTP to NEW security email
router.post('/security/change/send-new', authenticateAdmin, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Valid email required' });

    const admin = await User.findOne({ role: 'admin' });
    if (!admin) return res.status(404).json({ message: 'Admin account not found' });
    if (!admin.pendingOtpVerified) return res.status(400).json({ message: 'Please verify your current email first' });

    const otp = await generateAndSendOtp(email);
    admin.otp = otp;
    admin.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    admin.pendingSecurityEmail = email;
    await admin.save();

    const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1***$3');
    res.json({ success: true, message: `OTP sent to new email (${maskedEmail})` });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to send OTP' });
  }
});

// Step 4: Verify NEW OTP and change email
router.post('/security/change/verify-new', authenticateAdmin, async (req, res) => {
  try {
    const { otp, email } = req.body;
    if (!otp) return res.status(400).json({ message: 'OTP is required' });

    const admin = await User.findOne({ role: 'admin' });
    if (!admin) return res.status(404).json({ message: 'Admin account not found' });
    if (!admin.pendingOtpVerified) return res.status(400).json({ message: 'Unauthorized flow' });
    if (admin.pendingSecurityEmail !== email) return res.status(400).json({ message: 'Email mismatch' });

    const err = verifyAdminOtp(admin, otp);
    if (err) {
      if (err.includes('expired')) {
        admin.otp = undefined; admin.otpExpiry = undefined; await admin.save();
      }
      return res.status(400).json({ message: err });
    }

    admin.securityEmail = admin.pendingSecurityEmail;
    admin.pendingSecurityEmail = undefined;
    admin.pendingOtpVerified = false;
    admin.otp = undefined;
    admin.otpExpiry = undefined;
    await admin.save();

    const maskedEmail = admin.securityEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3');
    res.json({ success: true, message: `Security email successfully updated to ${maskedEmail}` });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// ===== 3. CREDENTIAL CHANGE (Username/Password) =====
// Send OTP to security email
router.post('/credentials/send-otp', authenticateAdmin, async (req, res) => {
  try {
    const admin = await User.findOne({ role: 'admin' });
    if (!admin || !admin.securityEmail) return res.status(400).json({ message: 'No security email configured. Please set one up first.' });

    const otp = await generateAndSendOtp(admin.securityEmail);
    admin.otp = otp;
    admin.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await admin.save();

    const maskedEmail = admin.securityEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3');
    res.json({ success: true, message: `OTP sent to your security email (${maskedEmail})` });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to send OTP' });
  }
});

// Change credentials (verifies OTP and changes username/password)
router.post('/credentials/change', authenticateAdmin, async (req, res) => {
  try {
    const { otp, newEmail, newPassword } = req.body;
    if (!otp) return res.status(400).json({ message: 'OTP verification required' });
    if (!newEmail && !newPassword) return res.status(400).json({ message: 'Provide new username or new password' });

    const admin = await User.findOne({ role: 'admin' });
    if (!admin) return res.status(404).json({ message: 'Admin account not found' });

    const err = verifyAdminOtp(admin, otp);
    if (err) {
      if (err.includes('expired')) {
        admin.otp = undefined; admin.otpExpiry = undefined; await admin.save();
      }
      return res.status(400).json({ message: err });
    }

    const changes: string[] = [];

    if (newEmail && newEmail !== admin.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }
      admin.email = newEmail;
      changes.push('Username');
    }

    if (newPassword) {
      if (newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
      admin.password = await bcrypt.hash(newPassword, 10);
      changes.push('Password');
    }

    admin.otp = undefined;
    admin.otpExpiry = undefined;
    await admin.save();

    const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET || 'rivore_secret_key', {
      expiresIn: '1d',
    });

    res.json({ 
      success: true, 
      message: `${changes.join(' & ')} updated successfully`,
      token,
      user: { id: admin._id, email: admin.email, role: admin.role }
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

export default router;
