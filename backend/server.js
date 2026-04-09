require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const connectDB = require("./config/database");
const User = require("./models/User");

const usersRoutes = require("./routes/usersRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const adminRoutes = require("./routes/adminRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");

const authMiddleware = require("./middleware/authMiddleware");

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  },
});

// Socket auth middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication required"));
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
    socket.userId = decoded.userId;
    const user = await User.findById(decoded.userId).select("role");
    socket.userRole = user?.role || "user";
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  // Join personal room
  socket.join(socket.userId);
  // Join admin room if admin
  if (socket.userRole === "admin") {
    socket.join("admins");
  }
  socket.on("disconnect", () => {});
});

app.set("io", io);

// Security middleware
app.use(helmet());
app.use(morgan("dev"));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later." },
});
app.use(generalLimiter);

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
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
app.use("/api/reviews", reviewRoutes); // Reviews
app.use("/api/wishlist", wishlistRoutes); // Wishlist

// Swagger API docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Basic test route
app.get("/", (req, res) => {
  res.send("Welcome to GadgetEase backend!");
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
