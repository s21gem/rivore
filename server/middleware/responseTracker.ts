import { Request, Response, NextFunction } from 'express';

interface ApiMetrics {
  totalCalls: number;
  totalTimeMs: number;
  recentCalls: number[]; // Store last 10 response times
}

export const apiHealthStore: Record<string, ApiMetrics> = {
  products: { totalCalls: 0, totalTimeMs: 0, recentCalls: [] },
  orders: { totalCalls: 0, totalTimeMs: 0, recentCalls: [] },
  payments: { totalCalls: 0, totalTimeMs: 0, recentCalls: [] },
  uddoktapay: { totalCalls: 0, totalTimeMs: 0, recentCalls: [] },
  courier: { totalCalls: 0, totalTimeMs: 0, recentCalls: [] },
  general: { totalCalls: 0, totalTimeMs: 0, recentCalls: [] }
};

export const responseTracker = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    let category = 'general';

    if (req.path.includes('/products')) category = 'products';
    else if (req.path.includes('/orders') || req.path.includes('/checkout')) category = 'orders';
    else if (req.path.includes('/uddoktapay')) category = 'uddoktapay';
    else if (req.path.includes('/payment')) category = 'payments';
    else if (req.path.includes('/admin/health/test-courier')) category = 'courier'; // Minimal proxy for courier

    const metrics = apiHealthStore[category];
    if (metrics) {
      metrics.totalCalls++;
      metrics.totalTimeMs += duration;
      metrics.recentCalls.push(duration);
      if (metrics.recentCalls.length > 20) {
        metrics.recentCalls.shift();
      }
    }
  });

  next();
};
