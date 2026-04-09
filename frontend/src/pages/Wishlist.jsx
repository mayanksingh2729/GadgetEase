import React from "react";
import { useNavigate } from "react-router-dom";
import { useWishlistContext } from "../context/WishlistContext";
import { useUserContext } from "../context/Usercontext";
import { AiFillHeart } from "react-icons/ai";

const Wishlist = () => {
  const { wishlistItems, toggleWishlist } = useWishlistContext();
  const { user } = useUserContext();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-lg">Please log in to view your wishlist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>

      {wishlistItems.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-10 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg">Your wishlist is empty.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 bg-gray-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistItems.map((product) => (
            <div
              key={product._id}
              className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden relative transform transition-transform duration-300 hover:scale-105"
            >
              <button
                onClick={() => toggleWishlist(product._id)}
                className="absolute top-2 right-2 z-10 text-red-500 text-2xl hover:scale-110 transition-transform"
              >
                <AiFillHeart />
              </button>
              <div
                className="h-40 flex items-center justify-center p-2 cursor-pointer"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <img
                  src={product.images?.[0] || "https://via.placeholder.com/150"}
                  alt={product.name}
                  className="max-h-full object-contain"
                />
              </div>
              <div className="p-3">
                <h3 className="text-md font-semibold">{product.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{product.brand}</p>
                <p className="text-green-600 font-bold">₹{product.price}/day</p>
                <button
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="w-full mt-2 bg-gray-900 text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition"
                >
                  View Product
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
