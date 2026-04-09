const Wishlist = require("../models/Wishlist");

exports.getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.userId }).populate("products");
    if (!wishlist) {
      wishlist = { products: [] };
    }
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

exports.toggleWishlistItem = async (req, res) => {
  try {
    const { productId } = req.params;
    let wishlist = await Wishlist.findOne({ userId: req.userId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.userId, products: [productId] });
      await wishlist.save();
      return res.json({ message: "Added to wishlist", added: true, wishlist });
    }

    const index = wishlist.products.findIndex((p) => p.toString() === productId);
    if (index > -1) {
      wishlist.products.splice(index, 1);
      await wishlist.save();
      return res.json({ message: "Removed from wishlist", added: false, wishlist });
    } else {
      wishlist.products.push(productId);
      await wishlist.save();
      return res.json({ message: "Added to wishlist", added: true, wishlist });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const wishlist = await Wishlist.findOneAndUpdate(
      { userId: req.userId },
      { $pull: { products: productId } },
      { new: true }
    ).populate("products");

    res.json({ message: "Removed from wishlist", wishlist });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};
