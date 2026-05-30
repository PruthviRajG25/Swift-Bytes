import express from 'express';
import {
  getDashboardStats,
  getTrendingFoods,
  getTopItemByCategory,
  getDailyInvoice,
} from '../controllers/statsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/trending', getTrendingFoods);
router.get('/top-by-category', getTopItemByCategory);
router.get('/daily-invoice', protect, adminOnly, getDailyInvoice);
router.get('/', protect, adminOnly, getDashboardStats);

export default router;
