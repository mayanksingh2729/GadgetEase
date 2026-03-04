const express = require('express');
const productController = require('../controllers/productController');
const router = express.Router();

// Route to get all categories with first product image
router.get('/categories', productController.getCategories);

// Route to get all products
router.get('/', productController.getAllProducts);

// Route to get a product by ID (this uses custom `id` like "mouse-006")
router.get('/:id', productController.getProductById);

// Route to create a new product
router.post('/', productController.createProduct);
    
// Route to update a product by ID (custom string ID)
router.put('/:id', productController.updateProduct);

// Route to delete a product by ID (custom string ID)
router.delete('/:id', productController.deleteProduct);

module.exports = router;
