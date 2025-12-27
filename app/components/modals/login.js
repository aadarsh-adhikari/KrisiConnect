"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/authStore";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import Image from "next/image";

const LoginModal = ({ isOpen, onClose, onSwitchToSignup }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    let success = false;
    try {
      // Add a 10s timeout to avoid hanging requests
      const res = await axios.post("/api/auth/login", formData, { timeout: 10000 });
      success = true;
      setMessage("Login successful!");
      setUser(res.data.user);
      localStorage.setItem("krisi_user", JSON.stringify(res.data.user));
      setTimeout(() => {
        onClose();
        if (res.data.user.role === "farmer") {
          router.push("/dashboard/farmer");
        } else {
          router.push("/dashboard/buyer");
        }
      }, 1000);
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        setMessage('Request timed out. Please check your network and try again.');
      } else {
        setMessage(error.response?.data?.message || error.message || "Login failed. Please try again.");
      }
    } finally {
      if (!success) setLoading(false);
      // If successful, keep the subtle loading for the UX but stop shortly after navigation begins
      if (success) setTimeout(() => setLoading(false), 1200);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4 overflow-auto min-h-screen">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 relative flex flex-col items-center m-4 max-h-[85vh] overflow-auto scrollbar-hide">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-black hover:text-white text-xl font-bold bg-red-600  hover:bg-red-500 rounded-full px-2 "
        >
          ×
        </button>
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-4xl font-extrabold text-green-700 mb-1 tracking-tight drop-shadow">Login</h2>
          <p className="text-gray-500 text-sm">Welcome back to KrisiConnect</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-green-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-green-50 text-gray-900"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-green-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 pr-10 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-green-50 text-gray-900"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-700"
                tabIndex={-1}
              >
                {showPassword ? <FaRegEyeSlash size={20} /> : <FaRegEye size={20} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 bg-linear-to-r from-green-500 to-green-700 text-white font-bold rounded-lg shadow-md transition duration-200 text-lg tracking-wide ${
              loading
                ? "opacity-50 cursor-not-allowed"
                : "hover:from-green-600 hover:to-green-800"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Logging in...
              </div>
            ) : (
              "Login"
            )}
          </button>
        </form>
        {message && (
          <div className={`mt-6 text-center text-base font-semibold animate-fade-in ${
            message.includes("successful") ? "text-green-700" : "text-red-600"
          }`}>
            {message}
          </div>
        )}
        <div className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?
          <button onClick={onSwitchToSignup} className="text-green-700 font-semibold hover:underline">Sign Up</button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
