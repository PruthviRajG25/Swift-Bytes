import '../config/loadEnv.js';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Food from '../models/Food.js';

const img = (id) =>
  `https://res.cloudinary.com/demo/image/upload/c_fill,w_500,h_500/${id}`;

const foods = [
  {
    name: 'Masala Dosa',
    category: 'Breakfast',
    description: 'Crispy South Indian rice crepe served with coconut chutney and sambar.',
    price: 80,
    image: img('food_dosa_m7jxqk'),
    available: true,
    isVeg: true,
    tags: ['Bestseller', 'South Indian', 'Crispy'],
  },
  {
    name: 'Veg Sandwich',
    category: 'Snacks',
    description: 'Fresh vegetable sandwich with cheese and mint chutney.',
    price: 60,
    image: img('food_sandwich_y2p8km'),
    available: true,
    isVeg: true,
    tags: ['Healthy', 'Quick Bite', 'Vegetarian'],
  },
  {
    name: 'Cold Coffee',
    category: 'Beverages',
    description: 'Chilled creamy coffee blended with milk and ice cream.',
    price: 90,
    image: img('food_coffee_cold_h3n5lp'),
    available: true,
    isVeg: true,
    tags: ['Refreshing', 'Coffee', 'Popular'],
  },
  {
    name: 'Paneer Butter Masala',
    category: 'Lunch',
    description: 'Soft paneer cubes cooked in rich buttery tomato gravy.',
    price: 180,
    image: img('food_paneer_butter_masala_w8j2xo'),
    available: true,
    isVeg: true,
    tags: ['North Indian', 'Creamy', 'Bestseller'],
  },
  {
    name: 'Chocolate Brownie',
    category: 'Dessert',
    description: 'Warm gooey chocolate brownie topped with chocolate sauce.',
    price: 110,
    image: img('food_brownie_chocolate_p4k9mn'),
    available: true,
    isVeg: true,
    tags: ['Sweet', 'Chocolate', 'Favorite'],
  },
  {
    name: 'Poha',
    category: 'Breakfast',
    description: 'Light and flavorful flattened rice cooked with peanuts and spices.',
    price: 50,
    image: img('food_poha_d7x3qr'),
    available: true,
    isVeg: true,
    tags: ['Healthy', 'Maharashtrian', 'Light'],
  },
  {
    name: 'French Fries',
    category: 'Snacks',
    description: 'Crispy golden potato fries served with ketchup.',
    price: 70,
    image: img('food_fries_b2k8lm'),
    available: true,
    isVeg: true,
    tags: ['Crispy', 'Kids Favorite', 'Fast Food'],
  },
  {
    name: 'Mango Shake',
    category: 'Beverages',
    description: 'Thick and creamy mango milkshake made with fresh mangoes.',
    price: 95,
    image: img('food_mango_shake_f5g7po'),
    available: true,
    isVeg: true,
    tags: ['Summer Special', 'Sweet', 'Refreshing'],
  },
  {
    name: 'Veg Biryani',
    category: 'Lunch',
    description: 'Aromatic basmati rice cooked with vegetables and spices.',
    price: 150,
    image: img('food_veg_biryani_j8s3hu'),
    available: true,
    isVeg: true,
    tags: ['Spicy', 'Rice Dish', 'Popular'],
  },
  {
    name: 'Gulab Jamun',
    category: 'Dessert',
    description: 'Soft milk-solid dumplings soaked in sugar syrup.',
    price: 60,
    image: img('food_gulab_jamun_r2v6nq'),
    available: true,
    isVeg: true,
    tags: ['Indian Sweet', 'Soft', 'Traditional'],
  },
  {
    name: 'Idli Sambar',
    category: 'Breakfast',
    description: 'Steamed rice cakes served with hot sambar and chutney.',
    price: 70,
    image: img('food_idli_sambar_c9w1lk'),
    available: true,
    isVeg: true,
    tags: ['Healthy', 'South Indian', 'Light'],
  },
  {
    name: 'Spring Rolls',
    category: 'Snacks',
    description: 'Crispy vegetable rolls served with spicy dip.',
    price: 120,
    image: img('food_spring_rolls_t4m2jx'),
    available: true,
    isVeg: true,
    tags: ['Chinese', 'Crispy', 'Spicy'],
  },
  {
    name: 'Lemon Soda',
    category: 'Beverages',
    description: 'Fizzy lemon drink with a refreshing tangy flavor.',
    price: 45,
    image: img('food_lemon_soda_a8p3yx'),
    available: true,
    isVeg: true,
    tags: ['Refreshing', 'Summer Drink', 'Tangy'],
  },
  {
    name: 'Chole Bhature',
    category: 'Lunch',
    description: 'Fluffy bhature served with spicy chickpea curry.',
    price: 140,
    image: img('food_chole_bhature_n6d5zw'),
    available: true,
    isVeg: true,
    tags: ['Punjabi', 'Spicy', 'Filling'],
  },
  {
    name: 'Ice Cream Sundae',
    category: 'Dessert',
    description: 'Vanilla ice cream topped with chocolate syrup and nuts.',
    price: 130,
    image: img('food_ice_cream_sundae_l3k7ms'),
    available: true,
    isVeg: true,
    tags: ['Cold Dessert', 'Sweet', 'Chocolate'],
  },
  {
    name: 'Upma',
    category: 'Breakfast',
    description: 'Savory semolina dish cooked with vegetables and spices.',
    price: 55,
    image: img('food_upma_e2h9qs'),
    available: true,
    isVeg: true,
    tags: ['Healthy', 'South Indian', 'Light'],
  },
  {
    name: 'Nachos with Dip',
    category: 'Snacks',
    description: 'Crunchy nachos served with cheesy salsa dip.',
    price: 125,
    image: img('food_nachos_dip_v7f4wo'),
    available: true,
    isVeg: true,
    tags: ['Mexican', 'Crunchy', 'Cheesy'],
  },
  {
    name: 'Strawberry Smoothie',
    category: 'Beverages',
    description: 'Fresh strawberry smoothie blended with yogurt and honey.',
    price: 110,
    image: img('food_strawberry_smoothie_u1j8lr'),
    available: true,
    isVeg: true,
    tags: ['Healthy', 'Fruity', 'Refreshing'],
  },
  {
    name: 'Rajma Chawal',
    category: 'Lunch',
    description: 'Kidney bean curry served with steamed rice.',
    price: 130,
    image: img('food_rajma_chawal_s5b3gn'),
    available: true,
    isVeg: true,
    tags: ['Comfort Food', 'North Indian', 'Protein Rich'],
  },
  {
    name: 'Cheesecake',
    category: 'Dessert',
    description: 'Creamy baked cheesecake with a buttery biscuit base.',
    price: 160,
    image: img('food_cheesecake_o4d9xk'),
    available: true,
    isVeg: true,
    tags: ['Creamy', 'Sweet', 'Premium'],
  },
];

