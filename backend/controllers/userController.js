// backend/controllers/userController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

const handleErrorResponse = (res, message, statusCode = 500) => {
  console.error(message);
  res.status(statusCode).json({ message });
};

// Register a user
exports.registerUser = async (req, res) => {
  const { name, email, password, avatarUrl } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  try {
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      avatarUrl: avatarUrl || "https://via.placeholder.com/150/0000FF/FFFFFF?text=Avatar",
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    handleErrorResponse(res, "Error registering user", 500);
  }
};

// Login a user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl || "https://via.placeholder.com/150",
      },
    });
  } catch (error) {
    handleErrorResponse(res, "Error logging in", 500);
  }
};

// Get current user details (protected)
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl || "https://via.placeholder.com/150",
      addresses: user.addresses || [],
    });
  } catch (error) {
    handleErrorResponse(res, "Error fetching user details", 500);
  }
};

// Update user details
exports.updateUser = async (req, res) => {
  const { name, email } = req.body;

  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    user.email = email || user.email;

    await user.save();

    res.json({
      message: "User updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        addresses: user.addresses || [],
      },
    });
  } catch (error) {
    handleErrorResponse(res, "Error updating user", 500);
  }
};

// Add address
exports.addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { fullName, phone, addressLine1, addressLine2, city, state, pincode } = req.body;
    if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
      return res.status(400).json({ message: "All required address fields must be provided" });
    }

    user.addresses.push({ fullName, phone, addressLine1, addressLine2: addressLine2 || "", city, state, pincode });
    await user.save();

    res.json({ message: "Address added", addresses: user.addresses });
  } catch (error) {
    handleErrorResponse(res, "Error adding address", 500);
  }
};

// Delete address
exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.addressId);
    await user.save();

    res.json({ message: "Address deleted", addresses: user.addresses });
  } catch (error) {
    handleErrorResponse(res, "Error deleting address", 500);
  }
};

// Get addresses
exports.getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("addresses");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.addresses || []);
  } catch (error) {
    handleErrorResponse(res, "Error fetching addresses", 500);
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.userId);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    handleErrorResponse(res, "Error deleting user", 500);
  }
};
