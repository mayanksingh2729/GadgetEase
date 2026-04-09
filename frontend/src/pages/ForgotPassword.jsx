import React, { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axiosInstance";
import { showSuccess, showError } from "../components/ToastMessage";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/users/forgot-password", { email });
      setSubmitted(true);
      showSuccess("Reset link sent! Check your email.");
    } catch (err) {
      showError(err.response?.data?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto mt-10 sm:mt-20 p-5 sm:p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4">Check Your Email</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          If an account with that email exists, we've sent a password reset link. Check your inbox and spam folder.
        </p>
        <Link to="/login" className="text-sky-500 font-semibold hover:underline">
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 sm:mt-20 p-5 sm:p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
      <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
        Enter your email address and we'll send you a link to reset your password.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:bg-gray-700 dark:border-gray-600"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold text-lg hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
      <p className="text-center mt-4 text-sm text-gray-500">
        Remember your password?{" "}
        <Link to="/login" className="text-sky-500 font-semibold hover:underline">Login</Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
