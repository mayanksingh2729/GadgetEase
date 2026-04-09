import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <h1 className="text-6xl sm:text-9xl font-bold text-gray-200 dark:text-gray-700">404</h1>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mt-4">Page Not Found</h2>
      <p className="text-gray-500 dark:text-gray-400 mt-2 text-center max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <button
        onClick={() => navigate("/")}
        className="mt-6 bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition"
      >
        Go Back Home
      </button>
    </div>
  );
};

export default NotFound;
