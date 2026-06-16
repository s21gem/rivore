import rateLimit from 'express-rate-limit';
import SecurityEvent from '../models/SecurityEvent';

const logRateLimit = (req: any, res: any, next: any, options: any) => {
  SecurityEvent.create({
    type: 'Blocked Request',
    description: `Rate limit exceeded: ${options.message.message || options.message}`,
    ipAddress: req.ip || req.connection.remoteAddress || '',
    endpoint: req.originalUrl,
  }).catch(err => console.error('Failed to log rate limit event', err));
  res.status(options.statusCode).send(options.message);
};

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per `window` (here, per 15 minutes)
  message: { message: 'Too many authentication attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: logRateLimit,
});

export const checkoutLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 checkout requests per hour to prevent order spam
  message: { message: 'Too many orders placed, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: logRateLimit,
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: logRateLimit,
});
