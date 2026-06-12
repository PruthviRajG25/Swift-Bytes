# Smart Canteen Management System(SwiftBytes)

A full-stack MERN web application for college canteens. Customers browse the menu, order food, and track status in real time. Admins manage the menu, orders, and view dashboard statistics.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Database | MongoDB + Mongoose |
| Backend | Node.js + Express.js |
| Frontend | React.js + Vite |
| Styling | Tailwind CSS |
| Real-time | Socket.IO |
| Auth | JWT + bcrypt |
| Images | Hosted image upload |

## Image Upload Setup

Food images are stored as secure hosted URLs.

Add these variables to `server/.env` (your image host credentials):

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=smart-canteen
```

**Admin → Manage Menu** supports:
- **Upload** an image file → server uploads it and fills the URL automatically

## Project Architecture

```
┌─────────────────┐     REST API (JWT)      ┌─────────────────┐
│  React Client   │ ◄──────────────────────►│  Express Server │
│  (Vite + TW)    │     Socket.IO (WS)      │  (MVC + IO)     │
└────────┬────────┘                         └────────┬────────┘
         │                                           │
         │  localStorage (token, cart)               │ Mongoose
         └───────────────────────────────────────────┤
                                                     ▼
                                            ┌─────────────────┐
                                            │    MongoDB      │
                                            │ Users | Food    │
                                            │ Orders          │
                                            └─────────────────┘
```

## Folder Structure

```
smart-canteen/
├── server/
│   ├── config/db.js
│   ├── controllers/     # auth, food, order, stats
│   ├── middleware/      # auth, role, error
│   ├── models/          # User, Food, Order
│   ├── routes/
│   ├── scripts/seed.js
│   └── server.js
├── client/
│   └── src/
│       ├── components/
│       ├── context/     # Auth, Cart
│       ├── pages/
│       ├── services/    # api, socket
│       └── App.jsx
└── README.md
```

## API Routes

### Auth (`/api/auth`)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/register` | Public | Register user |
| POST | `/login` | Public | Login, returns JWT |
| GET | `/me` | Private | Current user profile |

### Food (`/api/food`)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/` | Public | List foods (`?category=`) |
| GET | `/categories` | Public | Distinct categories |
| GET | `/:id` | Public | Single food item |
| POST | `/` | Admin | Create food |
| PUT | `/:id` | Admin | Update food |
| DELETE | `/:id` | Admin | Delete food |

### Orders (`/api/orders`)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/` | Customer | Place order |
| GET | `/my` | Customer | Order history |
| GET | `/` | Admin | All orders (`?status=`, `?active=true`) |
| GET | `/:id` | Private | Single order |
| PUT | `/:id/status` | Admin | Update status |

## Features & Status

### ✅ Implemented
- User authentication (Register, Login, JWT)
- Role-based access (Customer, Admin, Canteen Manager)
- Food menu management (CRUD operations)
- Shopping cart with persistent storage
- Order placement & real-time order tracking
- Admin dashboard with statistics
- Order status management
- Invoice generation
- Mobile-responsive design
- Cloudinary image upload
- Socket.IO real-time notifications

### 🔄 In Development / Roadmap

#### UPI Payment Integration (Next Priority)
- Integrate UPI payment gateway (Razorpay/PhonePe)
- Payment verification and transaction logging
- Invoice with payment details
- Payment history and receipts
- Admin payment analytics

#### Upcoming Features
- Rating & review system for food items
- Wishlist functionality
- Order recommendations based on history
- Email notifications
- Loyalty/reward points system
- Scheduled orders (pre-order for future)
- Multiple payment methods (Debit/Credit card, Wallet)
- Order cancellation & refund handling
- Advanced analytics dashboard
- Push notifications

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (Local or Atlas)
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/canteensys.git
cd canteensys
```

2. **Setup Server:**
```bash
cd server
npm install
```

3. **Setup Client:**
```bash
cd ../client
npm install
```

4. **Environment Variables (server/.env):**
```env
# Database
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=smart-canteen

# Server Port
PORT=5000
```

5. **Seed Database (Optional):**
```bash
cd server
npm run seed
```

6. **Start Server:**
```bash
cd server
npm start
```

7. **Start Client:**
```bash
cd client
npm run dev
```

The application will be available at `http://localhost:5173`

## How to Push to GitHub

### Step 1: Initialize Git (if not already done)
```bash
cd c:\Users\ADMIN\OneDrive\Desktop\canteensys
git init
```

### Step 2: Create .gitignore
Create a `.gitignore` file in the root:
```
node_modules/
.env
.env.local
.DS_Store
dist/
build/
*.log
.vscode/
```

