import express from 'express';
import {
  getFoods,
  getCategories,
  getFoodById,
  getPairRecommendations,
  createFood,
  updateFood,
  deleteFood,
} from '../controllers/foodController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', getFoods);
router.get('/categories', getCategories);
router.get('/:id/pairs', getPairRecommendations);
router.get('/:id', getFoodById);
router.post('/', protect, adminOnly, createFood);
router.put('/:id', protect, adminOnly, updateFood);
router.delete('/:id', protect, adminOnly, deleteFood);

export default router;
