const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const authMiddleware = require("../middleware/authMiddleware");
const { validateAddToCart } = require("../middleware/validators");

router.get("/", authMiddleware, cartController.getCart);
router.post("/add", authMiddleware, validateAddToCart, cartController.addToCart);
router.put("/:productId", authMiddleware, cartController.updateCart);
router.delete("/:productId", authMiddleware, cartController.removeFromCart);
router.delete("/clear", authMiddleware, cartController.clearCart);

module.exports = router;
