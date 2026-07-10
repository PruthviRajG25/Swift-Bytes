import mongoose from 'mongoose';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

/**
 * @desc    Generate dynamic UPI payment URI
 * @route   POST /api/wallet/upi
 * @access  Private
 */
export const generateUPIString = async (req, res) => {
  try {
    const { amount, referenceId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }
    if (!referenceId || !referenceId.trim()) {
      return res.status(400).json({ message: 'Reference ID is required' });
    }

    const upiVpa = process.env.UPI_VPA || 'merchant@ybl';
    const upiName = process.env.UPI_NAME || 'Smart Canteen';
    const note = 'Wallet Recharge';

    // Construct standard UPI deep link string
    // Format: upi://pay?pa=address&pn=name&am=amount&tr=refId&tn=note
    const upiString = `upi://pay?pa=${encodeURIComponent(upiVpa)}&pn=${encodeURIComponent(
      upiName
    )}&am=${Number(amount).toFixed(2)}&tr=${encodeURIComponent(
      referenceId.trim()
    )}&tn=${encodeURIComponent(note)}`;

    res.json({ upiString });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Initiate wallet recharge transaction (Create pending transaction)
 * @route   POST /api/wallet/initiate
 * @access  Private
 */
export const initiatePayment = async (req, res) => {
  try {
    const { amount, referenceId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than zero' });
    }
    if (!referenceId || !referenceId.trim()) {
      return res.status(400).json({ message: 'Reference ID is required' });
    }

    // Check if a transaction with the same reference ID already exists
    const existingTxn = await Transaction.findOne({ referenceId: referenceId.trim() });
    if (existingTxn) {
      return res.status(400).json({ message: 'Transaction with this reference ID already exists' });
    }

    // Create a pending credit transaction
    const transaction = await Transaction.create({
      userId: req.user._id,
      amount,
      type: 'credit',
      status: 'pending',
      referenceId: referenceId.trim(),
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Approve pending payment and update user wallet balance atomically
 * @route   POST /api/wallet/approve/:transactionId
 * @access  Private (Admin-only)
 */
export const approvePayment = async (req, res) => {
  const { transactionId } = req.params;

  // Start Mongoose Transaction Session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const txn = await Transaction.findById(transactionId).session(session);
    if (!txn) {
      res.status(404);
      throw new Error('Transaction not found');
    }

    if (txn.status !== 'pending') {
      res.status(400);
      throw new Error('Transaction is already processed or closed');
    }

    // Update Transaction status to completed
    txn.status = 'completed';
    await txn.save({ session });

    // Update user balance atomically
    const user = await User.findById(txn.userId).session(session);
    if (!user) {
      res.status(404);
      throw new Error('User associated with this transaction was not found');
    }

    if (txn.type === 'credit') {
      user.walletBalance = (user.walletBalance || 0) + txn.amount;
    } else if (txn.type === 'debit') {
      if ((user.walletBalance || 0) < txn.amount) {
        res.status(400);
        throw new Error('Insufficient wallet balance to perform debit');
      }
      user.walletBalance = (user.walletBalance || 0) - txn.amount;
    }

    await user.save({ session });

    // Commit Mongoose transaction
    await session.commitTransaction();
    session.endSession();

    res.json({
      message: 'Payment approved successfully. Wallet balance updated.',
      transaction: txn,
      walletBalance: user.walletBalance,
    });
  } catch (error) {
    // Abort/Rollback transaction on failure
    await session.abortTransaction();
    session.endSession();

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({ message: error.message });
  }
};

/**
 * @desc    Get current user's wallet transactions
 * @route   GET /api/wallet/my
 * @access  Private
 */
export const getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all transactions for admin approval/auditing
 * @route   GET /api/wallet/admin/all
 * @access  Private (Admin-only)
 */
export const getAdminTransactions = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    const transactions = await Transaction.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
