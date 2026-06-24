import { Request, Response, NextFunction } from 'express';
import { UAParser } from 'ua-parser-js';
import geoip from 'geoip-lite';
import AdminActivity from '../models/AdminActivity';

export const logAdminActivity = (action: string, targetExtractor: (req: Request) => string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // We capture the original send/json to log only on success, or we can log immediately
    // Let's log immediately to ensure it's captured, or wait for finish to check status
    res.on('finish', async () => {
      // Only log on successful mutations (e.g. 200, 201)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const user = (req as any).user;
          if (!user || user.role !== 'admin') return;

          const ip = req.ip || req.connection.remoteAddress || '';
          const userAgent = req.headers['user-agent'] || '';

          // Parse User Agent
          const parser = new UAParser(userAgent);
          const browser = parser.getBrowser().name || 'Unknown';
          const os = parser.getOS().name || 'Unknown';
          const deviceType = parser.getDevice().type || 'Desktop';

          // Parse IP location
          const geo = geoip.lookup(ip);
          const country = geo ? geo.country : 'Unknown';
          const city = geo ? geo.city : 'Unknown';
          const isp = 'Unknown'; // geoip-lite doesn't provide ISP

          const target = targetExtractor(req);

          await AdminActivity.create({
            adminId: user.id || user._id,
            adminName: user.fullName || user.email || 'Admin',
            action,
            target,
            ipAddress: ip,
            country,
            city,
            isp,
            browser,
            os,
            deviceType,
            userAgent
          });
        } catch (error) {
          console.error('[Audit Logger] Failed to log admin activity', error);
        }
      }
    });

    next();
  };
};
