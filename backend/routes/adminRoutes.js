const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const adminController = require("../controllers/adminController");
const productController = require("../controllers/productController");

// All routes require auth + admin
router.use(authMiddleware, adminMiddleware);

// Dashboard
router.get("/stats", adminController.getDashboardStats);

// Users
router.get("/users", adminController.getAllUsers);
router.delete("/users/:id", adminController.deleteUser);

// Orders
router.get("/orders", adminController.getAllOrders);
const { validateAdminOrderStatus } = require("../middleware/validators");
router.put("/orders/:id/status", validateAdminOrderStatus, adminController.updateOrderStatus);
router.put("/orders/:id/process-return", adminController.processReturn);

// Products (admin CRUD)
router.get("/products", adminController.getAllProducts);
router.post("/products", productController.createProduct);
router.put("/products/:id", productController.updateProduct);
router.delete("/products/:id", productController.deleteProduct);

module.exports = router;
