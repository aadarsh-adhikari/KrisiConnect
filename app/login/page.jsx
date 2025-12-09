"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [message, setMessage] = useState("");
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    const result = await res.json();
    if (!res.ok) {
      setMessage(result.message || "Invalid credentials");
      return;
    }
    setMessage("Login successful!");
    setUser(result.user); // Store user in Zustand global state
    if(result.user.role === "farmer") {
      router.push("/dashboard/farmer");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-100 via-green-300 to-green-500">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-green-700 mb-6">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-200"
          >
            Login
          </button>
        </form>
        {message && (
          <div className="mt-4 text-center text-sm font-medium text-green-700 animate-fade-in">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
