import express from 'express';
import {
  getDashboardStats,
  getTrendingFoods,
  getTopItemByCategory,
  getDailyInvoice,
  getOrderReviews,
} from '../controllers/statsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/trending', getTrendingFoods);
router.get('/top-by-category', getTopItemByCategory);
router.get('/daily-invoice', protect, adminOnly, getDailyInvoice);
router.get('/reviews', protect, adminOnly, getOrderReviews);
router.get('/', protect, adminOnly, getDashboardStats);

export default router;
