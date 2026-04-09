const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const reviewController = require("../controllers/reviewController");
const { validateCreateReview } = require("../middleware/validators");

router.get("/:productId", reviewController.getProductReviews);
router.post("/", authMiddleware, validateCreateReview, reviewController.createReview);
router.delete("/:id", authMiddleware, reviewController.deleteReview);

module.exports = router;
