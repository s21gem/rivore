import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { authenticateAdmin } from '../middleware/auth';
import { uploadFileToCloudinary } from '../utils/cloudinary';
import { handleMulterError } from '../middleware/multerErrorHandler';

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Use disk storage for multer to avoid RAM exhaustion on large video uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  },
});

// Single file upload
router.post('/', authenticateAdmin, upload.any(), handleMulterError, async (req: any, res) => {
  const files = req.files as Express.Multer.File[];
  const file = files && files.length > 0 ? files[0] : null;

  try {
    if (!file) {
      console.error('[Upload] No file in request. Body:', req.body);
      return res.status(400).json({ message: 'No file uploaded. Make sure a file is attached.' });
    }

    console.log(`[Upload] Processing: ${file.originalname}`);
    const url = await uploadFileToCloudinary(file.path, 'rivore');
    console.log(`[Upload] Success: ${url}`);
    res.json({ url });
  } catch (error: any) {
    console.error('[Upload] Cloudinary error:', error.message || error);
    res.status(500).json({ message: error.message || 'Error uploading to Cloudinary' });
  } finally {
    // Cleanup temporary file
    if (file && fs.existsSync(file.path)) {
      try { fs.unlinkSync(file.path); } catch (e) { console.error('Failed to clean up temp file:', e); }
    }
  }
});

// Multi-image upload endpoint
router.post('/multiple', authenticateAdmin, upload.array('images', 10), handleMulterError, async (req: any, res) => {
  const files = req.files as Express.Multer.File[];
  
  try {
    if (!files || files.length === 0) {
      console.error('[Upload] No files in request. Body:', req.body);
      return res.status(400).json({ message: 'No files uploaded. Make sure the field name is "images".' });
    }

    console.log(`[Upload] Processing ${files.length} files...`);
    const uploadPromises = files.map(file => uploadFileToCloudinary(file.path, 'rivore'));
    const urls = await Promise.all(uploadPromises);
    console.log(`[Upload] Successfully uploaded ${urls.length} images`);
    res.json({ urls });
  } catch (error: any) {
    console.error('[Upload] Multi-upload error:', error.message || error);
    res.status(500).json({ message: error.message || 'Error uploading to Cloudinary' });
  } finally {
    // Cleanup temporary files
    if (files) {
      files.forEach(file => {
        if (fs.existsSync(file.path)) {
          try { fs.unlinkSync(file.path); } catch (e) { console.error('Failed to clean up temp file:', e); }
        }
      });
    }
  }
});

export default router;
