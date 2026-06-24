import { Request, Response, NextFunction } from 'express';
import FailedLogin from '../models/FailedLogin';
import SecurityEvent from '../models/SecurityEvent';
import { UAParser } from 'ua-parser-js';
import geoip from 'geoip-lite';

export const checkFailedLogins = async (req: Request, res: Response, next: NextFunction) => {
  const ipAddress = req.ip || req.connection.remoteAddress || '';
  const email = req.body.email;

  if (!email) return next();

  try {
    const failedAttempt = await FailedLogin.findOne({ ipAddress, email });
    if (failedAttempt && failedAttempt.lockUntil && failedAttempt.lockUntil > new Date()) {
      return res.status(429).json({ message: 'Too many failed attempts. Account temporarily locked. Please try again later.' });
    }
    next();
  } catch (err) {
    next();
  }
};

export const recordFailedLogin = async (req: Request, email: string) => {
  const ipAddress = req.ip || req.connection.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';
  const parser = new UAParser(userAgent);
  const geo = geoip.lookup(ipAddress);
  const country = geo ? geo.country : 'Unknown';
  const device = parser.getDevice().type || 'Desktop';
  
  try {
    let failedAttempt = await FailedLogin.findOne({ ipAddress, email });
    if (!failedAttempt) {
      failedAttempt = new FailedLogin({ 
        ipAddress, 
        email, 
        attempts: 1,
        country,
        device
      });
    } else {
      failedAttempt.attempts += 1;
      if (failedAttempt.attempts >= 5) {
        failedAttempt.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // lock for 15 mins
        await SecurityEvent.create({
          type: 'Blocked Request',
          description: `Account locked due to 5 failed login attempts for ${email}`,
          ipAddress,
        });
      }
    }
    await failedAttempt.save();
    
    await SecurityEvent.create({
      type: 'Failed Login',
      description: `Failed login attempt ${failedAttempt.attempts}/5 for ${email}`,
      ipAddress,
      userEmail: email
    });
  } catch (err) {
    console.error('Failed to record failed login', err);
  }
};

export const clearFailedLogins = async (req: Request, email: string) => {
  const ipAddress = req.ip || req.connection.remoteAddress || '';
  try {
    await FailedLogin.deleteOne({ ipAddress, email });
  } catch (err) {
    console.error('Failed to clear failed logins', err);
  }
};
