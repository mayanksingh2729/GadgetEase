const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const verifyToken = require("../middleware/verifyToken");

router.get("/", verifyToken, cartController.getCart);
router.post("/add", verifyToken, cartController.addToCart);
router.put("/:productId", verifyToken, cartController.updateCart);
router.delete("/:productId", verifyToken, cartController.removeFromCart);
router.delete("/clear", verifyToken, cartController.clearCart);

module.exports = router;
