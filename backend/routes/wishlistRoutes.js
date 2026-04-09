const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const wishlistController = require("../controllers/wishlistController");

router.get("/", authMiddleware, wishlistController.getWishlist);
router.post("/:productId", authMiddleware, wishlistController.toggleWishlistItem);
router.delete("/:productId", authMiddleware, wishlistController.removeFromWishlist);

module.exports = router;
