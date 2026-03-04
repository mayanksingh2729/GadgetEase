const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const paymentController = require("../controllers/paymentController");

router.post("/create-checkout-session", authMiddleware, paymentController.createCheckoutSession);
router.post("/verify-payment", authMiddleware, paymentController.verifyPayment);

module.exports = router;
