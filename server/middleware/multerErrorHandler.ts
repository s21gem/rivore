import express from 'express';
import multer from 'multer';

// Multer error handler middleware (must have 4 args to be recognized as an error handler by Express)
export function handleMulterError(err: any, _req: express.Request, res: express.Response, next: express.NextFunction) {
  if (err) {
    console.error('[Upload] Multer Error:', err.message || err);
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Please check the maximum size limit.' });
      }
      return res.status(400).json({ message: err.message });
    }
    return res.status(400).json({ message: err.message || 'File upload error' });
  }
  next();
}
