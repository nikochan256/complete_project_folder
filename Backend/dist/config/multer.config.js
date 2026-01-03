import multer from 'multer';
import path from 'path';
// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Separate folders for different file types
        if (file.fieldname === 'image') {
            cb(null, 'uploads/store-logos');
        }
        else if (file.fieldname === 'kybDocument') {
            cb(null, 'uploads/kyb-documents');
        }
        else {
            cb(null, 'uploads/others');
        }
    },
    filename: (req, file, cb) => {
        // Generate unique filename: timestamp-originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
// File filter for validation
const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'image') {
        // Only accept images for logo
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed for store logo!'));
        }
    }
    else if (file.fieldname === 'kybDocument') {
        // Accept PDF and images for KYB document
        if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only PDF or image files are allowed for KYB document!'));
        }
    }
    else {
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
