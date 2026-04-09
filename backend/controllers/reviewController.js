const Review = require("../models/Review");
const Order = require("../models/Order");

exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ productId })
      .populate("userId", "name avatarUrl")
      .sort({ createdAt: -1 });

    const total = reviews.length;
    const avgRating = total > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1)
      : 0;

    res.json({ reviews, avgRating: Number(avgRating), total });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

exports.createReview = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, rating, title, comment } = req.body;

    // Check if user already reviewed this product
    const existing = await Review.findOne({ userId, productId });
    if (existing) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    // Verify user has a delivered order with this product
    const order = await Order.findOne({
      userId,
      status: "delivered",
      "items.productId": productId,
    });

    if (!order) {
      return res.status(403).json({
        message: "You can only review products from delivered orders",
      });
    }

    const review = new Review({ userId, productId, rating, title, comment });
    await review.save();

    const populated = await review.populate("userId", "name avatarUrl");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Only review owner can delete
    if (review.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }

    await Review.findByIdAndDelete(id);
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};
