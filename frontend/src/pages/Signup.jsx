import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserContext } from "../context/Usercontext";
import API from "../api/axiosInstance";
import { showSuccess, showError, showWarning } from "../components/ToastMessage";

const eyeOpen = "https://img.icons8.com/ios-glyphs/30/visible--v1.png";
const eyeClosed = "https://img.icons8.com/ios-glyphs/30/invisible.png";
const avatars = [
  "https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001877.png",
  "https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-174669.jpg",
  "https://t3.ftcdn.net/jpg/06/44/10/28/240_F_644102814_9melFkKZhe21FtnQsjh9gDMfuyyyoJh0.jpg",
  "https://t3.ftcdn.net/jpg/05/95/23/12/240_F_595231295_JIHtvsf4sW1WFMo7oRJQK5P5UmHAxWGs.jpg",
  "https://t4.ftcdn.net/jpg/06/43/68/65/360_F_643686558_Efl6HB1ITw98bx1PdAd1wy56QpUTMh47.jpg",
  "https://t3.ftcdn.net/jpg/13/06/65/14/240_F_1306651408_vfJVCLPZg6QT3sy9JSHHSnYodUJOjmB9.jpg",
];

const Signup = () => {
  const { login } = useUserContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    image: avatars[0],
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);

  const handleAvatarSelect = (avatar) => {
    setFormData({ ...formData, image: avatar });
    setShowAvatarOptions(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      showWarning("Passwords do not match!");
      setMessage("Passwords do not match!");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Register
      await API.post("/users/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        avatarUrl: formData.image,
      });

      // Auto-login after registration
      const loginRes = await API.post("/users/login", {
        email: formData.email,
        password: formData.password,
      });

      const token = loginRes.data.token;

      const userRes = await API.get("/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = userRes.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      login({
        ...userData,
        token,
        avatarUrl: userData.avatarUrl || formData.image,
      });

      showSuccess("Account created successfully!");
      navigate("/", { replace: true });
    } catch (error) {
      const errMsg = error.response?.data?.message || "Registration failed. Please try again.";
      showError(errMsg);
      setMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-10">
      <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-lg px-4 sm:px-6 pt-5 pb-4 w-full max-w-md mx-auto animate-fadeIn">
        <div className="relative flex flex-col items-center">
          <img src={formData.image} alt="Profile" className="w-24 h-24 rounded-full border-4 border-gray-300 dark:border-gray-600 cursor-pointer" onClick={() => setShowAvatarOptions(!showAvatarOptions)} />
          {showAvatarOptions && (
            <div className="absolute top-24 bg-white dark:bg-gray-700 shadow-lg rounded-lg p-2 flex flex-wrap gap-2 z-10">
              {avatars.map((avatar, index) => (
                <img key={index} src={avatar} alt="Avatar" className="w-12 h-12 rounded-full cursor-pointer hover:border-2 hover:border-blue-500" onClick={() => handleAvatarSelect(avatar)} />
              ))}
            </div>
          )}
        </div>

        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-100 mt-4 text-center">Create Your Account</h2>
        <hr className="my-4 border-gray-300 dark:border-gray-600" />
        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label className="text-gray-700 dark:text-gray-300 font-semibold">Name</label>
            <input type="text" name="name" placeholder="Enter your name" value={formData.name} onChange={handleChange} required className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-400 mt-1" />
          </div>
          <div className="mb-2">
            <label className="text-gray-700 dark:text-gray-300 font-semibold">Email</label>
            <input type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} required className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-400 mt-1" />
          </div>
          <div className="relative mb-2">
            <label className="text-gray-700 dark:text-gray-300 font-semibold">Password</label>
            <input type={showPassword ? "text" : "password"} name="password" placeholder="Enter your password" value={formData.password} onChange={handleChange} required className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-400 mt-1" />
            <img src={showPassword ? eyeOpen : eyeClosed} alt="Toggle" className="absolute right-3 top-10 w-6 h-6 cursor-pointer" onClick={() => setShowPassword(!showPassword)} />
          </div>
          <div className="relative mb-4">
            <label className="text-gray-700 dark:text-gray-300 font-semibold">Confirm Password</label>
            <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Re-enter your password" value={formData.confirmPassword} onChange={handleChange} required className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-400 mt-1" />
            <img src={showConfirmPassword ? eyeOpen : eyeClosed} alt="Toggle" className="absolute right-3 top-10 w-6 h-6 cursor-pointer" onClick={() => setShowConfirmPassword(!showConfirmPassword)} />
          </div>
          <button type="submit" disabled={loading}
            className="w-full font-bold text-lg bg-blue-600 text-white py-2 rounded-lg hover:bg-black hover:text-sky-400 transition">
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
        {message && <p className="text-center mt-3 font-semibold text-red-500">{message}</p>}
        <p className="text-center text-gray-500 mt-4">Already have an account? <Link to="/login" className="text-blue-500 font-semibold hover:underline">Login</Link></p>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default Signup;