### Step 3: Create GitHub Repository
1. Go to [GitHub](https://github.com/new)
2. Create a new repository (e.g., `canteensys`)
3. **Do NOT** initialize with README, .gitignore, or license

### Step 4: Add Remote & Push
```bash
# Navigate to project root
cd c:\Users\ADMIN\OneDrive\Desktop\canteensys

# Configure git
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Add remote repository
git remote add origin https://github.com/yourusername/canteensys.git

# Stage all files
git add .

# Initial commit
git commit -m "Initial commit: Smart Canteen Management System"

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 5: Future Commits
```bash
# Make changes, then:
git add .
git commit -m "Your commit message"
git push origin main
```

### Useful Git Commands
```bash
# Check status
git status

# View commit history
git log --oneline

# Create feature branch
git checkout -b feature/upi-payment

# Switch back to main
git checkout main

# Merge feature branch
git merge feature/upi-payment

# Pull latest changes
git pull origin main
```

## Deployment

### Server Deployment (Render/Railway)
1. Push code to GitHub
2. Connect GitHub repo to Render/Railway
3. Set environment variables in platform dashboard
4. Deploy

### Client Deployment (Vercel/Netlify)
1. Build: `npm run build`
2. Deploy `dist/` folder to Vercel/Netlify
3. Set API endpoint to production server URL

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support & Contact

For issues, questions, or suggestions, please open an issue on GitHub or contact the development team.

### Stats (`/api/stats`)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/` | Admin | Dashboard statistics |

### Upload (`/api/upload`)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/` | Admin | Upload image file → returns `url` |

## MongoDB Schemas

### Users
- `name`, `email`, `password` (hashed), `role` (`customer` | `admin`)

### Food
- `name`, `category`, `price`, `image` (hosted URL, required), `available`

### Orders
- `userId`, `items[]`, `totalPrice`, `status`, `tokenNumber`, `createdAt`

**Order status flow:** `Placed` → `Preparing` → `Ready` → `Completed`

## Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `joinUser` | Client → Server | Join room `user:{userId}` |
| `orderUpdate` | Server → Client | Order created/updated for user |
| `orderStatusChanged` | Server → All | Status changed (admin action) |
| `newOrder` | Server → All | New order placed |

## Pages

| Page | Route | Role |
|------|-------|------|
| Login | `/login` | Public |
| Register | `/register` | Public |
| Menu | `/` | Public (admin → dashboard) |
| Cart | `/cart` | Customer |
| Orders | `/orders` | Customer |
| Admin Dashboard | `/admin` | Admin |
| Manage Menu | `/admin/menu` | Admin |
| Manage Orders | `/admin/orders` | Admin |

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URI)

### 1. Backend

```bash
cd server
cp .env.example .env   # edit MONGO_URI and JWT_SECRET if needed
npm install
npm run seed           # demo users + menu items (non-destructive)
npm run dev
```

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173**

### Demo Accounts (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@canteen.com | admin123 |
| Student | student@canteen.com | student123 |

## Authentication Flow

1. User registers/logs in → server returns JWT + user object.
2. Client stores `{ _id, name, email, role, token }` in `localStorage`.
3. Axios interceptor attaches `Authorization: Bearer <token>` to API calls.
4. `GET /api/auth/me` validates token on app load.
5. Protected routes check `user` and `role` before rendering.
6. Socket connects and emits `joinUser` with `userId` for targeted updates.

## Deployment

### Backend (Render / Railway / Heroku)
1. Set env vars: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `PORT`, `NODE_ENV=production`
2. Deploy `server/` folder, start command: `npm start`
3. Run seed once if needed: `npm run seed`

### Frontend (Vercel / Netlify)
1. Set `VITE_API_URL=https://your-api.com/api`
2. Set `VITE_SOCKET_URL=https://your-api.com`
3. Build: `npm run build`, publish `dist/`

### MongoDB Atlas
1. Create cluster → get connection string
2. Set `MONGO_URI` in backend `.env`
3. Whitelist deployment server IP (or `0.0.0.0/0` for demos)

## Best Practices Used

- **MVC** on backend (models, controllers, routes)
- **JWT** stateless authentication
- **Role-based** middleware (`adminOnly`)
- **Centralized** error handling middleware
- **React Context** for auth and cart state
- **Protected routes** with loading states
- **Toast notifications** (react-hot-toast)
- **Reusable components** (FoodCard, OrderCard, Navbar)
- **Real-time** order tracking via Socket.IO rooms
- **Daily token numbers** reset each day
