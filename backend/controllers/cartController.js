const Cart = require("../models/Cart");

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.json({ items: cart.items, totalAmount: cart.totalAmount });
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart", error });
  }
};

// Add product to cart (or adjust quantity)
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      productId,
      quantity,
      duration,
      price,
      name,
      image,
      brand,
      security = 0,
    } = req.body;

    if (!productId || !duration || typeof quantity !== "number") {
      return res.status(400).json({ message: "Missing or invalid fields" });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) cart = new Cart({ userId, items: [] });

    // Match by productId and duration
    const existingItem = cart.items.find(
      (item) =>
        item.productId.toString() === productId &&
        item.duration === duration
    );

    if (existingItem) {
      existingItem.quantity += quantity;

      if (existingItem.quantity <= 0) {
        // Remove the item if quantity becomes 0 or less
        cart.items = cart.items.filter(
          (item) =>
            !(
              item.productId.toString() === productId &&
              item.duration === duration
            )
        );
      } else {
        existingItem.totalPrice = existingItem.quantity * existingItem.price;
      }
    } else if (quantity > 0) {
      // Only add if quantity > 0
      cart.items.push({
        productId,
        name,
        image,
        brand,
        price,
        quantity,
        duration,
        security,
        totalPrice: quantity * price,
      });
    }

    await cart.save();

    res.json({
      message: "Product added to cart",
      items: cart.items,
      totalAmount: cart.totalAmount,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ message: "Error adding to cart", error });
  }
};

// Update quantity of item in cart
exports.updateCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;
    const { quantity, duration } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(
      (item) =>
        item.productId.toString() === productId &&
        item.duration === duration
    );

    if (!item) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter(
        (i) =>
          !(
            i.productId.toString() === productId &&
            i.duration === duration
          )
      );
    } else {
      item.quantity = quantity;
      item.totalPrice = item.price * quantity;
    }

    await cart.save();

    res.json({
      message: "Cart updated",
      items: cart.items,
      totalAmount: cart.totalAmount,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating cart", error });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;
    const { duration } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) =>
        !(
          item.productId.toString() === productId &&
          item.duration === duration
        )
    );

    await cart.save();

    res.json({
      message: "Product removed from cart",
      items: cart.items,
      totalAmount: cart.totalAmount,
    });
  } catch (error) {
    res.status(500).json({ message: "Error removing from cart", error });
  }
};

// Clear entire cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    await cart.save();

    res.json({ message: "Cart cleared", totalAmount: cart.totalAmount });
  } catch (error) {
    res.status(500).json({ message: "Error clearing cart", error });
  }
};
