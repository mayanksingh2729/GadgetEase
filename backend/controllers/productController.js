const Product = require('../models/Product');
// const asyncHandler = require("express-async-handler");

// Get all products (with optional pagination and category filter)
exports.getAllProducts = async (req, res) => {
  try {
    let { category, page, limit } = req.query;
    let query = {};

    if (category) {
      category = category.trim();
      query.category = { $regex: `^${category}$`, $options: "i" };
    }

    // If page is provided, use pagination
    if (page) {
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 12;
      const skip = (pageNum - 1) * limitNum;

      const [products, total] = await Promise.all([
        Product.find(query).skip(skip).limit(limitNum),
        Product.countDocuments(query),
      ]);

      return res.json({
        products,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      });
    }

    // No pagination - return all (backward compatible)
    const products = await Product.find(query);
    if (products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// ✅ FIXED: Get a product by its **custom string ID**
exports.getProductById = (req, res) => {
  const productId = req.params.id;

  Product.findOne({ id: productId }) // <-- use custom field instead of _id
    .then(product => {
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    })
    .catch(err => {
      res.status(500).json({ message: 'Server error', error: err });
    });
};

// Get all categories with first product image
exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: "$category",
          image: { $first: { $arrayElemAt: ["$images", 0] } },
        },
      },
      { $project: { _id: 0, name: "$_id", image: 1 } },
      { $sort: { name: 1 } },
    ]);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Search products with pagination
exports.searchProducts = async (req, res) => {
  try {
    const { q, page = 1, limit = 12 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query = {};
    let sort = {};

    if (q && q.trim()) {
      query = { $text: { $search: q.trim() } };
      sort = { score: { $meta: "textScore" } };
    }

    const [products, total] = await Promise.all([
      Product.find(query, q ? { score: { $meta: "textScore" } } : {})
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(query),
    ]);

    res.json({
      products,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Create a new product
exports.createProduct = (req, res) => {
  const { id, name, brand, description, price, week, month, security, category, images } = req.body;

  const newProduct = new Product({
    _id: new (require('mongoose').Types.ObjectId)(),
    id: id || name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
    name,
    brand,
    description,
    price,
    week: week || price,
    month: month || price,
    security: security || 0,
    category,
    images: images || [],
  });

  newProduct
    .save()
    .then(product => res.status(201).json(product))
    .catch(err => {
      res.status(500).json({ message: 'Server error', error: err });
    });
};

// Update an existing product
exports.updateProduct = (req, res) => {
  const productId = req.params.id;
  const { name, brand, description, price, week, month, security, category, images } = req.body;

  Product.findOneAndUpdate(
    { id: productId },
    { name, brand, description, price, week, month, security, category, images },
    { new: true }
  )
    .then(updatedProduct => {
      if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(updatedProduct);
    })
    .catch(err => {
      res.status(500).json({ message: 'Server error', error: err });
    });
};

// Delete a product
exports.deleteProduct = (req, res) => {
  const productId = req.params.id;

  Product.findOneAndDelete({ id: productId }) // 🔄 Also changed to use custom `id`
    .then(deletedProduct => {
      if (!deletedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json({ message: 'Product deleted successfully' });
    })
    .catch(err => {
      res.status(500).json({ message: 'Server error', error: err });
    });
};