// add a couple of non-veg demo items
foods.push(
  {
    name: 'Chicken 65',
    category: 'Snacks',
    description: 'Spicy fried chicken tossed with curry leaves and chillies.',
    price: 180,
    image: img('food_chicken_65_x1y2z3'),
    available: true,
    isVeg: false,
    tags: ['Spicy', 'Starter', 'Popular'],
  },
  {
    name: 'Egg Roll',
    category: 'Snacks',
    description: 'Rolled flatbread with spiced egg filling.',
    price: 90,
    image: img('food_egg_roll_a9b8c7'),
    available: true,
    isVeg: false,
    tags: ['Street Food', 'Quick Bite'],
  }
);

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const shouldReset = String(process.env.SEED_RESET || '').toLowerCase() === 'true';
    if (shouldReset) {
      await Food.deleteMany();
      await User.deleteMany({ email: { $in: ['admin@canteen.com', 'student@canteen.com'] } });
    }

    const foodCount = await Food.countDocuments();
    if (foodCount === 0) {
      await Food.insertMany(foods);
    }

    const admin = await User.findOne({ email: 'admin@canteen.com' });
    if (!admin) {
      await User.create({
        name: 'Canteen Admin',
        email: 'admin@canteen.com',
        password: 'admin123',
        role: 'admin',
      });
    }

    const student = await User.findOne({ email: 'student@canteen.com' });
    if (!student) {
      await User.create({
        name: 'Demo Student',
        email: 'student@canteen.com',
        password: 'student123',
        role: 'customer',
      });
    }

    console.log('Database seeded successfully!');
    console.log('Admin: admin@canteen.com / admin123');
    console.log('Student: student@canteen.com / student123');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();
