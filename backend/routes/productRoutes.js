const express = require('express');
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { validateCreateProduct, validateUpdateProduct } = require('../middleware/validators');
const router = express.Router();

/**
 * @swagger
 * /products/categories:
 *   get:
 *     tags: [Products]
 *     summary: Get all product categories with images
 *     responses:
 *       200: { description: List of categories }
 */
router.get('/categories', productController.getCategories);

/**
 * @swagger
 * /products/search:
 *   get:
 *     tags: [Products]
 *     summary: Search products with full-text search
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Search query
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 12 }
 *     responses:
 *       200: { description: Paginated search results }
 */
router.get('/search', productController.searchProducts);

/**
 * @swagger
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: Get all products (optional category filter and pagination)
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200: { description: List of products }
 *   post:
 *     tags: [Products]
 *     summary: Create a new product (admin only)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Product created }
 */
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', authMiddleware, adminMiddleware, validateCreateProduct, productController.createProduct);
router.put('/:id', authMiddleware, adminMiddleware, validateUpdateProduct, productController.updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, productController.deleteProduct);

module.exports = router;
