import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axiosInstance";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  // Save cart to localStorage whenever it updates
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart]);

  // Fetch cart items for a user
  const getCart = async (userId) => {
    try {
      const { data } = await API.get(`/cart/${userId}`);
      setCart(data.items);
      localStorage.setItem("cart", JSON.stringify(data.items));
    } catch (error) {
      console.error("❌ Error fetching cart:", error.response?.data || error.message);
    }
  };

  // Add item to cart
  const addToCart = async (userId, product, duration = "week") => {
    try {
      const { data } = await API.post("/cart/add", {
        userId,
        productId: product.id,
        quantity: 1,
        duration,
        price: product.price,
      });
      setCart(data.items);
      localStorage.setItem("cart", JSON.stringify(data.items));
    } catch (error) {
      console.error("❌ Error adding to cart:", error.response?.data || error.message);
    }
  };

  // Update quantity of a product in cart
  const updateCart = async (userId, productId, quantity) => {
    try {
      const { data } = await API.put(`/cart/update/${userId}/${productId}`, { quantity });
      setCart(data.items);
      localStorage.setItem("cart", JSON.stringify(data.items));
    } catch (error) {
      console.error("❌ Error updating cart:", error.response?.data || error.message);
    }
  };

  // Remove item from cart
  const removeFromCart = async (userId, productId) => {
    try {
      const { data } = await API.delete(`/cart/remove/${userId}/${productId}`);
      setCart(data.items);
      localStorage.setItem("cart", JSON.stringify(data.items));
    } catch (error) {
      console.error("❌ Error removing from cart:", error.response?.data || error.message);
    }
  };

  // Clear the entire cart
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  return (
    <CartContext.Provider value={{ cart, getCart, addToCart, updateCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the CartContext
export const useCartContext = () => useContext(CartContext);
