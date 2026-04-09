import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUserContext } from "../context/Usercontext";
import { useSearchContext } from "../context/SearchContext";
import { BsCart4 } from "react-icons/bs";
import { AiOutlineHeart } from "react-icons/ai";
import { HiOutlineMenu, HiX } from "react-icons/hi";
import { useWishlistContext } from "../context/WishlistContext";
import { useThemeContext } from "../context/ThemeContext";
import { BsSun, BsMoon } from "react-icons/bs";
import API from "../api/axiosInstance";

const Header = () => {
  const { user, logout } = useUserContext();
  const { performSearch, clearSearch } = useSearchContext();
  const { wishlistIds } = useWishlistContext();
  const { darkMode, toggleTheme } = useThemeContext();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [window.location.pathname]);

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
    const handler = () => fetchCartCount();
    window.addEventListener("cart-updated", handler);
    return () => window.removeEventListener("cart-updated", handler);
  }, [user]);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchInput(query);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      if (query.trim()) {
        navigate("/");
        performSearch(query);
      } else {
        clearSearch();
      }
    }, 300);
  };

  const handleSearchClick = () => {
    if (searchInput.trim()) {
      navigate("/");
      performSearch(searchInput);
      setMobileMenuOpen(false);
    }
  };

  const goToHome = () => {
    setSearchInput("");
    clearSearch();
    navigate("/");
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  const navTo = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
    setDropdownVisible(false);
  };

  return (
    <>
      <header className="bg-gray-600 dark:bg-gray-800 p-3 flex items-center justify-between w-full fixed top-0 left-0 z-50 shadow-xl">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer shrink-0" onClick={goToHome}>
          <img src="/Logo.jpg" alt="GadgetEase Logo" className="h-10 md:h-13 rounded-full object-contain" />
          <h1 className="text-white text-lg md:text-xl font-bold hidden sm:block">
            <span className="text-gray-400 text-4xl">G</span><span className="text-2xl">adget</span>
            <span className="text-gray-400 text-4xl">E</span><span className="text-2xl">ase</span>
          </h1>
        </Link>

        {/* Search Bar — hidden on mobile, shown on md+ */}
        <div className="hidden md:flex items-center w-[45%] max-w-[450px]">
          <input
            type="text"
            placeholder="Search for gadgets..."
            className="w-full h-10 p-2 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-l-lg border border-gray-300 dark:border-gray-600 focus:outline-none"
            value={searchInput}
            onChange={handleSearchChange}
          />
          <button
            className="h-10 bg-gray-500 px-3 py-2 rounded-r-lg text-sky-500 font-semibold hover:bg-black"
            onClick={handleSearchClick}
          >
            <img width="24" height="24" src="https://img.icons8.com/fluency/24/search.png" alt="search" />
          </button>
        </div>

        {/* Desktop Actions — hidden on mobile */}
        <div className="hidden md:flex items-center mr-4 gap-4">
          <button
            onClick={toggleTheme}
            className="text-white text-xl hover:text-yellow-400 transition p-1"
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <BsSun /> : <BsMoon />}
          </button>
          {user ? (
            <div className="flex items-center gap-6">
              <Link to="/wishlist" className="relative text-white text-3xl hover:text-red-400 transition">
                <AiOutlineHeart />
                {wishlistIds.size > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {wishlistIds.size}
                  </span>
                )}
              </Link>

              <Link to="/cart" className="relative text-white text-3xl hover:text-sky-400 transition">
                <BsCart4 />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-sky-400 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>

              <div className="relative flex items-center gap-4" ref={dropdownRef}>
                <button className="w-10 h-10 bg-white rounded-full cursor-pointer" onClick={() => setDropdownVisible(!dropdownVisible)}>
                  <img
                    src={user.avatarUrl || "https://via.placeholder.com/150/0000FF/FFFFFF?text=Avatar"}
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150/0000FF/FFFFFF?text=Avatar"; }}
                  />
                </button>

                {dropdownVisible && (
                  <div className="absolute right-0 top-12 bg-white dark:bg-gray-800 text-black dark:text-gray-100 shadow-lg rounded-md w-36 z-50 overflow-hidden">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                      <p className="text-sm font-semibold truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                    <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm" onClick={() => setDropdownVisible(false)}>Profile</Link>
                    <Link to="/orders" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm" onClick={() => setDropdownVisible(false)}>My Orders</Link>
                    {user.role === "admin" && (
                      <Link to="/admin" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-purple-600 dark:text-purple-400 font-medium" onClick={() => setDropdownVisible(false)}>Admin Panel</Link>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="text-white text-lg font-semibold hover:text-sky-500 hover:bg-black rounded-lg px-3 py-1 cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button className="text-white text-lg font-semibold hover:text-sky-500 hover:bg-black rounded-lg px-3 py-1 cursor-pointer" onClick={() => navigate("/login")}>Login</button>
              <button className="bg-white text-sky-500 text-lg px-3 py-1 rounded-lg font-semibold hover:bg-black cursor-pointer" onClick={() => navigate("/signup")}>Sign Up</button>
            </div>
          )}
        </div>

        {/* Mobile: icons + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <button onClick={toggleTheme} className="text-white text-lg hover:text-yellow-400 transition">
            {darkMode ? <BsSun /> : <BsMoon />}
          </button>
          {user && (
            <>
              <Link to="/wishlist" className="relative text-white text-2xl">
                <AiOutlineHeart />
                {wishlistIds.size > 0 && <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">{wishlistIds.size}</span>}
              </Link>
              <Link to="/cart" className="relative text-white text-2xl">
                <BsCart4 />
                {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-sky-400 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">{cartCount}</span>}
              </Link>
            </>
          )}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white text-2xl p-1">
            {mobileMenuOpen ? <HiX /> : <HiOutlineMenu />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-white dark:bg-gray-900 overflow-y-auto md:hidden">
          {/* Mobile Search */}
          <div className="p-4 border-b dark:border-gray-700">
            <div className="flex">
              <input
                type="text"
                placeholder="Search for gadgets..."
                className="w-full h-10 p-2 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 rounded-l-lg border border-gray-300 dark:border-gray-600 focus:outline-none"
                value={searchInput}
                onChange={handleSearchChange}
              />
              <button className="h-10 bg-gray-500 px-3 py-2 rounded-r-lg" onClick={handleSearchClick}>
                <img width="20" height="20" src="https://img.icons8.com/fluency/24/search.png" alt="search" />
              </button>
            </div>
          </div>

          {/* Mobile Nav Links */}
          <nav className="p-4">
            {user ? (
              <div className="space-y-1">
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-3">
                  <img src={user.avatarUrl || "https://via.placeholder.com/40"} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                </div>
                <button onClick={() => navTo("/profile")} className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium">Profile</button>
                <button onClick={() => navTo("/orders")} className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium">My Orders</button>
                <button onClick={() => navTo("/wishlist")} className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium">Wishlist</button>
                <button onClick={() => navTo("/cart")} className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium">Cart {cartCount > 0 && `(${cartCount})`}</button>
                {user.role === "admin" && (
                  <button onClick={() => navTo("/admin")} className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium text-purple-600 dark:text-purple-400">Admin Panel</button>
                )}
                <hr className="my-2 dark:border-gray-700" />
                <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium text-red-600">Logout</button>
              </div>
            ) : (
              <div className="space-y-3">
                <button onClick={() => navTo("/login")} className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold">Login</button>
                <button onClick={() => navTo("/signup")} className="w-full border-2 border-gray-900 dark:border-gray-400 text-gray-900 dark:text-gray-100 py-3 rounded-lg font-semibold">Sign Up</button>
              </div>
            )}
          </nav>
        </div>
      )}
    </>
  );
};

export default Header;
