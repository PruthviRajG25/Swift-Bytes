import express from 'express';
import {
  generateUPIString,
  initiatePayment,
  approvePayment,
  getMyTransactions,
  getAdminTransactions,
} from '../controllers/walletController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Protected Customer/User Routes
router.post('/upi', protect, generateUPIString);
router.post('/initiate', protect, initiatePayment);
router.get('/my', protect, getMyTransactions);

// Admin-Only approval routes
router.post('/approve/:transactionId', protect, adminOnly, approvePayment);
router.get('/admin/all', protect, adminOnly, getAdminTransactions);

export default router;
