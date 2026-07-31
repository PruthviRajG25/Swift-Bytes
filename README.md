<centre><h1><b>🍔 SwiftBytes<b><h1></centre>
# 🍔 SwiftBytes - Smart Canteen Management System

Welcome to **SwiftBytes** (formerly Smart Canteen) — a premium full-stack MERN web application with a built-in Wallet ledger system, simulated UPI payment flow, live order tracking via Socket.IO, and a robust admin dashboard.

---

## 🚀 Key Features

*   **📱 Modern Responsive Client:** A premium mobile-first React dashboard using custom modern styles.
*   **👛 Atomic Wallet System:** Secure ledger-based wallet deposits and payments protected by atomic Mongoose transaction sessions.
*   **🔌 UPI Payment Flow:** Dynamic UPI deep link generation (`upi://pay`) rendered instantly as a scannable QR code using `qrcode.react`.
*   **👮 Admin Approval Queue:** Canteen managers manually approve pending wallet deposits and manage live order states.
*   **⚡ Real-Time Tracking:** Live socket connection updates order statuses instantly without browser reloads.
*   **🧾 Invoice Generator:** Automatically generates digital receipts with transaction particulars.

---

## 🛠️ Technology Stack(notations)

| Layer | Technology | Emojis |
| :--- | :--- | :--- |
| **Database** | MongoDB + Mongoose | 🗄️ |
| **Backend** | Node.js + Express.js | ⚙️ |
| **Frontend** | React.js + Vite | ⚛️ |
| **Real-time**| Socket.IO | 🔌 |
| **QR Engine**| qrcode.react | 🏁 |
| **Styling**  | Tailwind CSS | 🎨 |

---

## 🗂️ Project Structure

```
Swift-Bytes/
├── server/
│   ├── config/          # Database & environment configurations ⚙️
│   ├── controllers/     # Auth, food, order, stats, and wallet controllers 📁
│   ├── middleware/      # JWT authentication & Role-Based authorization 🔒
│   ├── models/          # User, Food, Order, and Transaction Mongoose schemas 🗃️
│   └── routes/          # RESTful route routers 🛤️
└── client/
    ├── public/          # Static assets & logos 🖼️
    ├── src/
    │   ├── components/  # Reusable UI elements (Navbar, Cards, Modals) 🧱
    │   ├── context/     # Auth, Cart, and Canteen React Context ⚡
    │   ├── pages/       # Login, Home, Wallet, and Admin dashboards 🖥️
    │   └── services/    # Axios API client & Socket.IO listeners 🔌
    └── vercel.json      # Client SPA rewrite configurations 🚀
```

---

## 🛤️ Wallet API Route Reference

All routes below require JWT authorization (`Authorization: Bearer <token>`).

### Customer Endpoints
*   `POST /api/wallet/upi` - Generates a dynamic standard UPI deep link string.
*   `POST /api/wallet/initiate` - Creates a new deposit record in the `'pending'` state.
*   `GET /api/wallet/my` - Returns the logged-in customer's wallet ledger entries.

### Admin Endpoints
*   `GET /api/wallet/admin/all?status=pending` - Retrieves deposit requests for auditing.
*   `POST /api/wallet/approve/:transactionId` - Atomic transaction session to verify a deposit, complete the transaction, and credit the customer's balance.

---

## 🏃 Local Quick Start

### Prerequisites
*   Node.js (v18+)
*   MongoDB Instance (Local database or MongoDB Atlas URI)

### 1. Configure the Environment
Create a `.env` file at the root folder of the project:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret_key_here
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/dbname

# UPI Configuration
UPI_VPA=merchant@ybl
UPI_NAME=Smart Canteen
```

### 2. Startup the Backend
```bash
cd server
npm install
npm run seed       # Seed default accounts (admin123 / student123)
npm run dev        # Runs on http://localhost:5000
```

### 3. Startup the Frontend
```bash
cd ../client
npm install
npm run dev        # Runs on http://localhost:5173
```

---

## 🚀 Deployment Playbook

### 1. Client Deployment (Vercel)
1.  Connect your GitHub repository to the **Vercel Dashboard**.
2.  Set the **Root Directory** option to `client` under project settings.
3.  Configure your **Environment Variables**:
    *   `VITE_API_URL` = `https://your-backend.render.com/api`
    *   `VITE_SOCKET_URL` = `https://your-backend.render.com`
4.  Vercel will build and serve the client using the pre-configured [vercel.json](client/vercel.json) rules to support client-side routing.

### 2. Server Deployment (Render/Railway)
1.  Deploy the root of the project to Render or Railway.
2.  Set the **Root Directory** option (if available) or the startup path to `server`.
3.  Configure your environment variables:
    *   `CLIENT_URL` = `https://your-frontend.vercel.app` (no trailing slash)
    *   `MONGO_URI` = `mongodb+srv://...`
    *   `JWT_SECRET` = `...`
    *   `NODE_ENV` = `production`
4.  Specify the start command as `npm start`.

---

## 🔒 Wallet System Design & Best Practices

1.  **Atomic Operations:** User balance increments and debit deductions are grouped with their transaction ledger logs inside Mongoose Transaction sessions. If any database or validation step fails, the entire operation is automatically aborted (rolled back), preventing double-spending or orphaned records.
2.  **No Client-Side Trust:** The transaction amount is calculated and read directly from the database record during the admin approval step, preventing users from altering request values.
3.  **Strict Authorization:** Endpoint `/api/wallet/approve/:id` is guarded by the `adminOnly` middleware to ensure non-admin users cannot access it.

<hr>

<h3>Crafted with 💙 by Pruthvi Raj </h3>
