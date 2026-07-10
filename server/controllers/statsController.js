import Order from '../models/Order.js';
import Food from '../models/Food.js';
import CanteenSettings from '../models/CanteenSettings.js';

const periodHours = {
  breakfast: { start: 6, end: 11 },
  lunch: { start: 11, end: 16 },
  dinner: { start: 16, end: 22 },
  snacks: { start: 0, end: 24 },
};

// @desc    Dashboard statistics
// @route   GET /api/stats
export const getDashboardStats = async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get canteen settings
  const settings = await CanteenSettings.findOne();
  
  // Check if invoice was printed today
  const invoicePrintedToday = settings?.lastInvoicePrintedDate 
    ? new Date(settings.lastInvoicePrintedDate).toDateString() === today.toDateString()
    : false;

  // Calculate today's revenue (only if canteen is open and invoice not printed)
  let todayRevenue = 0;
  if (settings?.isOpen && !invoicePrintedToday) {
    const todayOrders = await Order.find({
      status: 'Completed',
      createdAt: { $gte: today, $lt: tomorrow },
    });
    todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalPrice, 0);
  }

  const orders = await Order.find({ status: 'Completed' });
  const totalOrders = await Order.countDocuments();
  const activeOrders = await Order.countDocuments({
    status: { $in: ['Placed', 'Preparing', 'Ready'] },
  });

  const itemCounts = {};
  orders.forEach((order) => {
    order.items.forEach((item) => {
      const key = item.name;
      itemCounts[key] = (itemCounts[key] || 0) + item.quantity;
    });
  });

  const mostOrdered = Object.entries(itemCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const reviewedOrders = await Order.find({ 'review.rating': { $exists: true } });
  const avgRating =
    reviewedOrders.length > 0
      ? reviewedOrders.reduce((sum, o) => sum + o.review.rating, 0) / reviewedOrders.length
      : 0;

  const ordersToday = (settings?.isOpen ?? true)
    ? await Order.countDocuments({ createdAt: { $gte: today } })
    : 0;

  res.json({
    totalOrders,
    activeOrders,
    revenue: todayRevenue,
    completedOrders: orders.length,
    mostOrdered,
    avgRating: Math.round(avgRating * 10) / 10,
    reviewCount: reviewedOrders.length,
    ordersToday,
    canteenOpen: settings?.isOpen ?? true,
    invoicePrintedToday,
  });
};

// @desc    Trending foods by time-of-day period
// @route   GET /api/stats/trending?period=breakfast|lunch|dinner|snacks&days=7
export const getTrendingFoods = async (req, res) => {
  const period = String(req.query.period || 'snacks').toLowerCase();
  const hours = periodHours[period] || periodHours.snacks;
  const days = Math.min(Math.max(Number(req.query.days || 7), 1), 30);

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const pipeline = [
    {
      $match: {
        status: 'Completed',
        createdAt: { $gte: since },
        $expr: {
          $and: [
            { $gte: [{ $hour: '$createdAt' }, hours.start] },
            { $lt: [{ $hour: '$createdAt' }, hours.end] },
          ],
        },
      },
    },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.food',
        qty: { $sum: '$items.quantity' },
      },
    },
    { $sort: { qty: -1 } },
    { $limit: 12 },
  ];

  const agg = await Order.aggregate(pipeline);
  const ids = agg.map((r) => r._id).filter(Boolean);

  const foods = await Food.find({ _id: { $in: ids } });
  const foodMap = new Map(foods.map((f) => [String(f._id), f]));

  const result = agg
    .map((r) => {
      const food = foodMap.get(String(r._id));
      if (!food) return null;
      return { food, qty: r.qty };
    })
    .filter(Boolean);

  res.json({ period, days, items: result });
};

// @desc    Most sold item for a category (optionally within days)
// @route   GET /api/stats/top-by-category?category=Snacks&days=7
export const getTopItemByCategory = async (req, res) => {
  const category = String(req.query.category || '').trim();
  if (!category) {
    return res.status(400).json({ message: 'category is required' });
  }
  const days = Math.min(Math.max(Number(req.query.days || 30), 1), 60);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const pipeline = [
    {
      $match: {
        status: 'Completed',
        createdAt: { $gte: since },
      },
    },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'foods',
        localField: 'items.food',
        foreignField: '_id',
        as: 'foodDoc',
      },
    },
    { $unwind: '$foodDoc' },
    { $match: { 'foodDoc.category': category } },
    {
      $group: {
        _id: '$foodDoc._id',
        qty: { $sum: '$items.quantity' },
      },
    },
    { $sort: { qty: -1 } },
    { $limit: 1 },
  ];

  const agg = await Order.aggregate(pipeline);
  const top = agg?.[0];
  if (!top?._id) {
    return res.json({ category, days, item: null });
  }

  const food = await Food.findById(top._id);
  if (!food) return res.json({ category, days, item: null });
  res.json({ category, days, item: { food, qty: top.qty } });
};

// @desc    Daily earnings invoice (admin)
// @route   GET /api/stats/daily-invoice?date=YYYY-MM-DD
export const getDailyInvoice = async (req, res) => {
  const dateStr = String(req.query.date || '').trim();

  const start = new Date();
  if (dateStr) {
    const parsed = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      return res.status(400).json({ message: 'Invalid date. Use YYYY-MM-DD' });
    }
    start.setTime(parsed.getTime());
  }
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const orders = await Order.find({
    createdAt: { $gte: start, $lt: end },
    status: { $in: ['Preparing', 'Ready', 'Completed'] },
  })
    .populate('userId', 'name email')
    .sort({ createdAt: 1 });

  const totals = {
    orderCount: orders.length,
    gross: orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0),
    cash: orders
      .filter((o) => o.paymentMethod === 'Cash')
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0),
    upi: orders
      .filter((o) => o.paymentMethod === 'UPI')
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0),
  };

  const itemCounts = {};
  orders.forEach((o) => {
    (o.items || []).forEach((it) => {
      itemCounts[it.name] = (itemCounts[it.name] || 0) + (it.quantity || 0);
    });
  });

  const topItems = Object.entries(itemCounts)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10);

  res.json({
    date: start.toISOString().slice(0, 10),
    period: { start, end },
    totals,
    topItems,
    orders: orders.map((o) => ({
      _id: o._id,
      tokenNumber: o.tokenNumber,
      createdAt: o.createdAt,
      invoiceNumber: o.invoiceNumber || '',
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      customer: { name: o.userId?.name || '', email: o.userId?.email || '' },
      total: o.totalPrice,
      status: o.status,
    })),
  });
};

/**
 * @desc    Get all order reviews
 * @route   GET /api/stats/reviews
 * @access  Private (Admin-only)
 */
export const getOrderReviews = async (req, res) => {
  try {
    const reviews = await Order.find({ 'review.rating': { $exists: true } })
      .populate('userId', 'name email')
      .sort({ 'review.createdAt': -1 });

    const formatted = reviews.map((o) => ({
      orderId: o._id,
      tokenNumber: o.tokenNumber,
      customer: o.userId?.name || 'Anonymous',
      rating: o.review.rating,
      comment: o.review.comment || '',
      createdAt: o.review.createdAt || o.updatedAt,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
