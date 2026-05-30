import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food',
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    instructions: {
      type: String,
      trim: true,
      maxlength: 300,
      default: '',
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'UPI'],
      default: 'Cash',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid'],
      default: 'Pending',
    },
    invoiceNumber: {
      type: String,
      default: '',
    },
    invoiceGeneratedAt: {
      type: Date,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Placed', 'Preparing', 'Ready', 'Completed'],
      default: 'Placed',
    },
    tokenNumber: {
      type: Number,
      required: true,
    },
    review: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String, trim: true, maxlength: 500 },
      createdAt: { type: Date },
    },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
