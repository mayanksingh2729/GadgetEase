import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../api/axiosInstance";
import { showSuccess, showError } from "../components/ToastMessage";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");
  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setStatus("failed");
      showError("Invalid payment session");
      return;
    }

    const verifyPayment = async () => {
      try {
        await API.post("/payment/verify-payment", {
          session_id: sessionId,
        });

        setStatus("success");
        showSuccess("Payment successful! Your order has been placed.");
        window.dispatchEvent(new Event("cart-updated"));
      } catch (err) {
        setStatus("failed");
        showError(err.response?.data?.message || "Payment verification failed");
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="max-w-lg mx-auto px-4 py-8 sm:py-16 text-center">
      {status === "verifying" && (
        <div>
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Verifying Payment...</h1>
          <p className="text-gray-500 dark:text-gray-400">Please wait while we confirm your payment.</p>
        </div>
      )}

      {status === "success" && (
        <div>
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">Payment Successful!</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Your order has been placed and confirmed. You can track it in your orders.</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button onClick={() => navigate("/orders")}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition">
              View My Orders
            </button>
            <button onClick={() => navigate("/")}
              className="w-full sm:w-auto bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl font-bold transition">
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      {status === "failed" && (
        <div>
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">Payment Failed</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Something went wrong with your payment. Please try again.</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button onClick={() => navigate("/checkout")}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition">
              Try Again
            </button>
            <button onClick={() => navigate("/")}
              className="w-full sm:w-auto bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl font-bold transition">
              Go Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccess;
