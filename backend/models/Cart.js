const mongoose = require('mongoose');

// Cart Schema
const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User model
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // Reference to Product model
        name: { type: String, required: true },
        image: { type: String },
        brand: { type: String },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, default: 1 },
        security: { type: Number, default: 0 }, // Security deposit per unit
        totalPrice: { type: Number, required: true }, // Rental price (price * quantity), excludes security
        duration: { type: String, required: true }, // Rental duration
      },
    ],
    totalAmount: { type: Number, required: true, default: 0 }, // Total amount of all items in cart
  },
  { timestamps: true }
);

// Pre-save hook to calculate the total amount of the cart before saving
cartSchema.pre('save', function (next) {
  this.totalAmount = this.items.reduce((total, item) => {
    return total + item.totalPrice + ((item.security || 0) * item.quantity);
  }, 0);
  next();
});

// Cart Model
const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
