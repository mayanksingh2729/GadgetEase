const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId, // MongoDB ObjectId
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  week: { type: Number, required: true },
  month: { type: Number, required: true },
  security: { type: Number, required: true },
  images: { type: [String], required: true }, // Array of image URLs
  description: { type: String, required: true },
});

ProductSchema.index({ name: "text", brand: "text", description: "text", category: "text" });

module.exports = mongoose.model("Product", ProductSchema);
