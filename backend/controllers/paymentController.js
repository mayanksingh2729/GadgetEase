const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Cart = require("../models/Cart");
const Order = require("../models/Order");

// Create Stripe Checkout Session (NO order created yet)
exports.createCheckoutSession = async (req, res) => {
  try {
    const userId = req.userId;
    const { shippingAddress } = req.body;

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone ||
        !shippingAddress.addressLine1 || !shippingAddress.city ||
        !shippingAddress.state || !shippingAddress.pincode) {
      return res.status(400).json({ message: "All address fields are required" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Build line items for Stripe
    const line_items = cart.items.map((item) => {
      const unitAmount = Math.round(
        ((item.price || 0) + (item.security || 0)) * 100
      );

      const imageUrl = item.image && item.image.startsWith("http") ? item.image : null;

      const product_data = {
        name: item.name || "Product",
        description: `${item.duration} rental${item.security ? ` + ₹${item.security} security deposit` : ""}`,
      };
      if (imageUrl) {
        product_data.images = [imageUrl];
      }

      return {
        price_data: {
          currency: "inr",
          product_data,
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/checkout?payment=cancelled`,
      metadata: {
        userId: userId,
        shippingAddress: JSON.stringify(shippingAddress),
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe session error:", error.message || error);
    res.status(500).json({ message: error.message || "Failed to create payment session" });
  }
};

// Verify payment and create order ONLY after successful payment
exports.verifyPayment = async (req, res) => {
  try {
    const { session_id } = req.body;
    const userId = req.userId;

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    // Prevent duplicate orders for the same session
    const existingOrder = await Order.findOne({ stripeSessionId: session.id });
    if (existingOrder) {
      return res.json({ message: "Payment already verified", order: existingOrder });
    }

    // Verify the session belongs to this user
    if (session.metadata.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const shippingAddress = JSON.parse(session.metadata.shippingAddress);

    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // NOW create the order — only after payment is confirmed
    const order = new Order({
      userId,
      items: cart.items,
      shippingAddress,
      totalAmount: cart.totalAmount,
      status: "confirmed",
      paymentStatus: "paid",
      stripeSessionId: session.id,
    });
    await order.save();

    // Clear cart
    cart.items = [];
    await cart.save();

    return res.json({ message: "Payment verified successfully", order });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ message: "Failed to verify payment" });
  }
};
