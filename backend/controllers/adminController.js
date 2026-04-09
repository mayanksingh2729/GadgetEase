const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { sendOrderStatusEmail } = require("../config/mailer");

// Get all users (admin only) - paginated
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(),
    ]);

    res.json({ users, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

// Get all orders (admin only) - paginated
exports.getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find()
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(),
    ]);

    res.json({ orders, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders" });
  }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("userId", "name email");

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Emit real-time notification to the user
    const io = req.app.get("io");
    if (io) {
      io.to(order.userId._id.toString()).emit("order-status-updated", {
        orderId: order._id,
        status: order.status,
        message: `Your order #${order._id.toString().slice(-8)} has been ${status}`,
      });
    }

    // Send status update email
    try {
      if (order.userId?.email) {
        await sendOrderStatusEmail(order.userId.email, order, status);
      }
    } catch (emailErr) {
      console.error("Failed to send status update email:", emailErr.message);
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Error updating order status" });
  }
};

// Get dashboard stats (admin only)
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalOrders, totalProducts, recentOrders] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments(),
      Order.find().populate("userId", "name email").sort({ createdAt: -1 }).limit(5),
    ]);

    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    res.json({
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard stats" });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user" });
  }
};

// Process return (admin only)
exports.processReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const { itemIndex, action } = req.body; // action: "returned" or "deposit-refunded"

    if (!["returned", "deposit-refunded"].includes(action)) {
      return res.status(400).json({ message: "Invalid action. Use 'returned' or 'deposit-refunded'" });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (itemIndex === undefined || !order.items[itemIndex]) {
      return res.status(400).json({ message: "Invalid item index" });
    }

    order.items[itemIndex].returnStatus = action;
    await order.save();

    const populated = await Order.findById(id).populate("userId", "name email");
    res.json({ message: `Item marked as ${action}`, order: populated });
  } catch (error) {
    res.status(500).json({ message: "Error processing return" });
  }
};

// Get all products (admin only) - paginated
exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(),
    ]);

    res.json({ products, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Error fetching products" });
  }
};
