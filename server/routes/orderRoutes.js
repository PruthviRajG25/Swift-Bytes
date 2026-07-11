import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  submitOrderReview,
  getOrderInvoice,
  getOrderUpiIntent,
  updatePaymentStatus,
  cancelOrder,
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/', protect, adminOnly, getAllOrders);
router.post('/:id/review', protect, submitOrderReview);
router.get('/:id/invoice', protect, getOrderInvoice);
router.get('/:id/upi', protect, getOrderUpiIntent);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
router.put('/:id/payment', protect, adminOnly, updatePaymentStatus);
router.put('/:id/cancel', protect, cancelOrder);

export default router;
