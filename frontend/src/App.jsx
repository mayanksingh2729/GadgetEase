import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import PageLoader from "./components/PageLoader";
import { useUserContext } from "./context/Usercontext";

// Lazy-loaded pages
const Home = lazy(() => import("./pages/Home"));
const Cart = lazy(() => import("./pages/Cart"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const ProductDetails = lazy(() => import("./pages/ProductDetailPage"));
const Checkout = lazy(() => import("./pages/Checkout"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const Profile = lazy(() => import("./pages/Profile"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const ComparePage = lazy(() => import("./pages/ComparePage"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));

// Non-lazy (always needed)
const CompareBar = lazy(() => import("./components/CompareBar"));

const Layout = ({ children }) => (
  <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
    <Header />
    <div className="mt-20 flex-1">
      <ErrorBoundary>{children}</ErrorBoundary>
    </div>
    <Footer />
  </div>
);

const GuestRoute = ({ children }) => {
  const { user } = useUserContext();
  if (user) return <Navigate to="/" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user } = useUserContext();
  if (!user || user.role !== "admin") return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <ToastContainer />
      <Suspense fallback={null}>
        <CompareBar />
      </Suspense>
      <Suspense fallback={<Layout><PageLoader /></Layout>}>
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/cart" element={<Layout><Cart /></Layout>} />
          <Route path="/login" element={<Layout><GuestRoute><Login /></GuestRoute></Layout>} />
          <Route path="/signup" element={<Layout><GuestRoute><Signup /></GuestRoute></Layout>} />
          <Route path="/category/:category" element={<Layout><CategoryPage /></Layout>} />
          <Route path="/product/:id" element={<Layout><ProductDetails /></Layout>} />
          <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
          <Route path="/payment-success" element={<Layout><PaymentSuccess /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />
          <Route path="/orders" element={<Layout><MyOrders /></Layout>} />
          <Route path="/wishlist" element={<Layout><Wishlist /></Layout>} />
          <Route path="/compare" element={<Layout><ComparePage /></Layout>} />
          <Route path="/forgot-password" element={<Layout><GuestRoute><ForgotPassword /></GuestRoute></Layout>} />
          <Route path="/reset-password/:token" element={<Layout><ResetPassword /></Layout>} />
          <Route path="/admin/*" element={<Layout><AdminRoute><AdminLayout /></AdminRoute></Layout>} />
          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
