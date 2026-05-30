import Food from '../models/Food.js';
import { assertCloudinaryImage } from '../utils/cloudinaryUrl.js';
import Order from '../models/Order.js';

// @desc    Get all food items (optional category filter)
// @route   GET /api/food?category=Snacks
export const getFoods = async (req, res) => {
  const filter = {};
  if (req.query.category) {
    filter.category = req.query.category;
  }
  const foods = await Food.find(filter).sort({ createdAt: -1 });
  res.json(foods);
};

// @desc    Get food categories
// @route   GET /api/food/categories
export const getCategories = async (req, res) => {
  const categories = await Food.distinct('category');
  res.json(categories);
};

// @desc    Get single food item
// @route   GET /api/food/:id
export const getFoodById = async (req, res) => {
  const food = await Food.findById(req.params.id);
  if (!food) {
    return res.status(404).json({ message: 'Food item not found' });
  }
  res.json(food);
};

// @desc    Create food item
// @route   POST /api/food
export const createFood = async (req, res) => {
  try {
    if (!req.body.description?.trim()) {
      return res.status(400).json({ message: 'Description is required' });
    }
    if (req.body.image) {
      req.body.image = assertCloudinaryImage(req.body.image);
    }
    if (req.body.tags && !Array.isArray(req.body.tags)) {
      return res.status(400).json({ message: 'tags must be an array of strings' });
    }
    const food = await Food.create(req.body);
    res.status(201).json(food);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Update food item
// @route   PUT /api/food/:id
export const updateFood = async (req, res) => {
  try {
    if (req.body.description !== undefined && !req.body.description?.trim()) {
      return res.status(400).json({ message: 'Description is required' });
    }
    if (req.body.image) {
      req.body.image = assertCloudinaryImage(req.body.image);
    }
    if (req.body.tags !== undefined && req.body.tags !== null && !Array.isArray(req.body.tags)) {
      return res.status(400).json({ message: 'tags must be an array of strings' });
    }
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }
    res.json(food);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Delete food item
// @route   DELETE /api/food/:id
export const deleteFood = async (req, res) => {
  const food = await Food.findByIdAndDelete(req.params.id);
  if (!food) {
    return res.status(404).json({ message: 'Food item not found' });
  }
  res.json({ message: 'Food item removed' });
};

// @desc    "Pairs well with" recommendations based on co-occurrence in orders
// @route   GET /api/food/:id/pairs?days=30&limit=4
export const getPairRecommendations = async (req, res) => {
  const baseId = String(req.params.id || '').trim();
  const days = Math.min(Math.max(Number(req.query.days || 30), 1), 90);
  const limit = Math.min(Math.max(Number(req.query.limit || 4), 1), 12);

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const pipeline = [
    { $match: { status: 'Completed', createdAt: { $gte: since } } },
    {
      $project: {
        foods: {
          $setUnion: [
            {
              $map: {
                input: '$items',
                as: 'it',
                in: '$$it.food',
              },
            },
            [],
          ],
        },
        items: 1,
      },
    },
    { $match: { foods: { $in: [baseId] } } },
    { $unwind: '$items' },
    {
      $match: {
        $expr: { $ne: [{ $toString: '$items.food' }, baseId] },
      },
    },
    {
      $group: {
        _id: '$items.food',
        qty: { $sum: '$items.quantity' },
        orderCount: { $sum: 1 },
      },
    },
    { $sort: { qty: -1, orderCount: -1 } },
    { $limit: limit },
  ];

  const agg = await Order.aggregate(pipeline);
  const ids = agg.map((r) => r._id).filter(Boolean);
  const foods = await Food.find({ _id: { $in: ids } });
  const foodMap = new Map(foods.map((f) => [String(f._id), f]));

  const items = agg
    .map((r) => {
      const f = foodMap.get(String(r._id));
      if (!f) return null;
      return { food: f, score: r.qty };
    })
    .filter(Boolean);

  res.json({ baseId, days, items });
};
