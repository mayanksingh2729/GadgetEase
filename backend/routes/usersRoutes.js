// backend/routes/usersRoutes.js
const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserDetails,
  updateUser,
  deleteUser,
  addAddress,
  deleteAddress,
  getAddresses,
  forgotPassword,
  resetPassword,
  changePassword,
} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const { validateRegister, validateLogin, validateAddress } = require("../middleware/validators");
const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: "Too many login attempts, please try again later." },
});

/**
 * @swagger
 * /users/register:
 *   post:
 *     tags: [Users]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               avatarUrl: { type: string }
 *     responses:
 *       201: { description: User registered }
 *       400: { description: Validation error }
 */
router.post("/register", validateRegister, registerUser);

/**
 * @swagger
 * /users/login:
 *   post:
 *     tags: [Users]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful, returns JWT token }
 *       401: { description: Invalid credentials }
 */
router.post("/login", loginLimiter, validateLogin, loginUser);

/**
 * @swagger
 * /users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get current user details
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: User details }
 */
router.get("/me", authMiddleware, getUserDetails);

/** @swagger
 * /users/update:
 *   put:
 *     tags: [Users]
 *     summary: Update user profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: User updated }
 */
router.put("/update", authMiddleware, updateUser);
router.put("/change-password", authMiddleware, changePassword);
router.delete("/delete", authMiddleware, deleteUser);

/**
 * @swagger
 * /users/addresses:
 *   get:
 *     tags: [Users]
 *     summary: Get user addresses
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of addresses }
 *   post:
 *     tags: [Users]
 *     summary: Add a new address
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Address added }
 */
router.get("/addresses", authMiddleware, getAddresses);
router.post("/addresses", authMiddleware, validateAddress, addAddress);
router.delete("/addresses/:addressId", authMiddleware, deleteAddress);

// Password reset routes
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
