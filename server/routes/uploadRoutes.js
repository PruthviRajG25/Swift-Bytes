import express from 'express';
import { uploadToCloudinary } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/roleMiddleware.js';
import { uploadImage } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post(
  '/',
  protect,
  adminOnly,
  (req, res, next) => {
    uploadImage.single('image')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  uploadToCloudinary
);

export default router;
