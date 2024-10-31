import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Helper function to configure multer storage
const getStorage = (folder) => multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.env.UPLOAD_FOLDER_PATH, folder);

    fs.mkdirSync(dir, { recursive: true });

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Unique file name with timestamp
  }
});

// File filter function to allow only image uploads
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed!'), false); // Reject file
  }
};

// Middleware for uploading user profile photos
export const uploadUserAvatar = multer({
  storage: getStorage(process.env.USER_AVATAR_UPLOAD_PATH), // Store user avatars in 'uploads
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5MB
});

// Middleware for uploading product photos
export const uploadProductPhoto = multer({
  storage: getStorage(process.env.PRODUCT_PHOTO_UPLOAD_PATH), // Store product photos
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 10 }, // Limit file size to 10MB
});
