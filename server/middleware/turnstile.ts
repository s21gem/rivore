import { Request, Response, NextFunction } from 'express';
import Settings from '../models/Settings';
import SecurityEvent from '../models/SecurityEvent';

export const verifyTurnstile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await Settings.findOne();
    if (!settings?.securitySettings?.turnstileEnabled) {
      return next(); // Skip if disabled
    }

    const token = req.body.turnstileToken || req.headers['x-turnstile-token'];
    
    if (!token) {
      // Log event
      await SecurityEvent.create({
        type: 'Suspicious Request',
        description: 'Missing Turnstile token on protected route',
        ipAddress: req.ip || req.connection.remoteAddress || '',
        endpoint: req.originalUrl,
      });
      return res.status(400).json({ message: 'Security check failed. Please verify you are human.' });
    }

    const secretKey = settings.securitySettings.turnstileSecretKey;
    if (!secretKey) {
      console.warn('Turnstile is enabled but secret key is missing!');
      return next();
    }

    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token as string);
    formData.append('remoteip', req.ip || req.connection.remoteAddress || '');

    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      body: formData,
      method: 'POST',
    });

    const outcome = await result.json();
    if (outcome.success) {
      return next();
    } else {
      await SecurityEvent.create({
        type: 'Blocked Request',
        description: `Turnstile verification failed: ${JSON.stringify(outcome['error-codes'])}`,
        ipAddress: req.ip || req.connection.remoteAddress || '',
        endpoint: req.originalUrl,
      });
      return res.status(400).json({ message: 'Security check failed. Please try again.' });
    }
  } catch (error) {
    console.error('Turnstile verification error:', error);
    res.status(500).json({ message: 'Server error during security check.' });
  }
};
