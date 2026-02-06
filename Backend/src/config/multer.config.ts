import multer from 'multer';
import { Request } from 'express';

// Use memory storage instead of disk storage for Vercel
const storage = multer.memoryStorage();

// File filter for validation
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.fieldname === 'image') {
    // Only accept images for logo
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for store logo!'));
    }
  } else if (file.fieldname === 'kybDocument') {
    // Accept PDF and images for KYB document
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF or image files are allowed for KYB document!'));
    }
  } else {
    cb(null, true);
  }
};

// Configure multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  }
});