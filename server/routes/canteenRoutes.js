import express from 'express';
import { getCanteenStatus, updateCanteenStatus, markInvoicePrinted } from '../controllers/canteenController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/status', getCanteenStatus);
router.put('/status', protect, adminOnly, updateCanteenStatus);
router.post('/invoice-printed', protect, adminOnly, markInvoicePrinted);

export default router;

