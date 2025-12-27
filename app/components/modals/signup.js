"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/authStore";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import Image from "next/image";


const SignupModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    password: "",
    confirmPassword: "",
    role: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const handleClose = () => {
    setLoading(false);
    setMessage("");
    setFormData({ name: "", email: "", contact: "", password: "", confirmPassword: "", role: "" });
    setShowPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  const handleSwitchToLogin = () => {
    setLoading(false);
    setMessage("");
    setFormData({ name: "", email: "", contact: "", password: "", confirmPassword: "", role: "" });
    setShowPassword(false);
    setShowConfirmPassword(false);
    onSwitchToLogin();
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post("/api/auth/signup", {
        name: formData.name,
        email: formData.email,
        contact: formData.contact,
        password: formData.password,
        role: formData.role
      });
      setMessage("Signup successful! Opening login...");
      setTimeout(() => {
        onSwitchToLogin();
      }, 1500);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error in signup");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4 overflow-auto min-h-screen scrollbar-hide">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 relative flex flex-col items-center m-4 max-h-[98vh] ">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-black hover:text-white text-xl font-bold bg-red-600  hover:bg-red-500 rounded-full px-2"
        >
          ×
        </button>
        <div className="flex flex-col items-center mb-4">
          <h2 className="text-3xl font-extrabold text-green-700 mb-1 tracking-tight">Sign Up</h2>
          <p className="text-gray-500 text-sm">Create your KrisiConnect account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-green-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-green-50 text-gray-900"
              placeholder="Enter your name"
            />
          </div>
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
            <label htmlFor="contact" className="block text-sm font-semibold text-green-700 mb-1">Contact number</label>
            <input
              type="tel"
              name="contact"
              id="contact"
              value={formData.contact}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-green-50 text-gray-900"
              placeholder="Enter contact number"
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
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-green-700 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 pr-10 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-green-50 text-gray-900"
                placeholder="Re-enter your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-700"
                tabIndex={-1}
              >
                {showConfirmPassword ? <FaRegEyeSlash size={20} /> : <FaRegEye size={20} />}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-semibold text-green-700 mb-1">Role</label>
            <select
              name="role"
              id="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-green-50 text-gray-900"
            >
              <option value="">Select role</option>
              <option value="farmer">Farmer</option>
              <option value="buyer">Buyer</option>
            </select>
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
                Creating account...
              </div>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>
        {message && (
          <div className={`mt-2 text-center text-base font-semibold animate-fade-in ${
            message.includes("successful") ? "text-green-700" : "text-red-600"
          }`}>
            {message}
          </div>
        )}
        <div className="mt-2 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} className="text-green-700 font-semibold hover:underline">Login</button>
        </div>
      </div>
    </div>
  );
};

export default SignupModal;
