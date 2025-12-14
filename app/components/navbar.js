"use client";
import React, { useState, useEffect, useRef} from 'react'
import Link from 'next/link';
import { useAuthStore } from "../store/authStore";
import LoginModal from "./modals/login";
import SignupModal from "./modals/signup";
import { FaUserCircle } from "react-icons/fa";

const Navbar = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // On mount, restore user from localStorage
    const storedUser = localStorage.getItem("krisi_user");
    if (storedUser) {
      useAuthStore.getState().setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("krisi_user");
  };

  const handleSwitchToSignup = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  const handleSwitchToLogin = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  };

  return (
    <header className="flex justify-between items-center p-6 bg-white shadow">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-green-500 rounded-full"></div>
        <span className="font-bold text-lg">KRISICONNECT</span>
      </div>
      <nav className="space-x-6 hidden md:flex">
        <Link href="/" className="hover:text-green-600">Home</Link>
        <Link href="/marketplace" className="hover:text-green-600">Marketplace</Link>
        <Link href="#" className="hover:text-green-600">Farmers</Link>
        <Link href="#" className="hover:text-green-600">About</Link>
        <Link href="#" className="hover:text-green-600">Contact</Link>
      </nav>
      <div className="space-x-3 flex items-center">
        {user ? (
         <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 hover:text-green-600 focus:outline-none"
            >
              <FaUserCircle className="text-3xl text-green-600" />
              <span className="font-medium text-green-700">{user.name}</span>
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <Link
                  href={user.role === "farmer" ? "/dashboard/farmer" : "/dashboard/buyer"}
                  className="block px-4 py-2 text-gray-800 hover:bg-green-50 hover:text-green-600"
                  onClick={() => setShowDropdown(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-gray-800 hover:bg-red-50 hover:text-red-600"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <button onClick={() => setShowLoginModal(true)} className="hover:text-green-600">Login</button>
            <button onClick={() => setShowSignupModal(true)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Join KrisiConnect</button>
          </>
        )}
      </div>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={handleSwitchToSignup}
      />
      
      {/* Signup Modal */}
      <SignupModal 
        isOpen={showSignupModal} 
        onClose={() => setShowSignupModal(false)}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </header>
  )
}

export default Navbar
