import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Food from '../models/Food.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import CanteenSettings from '../models/CanteenSettings.js';
import { buildInvoice } from '../utils/invoice.js';
import { buildUpiUri, generateUpiQrCode } from '../utils/upi.js';

const getNextTokenNumber = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastOrder = await Order.findOne({ createdAt: { $gte: today } })
    .sort({ tokenNumber: -1 })
    .select('tokenNumber');
  return lastOrder ? lastOrder.tokenNumber + 1 : 1;
};

// @desc    Create new order
// @route   POST /api/orders
export const createOrder = async (req, res) => {
  const { items, instructions, paymentMethod } = req.body;

  if (!items?.length) {
    return res.status(400).json({ message: 'No order items' });
  }

  const settings = await CanteenSettings.findOne();
  if (settings && settings.isOpen === false) {
    return res.status(403).json({ message: 'Restaurant is currently closed' });
  }

  let totalPrice = 0;
  const orderItems = [];

  for (const item of items) {
    const food = await Food.findById(item.food);
    if (!food) {
      return res.status(404).json({ message: `Food not found: ${item.food}` });
    }
    if (!food.available) {
      return res.status(400).json({ message: `${food.name} is currently unavailable` });
    }
    orderItems.push({
      food: food._id,
      name: food.name,
      price: food.price,
      quantity: item.quantity,
    });
    totalPrice += food.price * item.quantity;
  }

  const tokenNumber = await getNextTokenNumber();

  // If paying via Wallet, run atomic transaction session
  if (paymentMethod === 'Wallet') {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // 1. Fetch user atomically
      const user = await User.findById(req.user._id).session(session);
      if (!user) {
        res.status(404);
        throw new Error('User not found');
      }

      // 2. Check balance
      if ((user.walletBalance || 0) < totalPrice) {
        res.status(400);
        throw new Error('Insufficient wallet balance');
      }

      // 3. Deduct balance
      user.walletBalance -= totalPrice;
      await user.save({ session });

      // 4. Create debit transaction record
      const refId = `ORDER-DEBIT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      await Transaction.create(
        [
          {
            userId: req.user._id,
            amount: totalPrice,
            type: 'debit',
            status: 'completed',
            referenceId: refId,
          },
        ],
        { session }
      );

      // 5. Create order
      const [order] = await Order.create(
        [
          {
            userId: req.user._id,
            items: orderItems,
            totalPrice,
            tokenNumber,
            status: 'Placed',
            instructions: String(instructions || '').trim().slice(0, 300),
            paymentMethod: 'Wallet',
            paymentStatus: 'Paid',
          },
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      const populatedOrder = await Order.findById(order._id).populate('userId', 'name email');
      const io = req.app.get('io');
      io.emit('newOrder', populatedOrder);
      io.to(`user:${req.user._id}`).emit('orderUpdate', populatedOrder);

      return res.status(201).json(populatedOrder);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      const code = res.statusCode === 200 ? 500 : res.statusCode;
      return res.status(code).json({ message: error.message });
    }
  }

  // Standard Cash or UPI payment paths (original code)
  const order = await Order.create({
    userId: req.user._id,
    items: orderItems,
    totalPrice,
    tokenNumber,
    status: 'Placed',
    instructions: String(instructions || '').trim().slice(0, 300),
    paymentMethod: paymentMethod === 'UPI' ? 'UPI' : 'Cash',
    paymentStatus: 'Pending',
  });

  const populatedOrder = await Order.findById(order._id).populate('userId', 'name email');
  const io = req.app.get('io');
  io.emit('newOrder', populatedOrder);
  io.to(`user:${req.user._id}`).emit('orderUpdate', populatedOrder);

  res.status(201).json(populatedOrder);
};

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my
export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
};

// @desc    Get single order
// @route   GET /api/orders/:id
export const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('userId', 'name email');
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  if (
    req.user.role !== 'admin' &&
    order.userId._id.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  res.json(order);
};

// @desc    Get invoice for an order (available after admin confirms)
// @route   GET /api/orders/:id/invoice
export const getOrderInvoice = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('userId', 'name email');
  if (!order) return res.status(404).json({ message: 'Order not found' });

  if (
    req.user.role !== 'admin' &&
    order.userId._id.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  if (!order.invoiceNumber) {
    return res.status(409).json({ message: 'Invoice not generated yet' });
  }

  res.json(buildInvoice(order));
};

// @desc    Get UPI intent payload for an order (after invoice is generated)
// @route   GET /api/orders/:id/upi
export const getOrderUpiIntent = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('userId', 'name email');
  if (!order) return res.status(404).json({ message: 'Order not found' });

  if (
    req.user.role !== 'admin' &&
    order.userId._id.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  if (!order.invoiceNumber) {
    return res.status(409).json({ message: 'UPI is available after order is confirmed' });
  }

  if (order.paymentMethod !== 'UPI') {
    return res.status(400).json({ message: 'Payment method is not UPI for this order' });
  }

  const vpa = process.env.UPI_VPA || '';
  const payeeName = process.env.UPI_NAME || 'SmartCanteen';
  const note = `Order ${order.invoiceNumber}`;
  const upiUri = buildUpiUri({
    vpa,
    payeeName,
    amount: order.totalPrice,
    transactionRef: order.invoiceNumber || String(order._id),
    note,
  });

  if (!upiUri) {
    return res.status(500).json({ message: 'UPI_VPA is not configured on server' });
  }

  const qrCodeDataUrl = await generateUpiQrCode(upiUri);

  res.json({
    orderId: String(order._id),
    invoiceNumber: order.invoiceNumber,
    amount: order.totalPrice,
    upiUri,
    qrCodeUrl: qrCodeDataUrl,
  });
};

// @desc    Update payment status (admin)
// @route   PUT /api/orders/:id/payment
export const updatePaymentStatus = async (req, res) => {
  const { paymentStatus } = req.body || {};
  if (!['Pending', 'Paid'].includes(paymentStatus)) {
    return res.status(400).json({ message: 'Invalid paymentStatus' });
  }

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  order.paymentStatus = paymentStatus;
  await order.save();

  const populatedOrder = await Order.findById(order._id).populate('userId', 'name email');
  const io = req.app.get('io');
  io.emit('orderStatusChanged', populatedOrder);
  io.to(`user:${order.userId}`).emit('orderUpdate', populatedOrder);

  res.json(populatedOrder);
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
export const getAllOrders = async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (req.query.active === 'true') {
    filter.status = { $in: ['Placed', 'Preparing', 'Ready'] };
  }
  const orders = await Order.find(filter)
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });
  res.json(orders);
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Placed', 'Preparing', 'Ready', 'Completed'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  const wasPlaced = order.status === 'Placed';
  order.status = status;

  // Generate invoice once when admin confirms (Placed -> Preparing)
  if (wasPlaced && status === 'Preparing' && !order.invoiceNumber) {
    const day = new Date();
    const yyyy = day.getFullYear();
    const mm = String(day.getMonth() + 1).padStart(2, '0');
    const dd = String(day.getDate()).padStart(2, '0');
    order.invoiceNumber = `INV-${yyyy}${mm}${dd}-${String(order.tokenNumber).padStart(3, '0')}`;
    order.invoiceGeneratedAt = new Date();
  }

  await order.save();

  const populatedOrder = await Order.findById(order._id)
    .populate('userId', 'name email');

  const io = req.app.get('io');
  io.emit('orderStatusChanged', populatedOrder);
  io.to(`user:${order.userId}`).emit('orderUpdate', populatedOrder);
  if (order.invoiceNumber) {
    io.to(`user:${order.userId}`).emit('invoiceGenerated', {
      orderId: String(order._id),
      invoiceNumber: order.invoiceNumber,
    });
  }

  res.json(populatedOrder);
};

// @desc    Submit review after order is received (Completed)
// @route   POST /api/orders/:id/review
export const submitOrderReview = async (req, res) => {
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  if (order.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  if (order.status !== 'Completed') {
    return res.status(400).json({ message: 'You can review only after your order is received' });
  }
  if (order.review?.rating) {
    return res.status(400).json({ message: 'You have already reviewed this order' });
  }

  order.review = {
    rating: Number(rating),
    comment: comment?.trim() || '',
    createdAt: new Date(),
  };
  await order.save();

  for (const item of order.items) {
    const food = await Food.findById(item.food);
    if (!food) continue;
    const count = food.ratingCount + 1;
    food.ratingAvg = (food.ratingAvg * food.ratingCount + rating) / count;
    food.ratingCount = count;
    await food.save();
  }

  const populatedOrder = await Order.findById(order._id).populate('userId', 'name email');
  res.json(populatedOrder);
};
