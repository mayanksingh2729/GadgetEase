const Order = require("../models/Order");
const Cart = require("../models/Cart");
const User = require("../models/User");
const { sendOrderConfirmationEmail } = require("../config/mailer");

const computeEndDate = (startDate, duration) => {
  const end = new Date(startDate);
  if (duration === "day") end.setDate(end.getDate() + 1);
  else if (duration === "week") end.setDate(end.getDate() + 7);
  else if (duration === "month") end.setDate(end.getDate() + 30);
  return end;
};

const addRentalDates = (items) => {
  const now = new Date();
  return items.map((item) => ({
    ...item.toObject ? item.toObject() : item,
    startDate: now,
    endDate: computeEndDate(now, item.duration),
    returnStatus: "not-returned",
  }));
};

// Create order from cart
exports.createOrder = async (req, res) => {
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

    const order = new Order({
      userId,
      items: addRentalDates(cart.items),
      shippingAddress,
      totalAmount: cart.totalAmount,
      status: "confirmed",
      paymentStatus: "paid",
    });

    await order.save();

    cart.items = [];
    await cart.save();

    // Emit new order notification to admins
    const io = req.app.get("io");
    if (io) {
      io.to("admins").emit("new-order", {
        orderId: order._id,
        totalAmount: order.totalAmount,
        message: `New order #${order._id.toString().slice(-8)} placed for ₹${order.totalAmount}`,
      });
    }

    // Send order confirmation email
    try {
      const orderUser = await User.findById(userId).select("email");
      if (orderUser?.email) {
        await sendOrderConfirmationEmail(orderUser.email, order);
      }
    } catch (emailErr) {
      console.error("Failed to send order confirmation email:", emailErr.message);
    }

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Error creating order" });
  }
};

// Get user's orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders" });
  }
};

// Request return for an order item
exports.requestReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const { itemIndex } = req.body;
    const order = await Order.findById(id);

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (order.status !== "delivered") {
      return res.status(400).json({ message: "Order must be delivered to request return" });
    }

    if (itemIndex === undefined || !order.items[itemIndex]) {
      return res.status(400).json({ message: "Invalid item index" });
    }

    if (order.items[itemIndex].returnStatus !== "not-returned") {
      return res.status(400).json({ message: "Return already requested for this item" });
    }

    order.items[itemIndex].returnStatus = "return-requested";
    await order.save();

    res.json({ message: "Return requested successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Error requesting return" });
  }
};

// Generate invoice PDF
exports.getInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const PDFDocument = require("pdfkit");
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    const orderId = order._id.toString().slice(-8);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=invoice-${orderId}.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(24).font("Helvetica-Bold").text("GadgetEase", { align: "center" });
    doc.fontSize(10).font("Helvetica").fillColor("#6b7280").text("Gadget Rental Platform", { align: "center" });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#e5e7eb").stroke();
    doc.moveDown(0.5);

    // Invoice title
    doc.fontSize(18).font("Helvetica-Bold").fillColor("#1f2937").text("INVOICE", { align: "center" });
    doc.moveDown(0.5);

    // Order details
    doc.fontSize(10).font("Helvetica").fillColor("#374151");
    doc.text(`Invoice No: INV-${orderId.toUpperCase()}`, 50);
    doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`);
    doc.text(`Payment Status: ${order.paymentStatus === "paid" ? "Paid" : order.paymentStatus}`);
    doc.text(`Order Status: ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`);
    doc.moveDown(0.5);

    // Shipping address
    const addr = order.shippingAddress;
    doc.font("Helvetica-Bold").text("Ship To:");
    doc.font("Helvetica").text(addr.fullName);
    doc.text(`${addr.addressLine1}${addr.addressLine2 ? ", " + addr.addressLine2 : ""}`);
    doc.text(`${addr.city}, ${addr.state} - ${addr.pincode}`);
    doc.text(`Phone: ${addr.phone}`);
    doc.moveDown(1);

    // Table header
    const tableTop = doc.y;
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#6b7280");
    doc.text("PRODUCT", 50, tableTop, { width: 180 });
    doc.text("DURATION", 230, tableTop, { width: 70 });
    doc.text("QTY", 300, tableTop, { width: 40, align: "center" });
    doc.text("PRICE", 340, tableTop, { width: 65, align: "right" });
    doc.text("SECURITY", 405, tableTop, { width: 65, align: "right" });
    doc.text("TOTAL", 470, tableTop, { width: 75, align: "right" });

    doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).strokeColor("#e5e7eb").stroke();

    // Table rows
    let y = tableTop + 22;
    doc.font("Helvetica").fontSize(9).fillColor("#1f2937");

    let rentalTotal = 0;
    let securityTotal = 0;

    order.items.forEach((item) => {
      const itemSecurity = (item.security || 0) * item.quantity;
      rentalTotal += item.totalPrice || 0;
      securityTotal += itemSecurity;

      doc.text(item.name, 50, y, { width: 180 });
      doc.text(item.duration || "-", 230, y, { width: 70 });
      doc.text(String(item.quantity), 300, y, { width: 40, align: "center" });
      doc.text(`₹${item.price}`, 340, y, { width: 65, align: "right" });
      doc.text(`₹${item.security || 0}`, 405, y, { width: 65, align: "right" });
      doc.text(`₹${(item.totalPrice || 0) + itemSecurity}`, 470, y, { width: 75, align: "right" });

      y += 20;
      if (y > 720) {
        doc.addPage();
        y = 50;
      }
    });

    // Summary
    doc.moveTo(50, y + 5).lineTo(545, y + 5).strokeColor("#e5e7eb").stroke();
    y += 15;

    doc.fontSize(10).fillColor("#374151");
    doc.text("Rental Amount:", 380, y, { width: 90, align: "right" });
    doc.text(`₹${rentalTotal}`, 470, y, { width: 75, align: "right" });
    y += 18;

    doc.text("Security Deposit:", 380, y, { width: 90, align: "right" });
    doc.text(`₹${securityTotal}`, 470, y, { width: 75, align: "right" });
    y += 18;

    doc.text("Delivery:", 380, y, { width: 90, align: "right" });
    doc.fillColor("#16a34a").text("Free", 470, y, { width: 75, align: "right" });
    y += 5;

    doc.moveTo(380, y + 13).lineTo(545, y + 13).strokeColor("#1f2937").lineWidth(1.5).stroke();
    y += 20;

    doc.fontSize(13).font("Helvetica-Bold").fillColor("#1f2937");
    doc.text("Total:", 380, y, { width: 90, align: "right" });
    doc.text(`₹${order.totalAmount}`, 470, y, { width: 75, align: "right" });

    // Footer
    doc.fontSize(8).font("Helvetica").fillColor("#9ca3af");
    doc.text("Thank you for choosing GadgetEase! Security deposit is refundable upon return of the product in good condition.", 50, 760, { align: "center", width: 495 });

    doc.end();
  } catch (error) {
    console.error("Invoice generation error:", error);
    res.status(500).json({ message: "Error generating invoice" });
  }
};

// Get single order
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Error fetching order" });
  }
};
