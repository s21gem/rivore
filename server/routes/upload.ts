import express from 'express';
import multer from 'multer';
import { authenticateAdmin } from '../middleware/auth';
import { uploadToCloudinary } from '../utils/cloudinary';

const router = express.Router();

// Use memory storage for multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Multer error handler middleware (must have 4 args to be an error handler)
function handleMulterError(err: any, _req: express.Request, res: express.Response, next: express.NextFunction) {
  if (err) {
    console.error('[Upload] Multer Error:', err.message || err);
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum size is 10MB.' });
      }
      return res.status(400).json({ message: err.message });
    }
    return res.status(400).json({ message: err.message || 'File upload error' });
  }
  next();
}

// Single image upload
router.post('/', authenticateAdmin, upload.single('image'), handleMulterError, async (req: any, res) => {
  try {
    if (!req.file) {
      console.error('[Upload] No file in request. Body:', req.body);
      return res.status(400).json({ message: 'No file uploaded. Make sure the field name is "image".' });
    }

    console.log(`[Upload] Processing: ${req.file.originalname}`);
    const url = await uploadToCloudinary(req.file.buffer, 'rivore');
    console.log(`[Upload] Success: ${url}`);
    res.json({ url });
  } catch (error: any) {
    console.error('[Upload] Cloudinary error:', error.message || error);
    res.status(500).json({ message: error.message || 'Error uploading to Cloudinary' });
  }
});

// Multi-image upload endpoint
router.post('/multiple', authenticateAdmin, upload.array('images', 10), handleMulterError, async (req: any, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      console.error('[Upload] No files in request. Body:', req.body);
      return res.status(400).json({ message: 'No files uploaded. Make sure the field name is "images".' });
    }

    console.log(`[Upload] Processing ${files.length} files...`);
    const uploadPromises = files.map(file => uploadToCloudinary(file.buffer, 'rivore'));
    const urls = await Promise.all(uploadPromises);
    console.log(`[Upload] Successfully uploaded ${urls.length} images`);
    res.json({ urls });
  } catch (error: any) {
    console.error('[Upload] Multi-upload error:', error.message || error);
    res.status(500).json({ message: error.message || 'Error uploading to Cloudinary' });
  }
});

export default router;
