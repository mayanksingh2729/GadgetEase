import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import animateDrone from "../assets/drone.json";
import API from "../api/axiosInstance";
import { showSuccess, showError } from "../components/ToastMessage";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    const fetchCart = async () => {
      try {
        const { data } = await API.get("/cart");
        setCartItems(data.items || []);
      } catch (err) {
        showError("Failed to load cart");
      }
    };

    fetchCart();
  }, [token]);

  const updateCart = async (productId, duration, delta) => {
    const item = cartItems.find(
      (i) =>
        (i.productId._id || i.productId) === productId &&
        i.duration === duration
    );
    if (!item) return;

    try {
      const { data } = await API.post("/cart/add", {
        productId,
        quantity: delta,
        duration,
        name: item.name,
        image: item.image,
        brand: item.brand,
        price: item.price,
        security: item.security || 0,
      });

      setCartItems(data.items || []);
      window.dispatchEvent(new Event("cart-updated"));
    } catch (err) {
      showError("Failed to update quantity");
    }
  };

  const handleRemove = async (productId, duration) => {
    try {
      const { data } = await API.delete(`/cart/${productId}`, {
        data: { duration },
      });

      setCartItems(data.items || []);
      window.dispatchEvent(new Event("cart-updated"));
    } catch (err) {
      showError("Failed to remove item");
    }
  };

  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const rentalTotal = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity, 0
  );
  const securityTotal = cartItems.reduce(
    (sum, item) => sum + ((item.security || 0) * item.quantity), 0
  );
  const subtotal = rentalTotal + securityTotal;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Drone Animation */}
      <div className="w-full flex justify-center">
        <Lottie
          className="w-full max-w-xs"
          animationData={animateDrone}
          loop
          autoplay
        />
      </div>

      {/* Cart Section */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left - Cart Items */}
        <div className="md:w-2/3 bg-white p-6 shadow-lg rounded-xl">
          <h2 className="text-2xl font-bold mb-4">Your Cart</h2>

          {cartItems.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 text-lg mb-4">Your cart is empty.</p>
              <button onClick={() => navigate("/")}
                className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition">
                Browse Products
              </button>
            </div>
          ) : (
            cartItems.map((item) => {
              const prodId = item.productId._id || item.productId;
              return (
                <div
                  key={`${prodId}-${item.duration}`}
                  className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gray-50 rounded-lg transition"
                >
                  {/* Image */}
                  <div className="w-20 h-20 flex-shrink-0">
                    <img
                      src={item.image || "https://via.placeholder.com/80"}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 px-4">
                    <h3 className="text-lg font-bold">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.brand} | {item.duration}</p>
                    <p className="text-sm text-gray-600">
                      Rental: &#8377;{item.price} x {item.quantity} = &#8377;{item.price * item.quantity}
                    </p>
                    {(item.security || 0) > 0 && (
                      <p className="text-sm text-sky-600 font-medium">
                        Security Deposit: &#8377;{item.security} x {item.quantity} = &#8377;{item.security * item.quantity}
                      </p>
                    )}
                    <p className="text-sm font-bold text-gray-800 mt-1">
                      Item Total: &#8377;{item.price * item.quantity + (item.security || 0) * item.quantity}
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateCart(prodId, item.duration, -1)}
                      className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-lg font-bold transition"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateCart(prodId, item.duration, 1)}
                      className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-lg font-bold transition"
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleRemove(prodId, item.duration)}
                      className="text-red-500 hover:text-red-700 ml-2 font-bold text-lg transition"
                    >
                      &#10005;
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right - Summary */}
        {cartItems.length > 0 && (
          <div className="md:w-1/3">
            <div className="bg-white p-6 shadow-lg rounded-xl sticky top-24">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Items</span>
                  <span>{totalQuantity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rental Amount</span>
                  <span>&#8377;{rentalTotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Security Deposit</span>
                  <span className="text-sky-600">&#8377;{securityTotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery</span>
                  <span className="text-sky-500 font-medium">Free</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-sky-500">&#8377;{subtotal}</span>
                </div>
              </div>
              <button
                onClick={() => navigate("/checkout")}
                className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-blue-700 transition active:scale-[0.98]"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
