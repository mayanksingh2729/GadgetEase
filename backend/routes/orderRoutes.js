const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const orderController = require("../controllers/orderController");
const { validateCreateOrder } = require("../middleware/validators");

router.post("/", authMiddleware, validateCreateOrder, orderController.createOrder);
router.get("/my-orders", authMiddleware, orderController.getMyOrders);
router.post("/:id/request-return", authMiddleware, orderController.requestReturn);
router.get("/:id/invoice", authMiddleware, orderController.getInvoice);
router.get("/:id", authMiddleware, orderController.getOrderById);

module.exports = router;
