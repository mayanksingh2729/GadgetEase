import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUserContext } from "../context/Usercontext";
import { BsCart4 } from "react-icons/bs";
import API from "../api/axiosInstance";

const Header = ({ onSearch }) => {
  const { user, logout } = useUserContext();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch cart count
  useEffect(() => {
    if (!user) { setCartCount(0); return; }
    const token = user.token || localStorage.getItem("token");
    if (!token) return;

    const fetchCartCount = async () => {
      try {
        const { data } = await API.get("/cart");
        const total = (data.items || []).reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(total);
      } catch (err) {
        console.error("Cart count error:", err);
      }
    };

    fetchCartCount();
    // Listen for cart updates
    const handler = () => fetchCartCount();
    window.addEventListener("cart-updated", handler);
    return () => window.removeEventListener("cart-updated", handler);
  }, [user]);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) onSearch(query.toLowerCase());
  };

  const handleSearchClick = () => {
    if (onSearch) {
      onSearch(searchQuery.toLowerCase());
    } else {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const goToHome = () => {
    setSearchQuery("");
    if (onSearch) onSearch("");
    navigate("/");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-gray-600 p-3 flex items-center justify-between w-full fixed top-0 left-0 z-50 shadow-xl">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 cursor-pointer" onClick={goToHome}>
        <img src="/Logo.jpg" alt="GadgetEase Logo" className="h-13 rounded-full object-contain" />
        <h1 className="text-white text-lg md:text-xl font-bold">
          <span className="text-gray-400 text-4xl">G</span><span className="text-2xl">adget</span>
          <span className="text-gray-400 text-4xl">E</span><span className="text-2xl">ase</span>
        </h1>
      </Link>

      {/* Search Bar */}
      <div className="flex items-center w-[45%] max-w-[450px]">
        <input
          type="text"
          placeholder="Search for gadgets..."
          className="w-full h-10 p-2 bg-white rounded-l-lg border border-gray-300 focus:outline-none"
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <button
          className="h-10 bg-gray-500 px-3 py-2 rounded-r-lg text-sky-500 font-semibold hover:bg-black"
          onClick={handleSearchClick}
        >
          <img width="24" height="24" src="https://img.icons8.com/fluency/24/search.png" alt="search" />
        </button>
      </div>

      {/* User Actions */}
      <div className="flex items-center mr-4 gap-4">
        {user ? (
          <div className="flex items-center gap-6">
            {/* Cart Icon */}
            <Link to="/cart" className="relative text-white text-3xl hover:text-sky-400 transition">
              <BsCart4 />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-sky-400 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Avatar & Dropdown */}
            <div className="relative flex items-center gap-4" ref={dropdownRef}>
              <button className="w-10 h-10 bg-white rounded-full cursor-pointer" onClick={() => setDropdownVisible(!dropdownVisible)}>
                <img
                  src={user.avatarUrl || "https://via.placeholder.com/150/0000FF/FFFFFF?text=Avatar"}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/150/0000FF/FFFFFF?text=Avatar";
                  }}
                />
              </button>

              {dropdownVisible && (
                <div className="absolute right-0 top-12 bg-white text-black shadow-lg rounded-md w-36 z-50 overflow-hidden">
                  <div className="px-4 py-2 border-b bg-gray-50">
                    <p className="text-sm font-semibold truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100 text-sm" onClick={() => setDropdownVisible(false)}>Profile</Link>
                  <Link to="/orders" className="block px-4 py-2 hover:bg-gray-100 text-sm" onClick={() => setDropdownVisible(false)}>My Orders</Link>
                  {user.role === "admin" && (
                    <Link to="/admin" className="block px-4 py-2 hover:bg-gray-100 text-sm text-purple-600 font-medium" onClick={() => setDropdownVisible(false)}>Admin Panel</Link>
                  )}
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="text-white text-lg font-semibold hover:text-sky-500 hover:bg-black rounded-lg px-3 py-1 cursor-pointer"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              className="text-white text-lg font-semibold hover:text-sky-500 hover:bg-black rounded-lg px-3 py-1 cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
            <button
              className="bg-white text-sky-500 text-lg px-3 py-1 rounded-lg font-semibold hover:bg-black cursor-pointer"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
