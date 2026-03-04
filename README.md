# GadgetEase - Gadget Rental E-Commerce Platform

A full-stack web application for renting electronic gadgets with flexible rental durations (daily, weekly, monthly), integrated payment processing, and an admin dashboard.

![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![React](https://img.shields.io/badge/React-v19-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-v7+-brightgreen)
![Stripe](https://img.shields.io/badge/Stripe-Payment-blueviolet)

## Screenshots

![alt text](Images/1.png)
![alt text](Images/2.png)
![alt text](Images/3.png)
![alt text](Images/4.png)

## Features

### Customer Features
- **Browse Products** — View gadgets by category with search functionality
- **Dynamic Categories** — Categories fetched from the database with product images
- **Product Details** — Detailed product view with multiple images, rental duration selection, and quantity control
- **Shopping Cart** — Add, update quantity, and remove items with real-time cart count badge
- **Checkout with Stripe** — Secure payment via Stripe Checkout hosted page
- **Order Tracking** — View order history with status updates
- **Address Management** — Save, select, and manage multiple shipping addresses in profile
- **User Authentication** — JWT-based login/signup with avatar selection
- **Toast Notifications** — Real-time feedback for all user actions (success, error, warning)

### Admin Features
- **Dashboard** — Overview stats with recent orders
- **Manage Products** — CRUD operations with multi-image URL support and pagination
- **Manage Orders** — View all orders and update status (pending, confirmed, shipped, delivered, cancelled)
- **Manage Users** — View and delete users with pagination

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js v5
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Payment:** Stripe Checkout API
- **Password Hashing:** bcryptjs

### Frontend
- **Library:** React 19
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **Routing:** React Router DOM v7
- **HTTP Client:** Axios
- **Icons:** React Icons
- **Notifications:** React Toastify
- **Animations:** Lottie React, Swiper

## Project Structure

```
GadgetEase/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── adminController.js   # Admin dashboard & management
│   │   ├── cartController.js    # Cart operations
│   │   ├── orderController.js   # Order CRUD
│   │   ├── paymentController.js # Stripe payment integration
│   │   ├── productController.js # Product CRUD & categories
│   │   └── userController.js    # Auth, profile & addresses
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT verification
│   │   └── adminMiddleware.js   # Admin role check
│   ├── models/
│   │   ├── Cart.js
│   │   ├── Order.js
│   │   ├── Product.js
│   │   └── User.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── productRoutes.js
│   │   └── usersRoutes.js
│   ├── scripts/
│   │   └── addProducts.js       # Database seeding script
│   ├── .env                     # Environment variables
│   ├── server.js                # Express app entry point
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── Logo.jpg
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosInstance.js # Axios config with auth interceptor
│   │   ├── assets/
│   │   │   └── drone.json       # Lottie animation
│   │   ├── components/
│   │   │   ├── Categories.jsx   # Dynamic category carousel
│   │   │   ├── Footer.jsx
│   │   │   ├── Header.jsx       # Nav with search & cart badge
│   │   │   ├── ProductList.jsx  # Product grid
│   │   │   ├── Slideshow.jsx    # Hero slideshow
│   │   │   └── ToastMessage.jsx # Toast notification helpers
│   │   ├── context/
│   │   │   ├── Usercontext.jsx  # User auth state
│   │   │   └── cartContext.jsx  # Cart state
│   │   ├── pages/
│   │   │   ├── Cart.jsx
│   │   │   ├── CategoryPage.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── MyOrders.jsx
│   │   │   ├── PaymentSuccess.jsx
│   │   │   ├── ProductDetailPage.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── AdminLayout.jsx
│   │   │       ├── AdminOrders.jsx
│   │   │       ├── AdminProducts.jsx
│   │   │       └── AdminUsers.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- [Stripe Account](https://stripe.com/) (for payment processing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mayanksingh2729/GadgetEase.git
   cd GadgetEase
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   ```

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
JWT_SECRET=your_jwt_secret_key
MONGO_URI=mongodb://localhost:27017/gadgetease
PORT=5000
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### Seed the Database (Optional)

```bash
cd backend
node scripts/addProducts.js
```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npx nodemon server.js
   ```
   The API server will run at `http://localhost:5000`

2. **Start the frontend dev server**
   ```bash
   cd frontend
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register a new user |
| POST | `/api/users/login` | Login and get JWT token |
| GET | `/api/users/me` | Get current user profile |
| PUT | `/api/users/update` | Update user profile |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products (supports `?category=` filter) |
| GET | `/api/products/categories` | Get all categories with images |
| GET | `/api/products/:id` | Get product by custom ID |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get user's cart |
| POST | `/api/cart/add` | Add item to cart |
| PUT | `/api/cart/:id` | Update cart item |
| DELETE | `/api/cart/:id` | Remove item from cart |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders/my-orders` | Get user's orders |
| GET | `/api/orders/:id` | Get order by ID |

### Payment
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payment/create-checkout-session` | Create Stripe checkout session |
| POST | `/api/payment/verify-payment` | Verify payment and create order |

### Address Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/addresses` | Get saved addresses |
| POST | `/api/users/addresses` | Add new address |
| DELETE | `/api/users/addresses/:id` | Delete address |

### Admin (requires admin role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/users` | Get all users (paginated) |
| DELETE | `/api/admin/users/:id` | Delete a user |
| GET | `/api/admin/orders` | Get all orders (paginated) |
| PUT | `/api/admin/orders/:id/status` | Update order status |
| GET | `/api/admin/products` | Get all products (paginated) |
| POST | `/api/admin/products` | Create product |
| PUT | `/api/admin/products/:id` | Update product |
| DELETE | `/api/admin/products/:id` | Delete product |

## Payment Flow

1. User adds items to cart and proceeds to checkout
2. User selects/adds a shipping address and agrees to terms
3. Clicking "Pay & Place Order" creates a Stripe Checkout session
4. User is redirected to Stripe's hosted payment page
5. After successful payment, user is redirected to `/payment-success`
6. The app verifies the payment with Stripe and creates the order
7. Cart is cleared and order appears in "My Orders"

> **Note:** No order is created until payment is successfully completed. Cancelled payments do not create orders.

### Test Card for Stripe
```
Card Number: 4000 0035 6000 0008
Expiry: Any future date
CVC: Any 3 digits
```

## License

This project is built as a Major Project for MCA Semester 4.
