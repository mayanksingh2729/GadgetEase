const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const paymentController = require("../controllers/paymentController");
const { validateCreateCheckoutSession, validateVerifyPayment } = require("../middleware/validators");

router.post("/create-checkout-session", authMiddleware, validateCreateCheckoutSession, paymentController.createCheckoutSession);
router.post("/verify-payment", authMiddleware, validateVerifyPayment, paymentController.verifyPayment);

module.exports = router;
