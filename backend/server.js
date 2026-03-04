require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./config/database");

// const authRoutes = require("./routes/authRoutes");
const usersRoutes = require("./routes/usersRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const adminRoutes = require("./routes/adminRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const authMiddleware = require("./middleware/authMiddleware");

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
connectDB()
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Routes
// app.use("/api/auth", authRoutes);         // Signup, Login
app.use("/api/users", usersRoutes);       // User profile/update/delete
app.use("/api/products", productRoutes);  // Products
app.use("/api/cart", cartRoutes);         // Cart
app.use("/api/admin", adminRoutes);      // Admin
app.use("/api/orders", orderRoutes);     // Orders
app.use("/api/payment", paymentRoutes); // Stripe Payment

// Basic test route
app.get("/", (req, res) => {
  res.send("Welcome to GadgetEase backend!");
});

// Example protected route
app.get("/api/user-profile", authMiddleware, (req, res) => {
  res.json({ message: "This is a protected route!", userId: req.userId });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
