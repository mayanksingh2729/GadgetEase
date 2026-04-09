import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useUserContext } from "./Usercontext";
import API from "../api/axiosInstance";

const WishlistContext = createContext();

export const useWishlistContext = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const { user } = useUserContext();
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [wishlistItems, setWishlistItems] = useState([]);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistIds(new Set());
      setWishlistItems([]);
      return;
    }
    try {
      const { data } = await API.get("/wishlist");
      const products = data.products || [];
      setWishlistItems(products);
      setWishlistIds(new Set(products.map((p) => p._id)));
    } catch (err) {
      console.error("Wishlist fetch error:", err);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = useCallback(async (productId) => {
    if (!user) return;
    try {
      await API.post(`/wishlist/${productId}`);
      fetchWishlist();
    } catch (err) {
      console.error("Wishlist toggle error:", err);
    }
  }, [user, fetchWishlist]);

  return (
    <WishlistContext.Provider value={{ wishlistIds, wishlistItems, toggleWishlist, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
