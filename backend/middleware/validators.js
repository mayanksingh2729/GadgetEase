const { body, param, query, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// User validators
const validateRegister = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ min: 2, max: 50 }).withMessage("Name must be 2-50 characters"),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  handleValidationErrors,
];

const validateLogin = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

// Address validator
const validateAddress = [
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("phone").trim().notEmpty().withMessage("Phone is required").isMobilePhone().withMessage("Valid phone number is required"),
  body("addressLine1").trim().notEmpty().withMessage("Address line 1 is required"),
  body("city").trim().notEmpty().withMessage("City is required"),
  body("state").trim().notEmpty().withMessage("State is required"),
  body("pincode").trim().notEmpty().withMessage("Pincode is required"),
  handleValidationErrors,
];

// Product validators
const validateCreateProduct = [
  body("name").trim().notEmpty().withMessage("Product name is required"),
  body("brand").trim().notEmpty().withMessage("Brand is required"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("price").isNumeric().withMessage("Daily price must be a number"),
  body("week").isNumeric().withMessage("Weekly price must be a number"),
  body("month").isNumeric().withMessage("Monthly price must be a number"),
  body("security").isNumeric().withMessage("Security deposit must be a number"),
  body("images").isArray({ min: 1 }).withMessage("At least one image is required"),
  handleValidationErrors,
];

const validateUpdateProduct = [
  body("name").optional().trim().notEmpty().withMessage("Product name cannot be empty"),
  body("brand").optional().trim().notEmpty().withMessage("Brand cannot be empty"),
  body("category").optional().trim().notEmpty().withMessage("Category cannot be empty"),
  body("price").optional().isNumeric().withMessage("Daily price must be a number"),
  body("week").optional().isNumeric().withMessage("Weekly price must be a number"),
  body("month").optional().isNumeric().withMessage("Monthly price must be a number"),
  body("security").optional().isNumeric().withMessage("Security deposit must be a number"),
  handleValidationErrors,
];

// Cart validators
const validateAddToCart = [
  body("productId").notEmpty().withMessage("Product ID is required"),
  body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
  body("duration").isIn(["day", "week", "month"]).withMessage("Duration must be day, week, or month"),
  body("price").isNumeric().withMessage("Price must be a number"),
  handleValidationErrors,
];

// Order validators
const validateCreateOrder = [
  body("shippingAddress.fullName").trim().notEmpty().withMessage("Full name is required"),
  body("shippingAddress.phone").trim().notEmpty().withMessage("Phone is required"),
  body("shippingAddress.addressLine1").trim().notEmpty().withMessage("Address line 1 is required"),
  body("shippingAddress.city").trim().notEmpty().withMessage("City is required"),
  body("shippingAddress.state").trim().notEmpty().withMessage("State is required"),
  body("shippingAddress.pincode").trim().notEmpty().withMessage("Pincode is required"),
  handleValidationErrors,
];

// Payment validators
const validateCreateCheckoutSession = [
  body("shippingAddress.fullName").trim().notEmpty().withMessage("Full name is required"),
  body("shippingAddress.phone").trim().notEmpty().withMessage("Phone is required"),
  body("shippingAddress.addressLine1").trim().notEmpty().withMessage("Address line 1 is required"),
  body("shippingAddress.city").trim().notEmpty().withMessage("City is required"),
  body("shippingAddress.state").trim().notEmpty().withMessage("State is required"),
  body("shippingAddress.pincode").trim().notEmpty().withMessage("Pincode is required"),
  handleValidationErrors,
];

const validateVerifyPayment = [
  body("session_id").notEmpty().withMessage("Session ID is required"),
  handleValidationErrors,
];

// Admin validators
const validateAdminOrderStatus = [
  body("status").isIn(["pending", "confirmed", "shipped", "delivered", "cancelled"]).withMessage("Invalid order status"),
  handleValidationErrors,
];

// Review validators
const validateCreateReview = [
  body("productId").isMongoId().withMessage("Valid product ID is required"),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 100 }).withMessage("Title must be under 100 characters"),
  body("comment").trim().notEmpty().withMessage("Comment is required").isLength({ max: 1000 }).withMessage("Comment must be under 1000 characters"),
  handleValidationErrors,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateAddress,
  validateCreateProduct,
  validateUpdateProduct,
  validateAddToCart,
  validateCreateOrder,
  validateCreateCheckoutSession,
  validateVerifyPayment,
  validateAdminOrderStatus,
  validateCreateReview,
};
