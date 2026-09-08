# ⚡ LuminaMarket - Modern Full-Stack AI-Powered E-Commerce Platform

A production-grade, full-stack E-Commerce application built with the **MERN** stack (MongoDB, Express, React, Node.js), powered by **Native ES Modules**, **Tailwind CSS v4**, **Redux Toolkit**, and **Lumina AI** (featuring Google Gemini 2.5 Flash, OpenAI GPT-4o-mini, and an intelligent in-house fallback catalog engine).

---

## 🌟 Key Features

### 🛍️ Customer Experience
- **Interactive Product Catalog**: Instant search, category filters, price range sliders, sorting, and pagination.
- **Rich Product Detail Modal**:
  - Two-column responsive showcase with micro trust guarantee badges.
  - Strict inventory and stock limit enforcement (prevents ordering beyond available stock).
  - Clean segmented tab navigation: **Overview**, **Specifications**, and **✨ Lumina AI Insights**.
- **Shopping Cart & Checkout**:
  - Interactive cart drawer and dedicated Cart page with real-time subtotal calculations.
  - Coupon code discounts (`LUMINA15` for 15% off, `SAVE10` for 10% off).
  - Razorpay payment gateway integration with simulated verification.
- **Wishlist**: Quick-save favorite items with real-time state synchronization.
- **Order Tracking**: Order history with status updates (`Processing`, `Shipped`, `Delivered`).

### 🤖 Full-Stack AI Integration (Lumina AI)
- **Conversational Assistant**: Floating AI shopping advisor with full conversation history memory. Intelligently answers general/policy questions and recommends catalog products without repeating cards unnecessarily.
- **Real-Time Product Analysis**: Generates an AI Executive Summary, Key Strengths (Pros), Target Audience (Best For), and Buyer Verdict.
- **AI Copywriter for Sellers**: Automatically crafts high-converting titles and marketing descriptions from a simple keyword prompt.
- **Multi-Provider Fallback**: Seamlessly switches between **Gemini 2.5 Flash**, **OpenAI GPT-4o-mini**, and an in-house catalog recommendation engine if API keys are not provided.

### 🛡️ Role-Based Access Control (RBAC) & Security
- **JWT Authentication via Secure `httpOnly` Cookies**: Session tokens are stored in browser-managed `httpOnly` cookies with `SameSite` and `Secure` protection, preventing token theft through Cross-Site Scripting (XSS). Includes backward-compatible fallback to `Bearer` tokens in `Authorization` headers.
- **Google OAuth 2.0 Integration**: One-click sign-in and sign-up using Google Identity Services (`@react-oauth/google`), automatically verifying Google users without requiring passwords or OTP verification.
- **Server-Side Session Clearing**: Dedicated `/api/v1/auth/logout` endpoint that expires and clears authentication cookies.
- **Email OTP Verification**: Real-time email verification and password reset flows using Nodemailer SMTP.
- **Three Dedicated Roles**:
  - **Buyer (`user`)**: Browse, cart, wishlist, checkout, and order history.
  - **Seller (`seller`)**: Manage personal listings, upload product images to Cloudinary, and generate AI copy.
  - **Admin (`admin`)**: Manage all catalog listings, view platform orders, and update fulfillment statuses.

---

## 🏗️ Architecture & Project Structure

```
ecomm-fs/
├── client/                     # Vite + React 18 Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/         # Navbar, Footer, MobileNav, ProtectedRoute, Toast
│   │   ├── features/           # Redux Slices & Feature Components
│   │   │   ├── ai/             # Lumina AI Chatbot & AI Slice
│   │   │   ├── auth/           # Login, Register, VerifyEmail, authSlice
│   │   │   ├── orders/         # CartDrawer, orderSlice
│   │   │   ├── products/       # ProductCard, ProductList, ProductDetailModal, ProductFormModal
│   │   │   ├── ui/             # uiSlice (modals, theme, toast)
│   │   │   └── wishlist/       # wishlistSlice
│   │   ├── pages/              # Home, Catalog, Cart, Wishlist, Profile, Orders
│   │   ├── utils/              # api.js fetch client
│   │   ├── App.jsx             # Routes and layout
│   │   └── main.jsx            # Entry point
│   ├── package.json
│   ├── vercel.json             # Vercel deployment configuration
│   └── vite.config.js
│
├── server/                     # Node.js + Express Backend (Strict MVC)
│   ├── server.js               # Clean entry point (only app.listen)
│   ├── src/
│   │   ├── app.js              # Express app, middleware, routes, and DB init
│   │   ├── config/             # db.js, cloudinary.js, razorpay.js
│   │   ├── controllers/        # aiController, authController, orderController, productController, etc.
│   │   ├── middleware/         # authMiddleware, errorMiddleware, uploadMiddleware
│   │   ├── models/             # User.js, Product.js, Order.js
│   │   ├── routes/             # aiRoutes, authRoutes, orderRoutes, productRoutes, etc.
│   │   ├── services/           # aiService.js (Gemini, OpenAI, Heuristic fallback)
│   │   └── utils/              # sendEmail.js (Nodemailer transporter)
│   ├── .env.example            # Environment variable template
│   ├── .gitignore
│   └── package.json
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (local instance or MongoDB Atlas connection string)
- *(Optional)* Gemini or OpenAI API Key for live AI generation.
- *(Optional)* Cloudinary account for persistent image hosting.

---

### 1. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment configuration
cp .env.example .env
```

