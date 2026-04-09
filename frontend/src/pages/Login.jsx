import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserContext } from "../context/Usercontext";
import API from "../api/axiosInstance";
import { showSuccess, showError } from "../components/ToastMessage";

const Login = () => {
  const { login } = useUserContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await API.post("/users/login", { email, password });
      const token = response.data.token;

      const userResponse = await API.get("/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = userResponse.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      login({
        ...userData,
        token,
        avatarUrl:
          userData.avatarUrl || "https://via.placeholder.com/150/0000FF/FFFFFF?text=Avatar",
      });

      showSuccess("Login successful!");
      navigate("/", { replace: true });
    } catch (error) {
      const errMsg = error.response?.data?.message || "Failed to connect to the server.";
      showError(errMsg);
      setMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-10">
      <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-lg px-4 sm:px-6 pt-5 pb-4 w-full max-w-sm mx-auto animate-fadeIn">
        <h2 className="text-center text-2xl font-bold text-gray-700 dark:text-gray-100">Welcome Back, Shopper!</h2>
        <p className="text-center text-lg text-gray-500 dark:text-gray-400 mt-1">Login to access your cart and orders</p>
        <hr className="my-4 border-gray-300 dark:border-gray-600" />
        <form onSubmit={handleSubmit}>
          <InputField label="Email" type="email" value={email} onChange={setEmail} />
          <InputField
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={setPassword}
            endAdornment={
              <img
                src={
                  showPassword
                    ? "https://img.icons8.com/ios-glyphs/30/visible--v1.png"
                    : "https://img.icons8.com/ios-glyphs/30/invisible.png"
                }
                alt="Toggle Password"
                className="absolute right-3 top-9 w-6 h-6 cursor-pointer"
                onClick={() => setShowPassword((prev) => !prev)}
              />
            }
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-black hover:text-sky-400 cursor-pointer transition"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        {message && <p className="text-center mt-3 font-semibold text-red-500 animate-message">{message}</p>}
        <p className="text-center mt-3">
          <Link to="/forgot-password" className="text-gray-500 text-sm hover:underline">
            Forgot Password?
          </Link>
        </p>
        <p className="text-center text-gray-500 mt-3">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-500 font-semibold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }
        @keyframes messageFade {
          0% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-message { animation: messageFade 1s ease-in-out; }
      `}</style>
    </div>
  );
};

const InputField = ({ label, type, value, onChange, endAdornment }) => (
  <div className="mb-4 relative">
    <label className="block text-gray-600 dark:text-gray-300 font-semibold">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-400"
      required
    />
    {endAdornment}
  </div>
);

export default Login;
