import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CategoryPage from "./pages/CategoryPage";
import ProductDetails from "./pages/ProductDetailPage";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import Profile from "./pages/Profile";
import MyOrders from "./pages/MyOrders";
import AdminLayout from "./pages/admin/AdminLayout";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { useUserContext } from "./context/Usercontext";

// Layout component with search support for Home
const Layout = ({ children, onSearch }) => (
  <div className="flex flex-col min-h-screen">
    <Header onSearch={onSearch} />
    <div className="mt-20 flex-1">{children}</div>
    <Footer />
  </div>
);

// Redirect logged-in users away from login/signup
const GuestRoute = ({ children }) => {
  const { user } = useUserContext();
  if (user) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Admin route guard
const AdminRoute = ({ children }) => {
  const { user } = useUserContext();
  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const [homeSearch, setHomeSearch] = useState("");

  return (
    <Router>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Layout onSearch={setHomeSearch}><Home searchQuery={homeSearch} /></Layout>} />
        <Route path="/cart" element={<Layout><Cart /></Layout>} />
        <Route path="/login" element={<Layout><GuestRoute><Login /></GuestRoute></Layout>} />
        <Route path="/signup" element={<Layout><GuestRoute><Signup /></GuestRoute></Layout>} />
        <Route path="/category/:category" element={<Layout><CategoryPage /></Layout>} />
        <Route path="/product/:id" element={<Layout><ProductDetails /></Layout>} />
        <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
        <Route path="/payment-success" element={<Layout><PaymentSuccess /></Layout>} />
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
        <Route path="/orders" element={<Layout><MyOrders /></Layout>} />

        {/* Admin Routes - single layout with sidebar */}
        <Route path="/admin/*" element={<Layout><AdminRoute><AdminLayout /></AdminRoute></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