Open `server/.env` and configure your settings:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
MONGO_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d

# SMTP Email Configuration (for OTP and password resets)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
FROM_NAME="LuminaMarket Security"
FROM_EMAIL="noreply@luminamarket.com"

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI Providers (Optional - uses built-in heuristic fallback if omitted)
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
```

Start the backend server:

```bash
npm run dev
# Server runs on http://localhost:5000
```

---

### 2. Frontend Setup

```bash
# In a new terminal, navigate to client directory
cd client

# Install dependencies
npm install

# Start Vite development server
npm run dev
# App runs on http://localhost:3000
```

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| **Auth** | | | |
| `POST` | `/api/v1/auth/register` | Register new user & send OTP | Public |
| `POST` | `/api/v1/auth/login` | Authenticate user & set `httpOnly` cookie | Public |
| `POST` | `/api/v1/auth/google` | Sign in / register via Google OAuth | Public |
| `POST` | `/api/v1/auth/verify-email` | Verify registration OTP & set cookie | Public |
| `POST` | `/api/v1/auth/logout` | Logout user & clear `httpOnly` cookie | Public |
| `POST` | `/api/v1/auth/forgot-password` | Request password reset OTP | Public |
| `POST` | `/api/v1/auth/reset-password` | Reset password with OTP & set cookie | Public |
| `GET` | `/api/v1/auth/me` | Fetch current authenticated user profile | Private (Cookie/Bearer) |
| `PUT` | `/api/v1/auth/update-profile` | Update profile information | Private |
| **Products** | | | |
| `GET` | `/api/v1/products` | Get products (search, filter, sort, paginate) | Public |
| `GET` | `/api/v1/products/:id` | Get single product details | Public |
| `POST` | `/api/v1/products` | Create product listing | Seller / Admin |
| `PUT` | `/api/v1/products/:id` | Update product listing | Seller (Owner) / Admin |
| `DELETE` | `/api/v1/products/:id` | Delete product listing | Seller (Owner) / Admin |
| **Orders** | | | |
| `POST` | `/api/v1/orders/razorpay` | Create Razorpay order | Buyer (`user`) |
| `POST` | `/api/v1/orders/verify` | Verify payment and persist order | Buyer (`user`) |
| `GET` | `/api/v1/orders/my-orders` | Fetch user's order history | Buyer (`user`) |
| `GET` | `/api/v1/orders` | Fetch all platform orders | Admin |
| `PUT` | `/api/v1/orders/:id/status` | Update fulfillment status | Admin |
| **AI (Lumina)** | | | |
| `POST` | `/api/v1/ai/chat` | Conversational shopping assistant | Public |
| `POST` | `/api/v1/ai/summarize-product` | Generate structured product analysis | Public |
| `POST` | `/api/v1/ai/generate-copy` | Generate marketing title & description | Seller / Admin |
| **Upload** | | | |
| `POST` | `/api/v1/upload` | Upload image to Cloudinary CDN | Authenticated |

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS v4, Redux Toolkit, React Router DOM v6, Lucide React icons, `@react-oauth/google`.
- **Backend**: Node.js, Express.js (ES Modules), MongoDB & Mongoose.
- **Authentication**: Google OAuth 2.0 (`google-auth-library`), Secure `httpOnly` Cookies, JSON Web Tokens (JWT), `cookie-parser`, bcryptjs password hashing.
- **File Storage**: Cloudinary SDK, Multer.
- **Mail Service**: Nodemailer (SMTP).
- **Payment Gateway**: Razorpay Node SDK.
- **AI Models**: Google Gemini 2.5 Flash (`@google/genai` REST), OpenAI GPT-4o-mini, and Smart Heuristic Catalog Matcher.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
