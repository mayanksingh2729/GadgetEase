const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const fromEmail = () => process.env.FROM_EMAIL || process.env.SMTP_USER;

// Password reset email
const sendResetEmail = async (to, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${resetToken}`;

  await transporter.sendMail({
    from: fromEmail(),
    to,
    subject: "GadgetEase - Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2937;">Password Reset Request</h2>
        <p>You requested a password reset for your GadgetEase account.</p>
        <p>Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #1f2937; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #6b7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
};

// Order confirmation email
const sendOrderConfirmationEmail = async (to, order) => {
  const orderId = order._id.toString().slice(-8);
  const itemRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
          <strong>${item.name}</strong><br/>
          <span style="color: #6b7280; font-size: 13px;">${item.brand} | ${item.duration} rental</span>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">&#8377;${item.totalPrice}</td>
      </tr>`
    )
    .join("");

  const addr = order.shippingAddress;
  const addressStr = `${addr.fullName}, ${addr.addressLine1}${addr.addressLine2 ? ", " + addr.addressLine2 : ""}, ${addr.city}, ${addr.state} - ${addr.pincode}`;

  await transporter.sendMail({
    from: fromEmail(),
    to,
    subject: `GadgetEase - Order Confirmed #${orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 24px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #1f2937; margin: 0;">Order Confirmed!</h1>
          <p style="color: #6b7280; margin: 8px 0 0;">Thank you for your rental order.</p>
        </div>

        <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
          <p style="margin: 0 0 4px;"><strong>Order ID:</strong> #${orderId}</p>
          <p style="margin: 0 0 4px;"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
          <p style="margin: 0;"><strong>Payment:</strong> <span style="color: #16a34a;">Paid</span></p>
        </div>

        <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
          <h3 style="margin: 0 0 12px; color: #1f2937;">Items</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 8px 10px; text-align: left; font-size: 13px; color: #6b7280;">Product</th>
                <th style="padding: 8px 10px; text-align: center; font-size: 13px; color: #6b7280;">Qty</th>
                <th style="padding: 8px 10px; text-align: right; font-size: 13px; color: #6b7280;">Price</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>
          <div style="text-align: right; margin-top: 12px; padding-top: 12px; border-top: 2px solid #e5e7eb;">
            <strong style="font-size: 18px; color: #1f2937;">Total: &#8377;${order.totalAmount}</strong>
          </div>
        </div>

        <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
          <h3 style="margin: 0 0 8px; color: #1f2937;">Shipping Address</h3>
          <p style="color: #374151; margin: 0;">${addressStr}</p>
          <p style="color: #6b7280; margin: 4px 0 0;">Phone: ${addr.phone}</p>
        </div>

        <div style="text-align: center; margin-top: 20px;">
          <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/orders" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            View My Orders
          </a>
        </div>

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
          GadgetEase - Rent gadgets with ease
        </p>
      </div>
    `,
  });
};

// Order status update email
const sendOrderStatusEmail = async (to, order, newStatus) => {
  const orderId = order._id.toString().slice(-8);

  const statusMessages = {
    pending: "Your order is pending processing.",
    confirmed: "Your order has been confirmed and is being prepared.",
    shipped: "Your order has been shipped and is on its way!",
    delivered: "Your order has been delivered. Enjoy your rental!",
    cancelled: "Your order has been cancelled.",
  };

  const statusColors = {
    pending: "#6b7280",
    confirmed: "#ca8a04",
    shipped: "#2563eb",
    delivered: "#16a34a",
    cancelled: "#dc2626",
  };

  await transporter.sendMail({
    from: fromEmail(),
    to,
    subject: `GadgetEase - Order #${orderId} ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 24px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #1f2937; margin: 0;">Order Update</h1>
        </div>

        <div style="background: white; border-radius: 8px; padding: 24px; text-align: center;">
          <p style="margin: 0 0 8px; color: #6b7280;">Order #${orderId}</p>
          <div style="display: inline-block; background: ${statusColors[newStatus] || "#6b7280"}20; color: ${statusColors[newStatus] || "#6b7280"}; padding: 8px 20px; border-radius: 20px; font-weight: bold; font-size: 16px; margin: 12px 0;">
            ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}
          </div>
          <p style="color: #374151; margin: 16px 0 0;">${statusMessages[newStatus] || "Your order status has been updated."}</p>
          ${newStatus === "delivered" ? '<p style="color: #6b7280; margin: 8px 0 0; font-size: 14px;">You can now request returns from your orders page if needed.</p>' : ""}
        </div>

        <div style="text-align: center; margin-top: 20px;">
          <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/orders" style="display: inline-block; background-color: #1f2937; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            View Order Details
          </a>
        </div>

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
          GadgetEase - Rent gadgets with ease
        </p>
      </div>
    `,
  });
};

module.exports = { sendResetEmail, sendOrderConfirmationEmail, sendOrderStatusEmail };
