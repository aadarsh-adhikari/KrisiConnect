"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuthStore } from "../store/authStore";
import LoginModal from "./modals/login";
import SignupModal from "./modals/signup";
import { FaUserCircle, FaBars, FaTimes, FaShoppingCart } from "react-icons/fa";
import Image from "next/image";
import { useCartStore } from "../store/cartStore";
const Navbar = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const totalItems = useCartStore((s) => s.items.reduce((acc, i) => acc + (i.qty || 0), 0));

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
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
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
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 sm:px-6 h-20 bg-white/90 backdrop-blur-sm shadow-md border-b border-gray-100">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 w-auto flex items-center">
            <Image
              src="/logo/logo.png"
              alt="KrisiConnect Logo"
              width={150}
              height={60}
              className="bg-transparent w-auto object-contain "
            />
          </div>
        </Link>
      </div>

      <nav className="space-x-6 hidden md:flex text-base font-medium">
        <Link href="/" className="hover:text-green-600 transition-colors">
          Home
        </Link>
        <Link href="/marketplace" className="hover:text-green-600 transition-colors">
          Marketplace
        </Link>
        <Link href="/farmers" className="hover:text-green-600 transition-colors">
          Farmers
        </Link>
        <Link href="/about" className="hover:text-green-600 transition-colors">
          About
        </Link>
        <Link href="/contact" className="hover:text-green-600 transition-colors">
          Contact
        </Link>
      </nav>

      <div className="hidden md:flex items-center gap-3">
        <Link href="/cart" className="relative inline-flex items-center p-2 hover:text-green-600">
          <FaShoppingCart className="text-2xl text-green-600" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{totalItems}</span>
          )}
        </Link>
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
                  href={
                    user.role === "farmer"
                      ? "/dashboard/farmer"
                      : "/dashboard/buyer"
                  }
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
            <button
              onClick={() => setShowLoginModal(true)}
              className="text-green-700 hover:text-green-800 px-3 py-1 rounded-md transition"
            >
              Login
            </button>
            <button
              onClick={() => setShowSignupModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow-sm transition"
            >
              Join KrisiConnect
            </button>
          </>
        )}
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden">
        <button
          onClick={() => setShowMobileMenu((v) => !v)}
          aria-label={showMobileMenu ? "Close menu" : "Open menu"}
          aria-expanded={showMobileMenu}
          className="p-2 rounded-md hover:bg-gray-100 focus:outline-none"
        >
          {showMobileMenu ? (
            <FaTimes className="text-2xl text-green-600" />
          ) : (
            <FaBars className="text-2xl text-green-600" />
          )}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setShowMobileMenu(false)}>
          <div ref={mobileMenuRef} className="absolute top-20 left-4 right-4 bg-white rounded-lg shadow-lg p-4" onClick={(e) => e.stopPropagation()}>
           

            <nav className="flex flex-col gap-3">
              <Link href="/" onClick={() => setShowMobileMenu(false)} className="py-2 px-3 rounded hover:bg-gray-50">Home</Link>
              <Link href="/marketplace" onClick={() => setShowMobileMenu(false)} className="py-2 px-3 rounded hover:bg-gray-50">Marketplace</Link>
              <Link href="/farmers" onClick={() => setShowMobileMenu(false)} className="py-2 px-3 rounded hover:bg-gray-50">Farmers</Link>
              <Link href="/about" onClick={() => setShowMobileMenu(false)} className="py-2 px-3 rounded hover:bg-gray-50">About</Link>
              <Link href="/cart" onClick={() => setShowMobileMenu(false)} className="py-2 px-3 rounded hover:bg-gray-50">Cart {totalItems > 0 && (<span className="ml-2 inline-block bg-red-500 text-white text-xs rounded-full w-5 h-5 text-center">{totalItems}</span>)}</Link>
              <Link href="/contact" onClick={() => setShowMobileMenu(false)} className="py-2 px-3 rounded hover:bg-gray-50">Contact</Link>
            </nav>

            <div className="mt-4">
              {user ? (
                <div className="flex flex-col gap-2">
                  <Link href={user.role === 'farmer' ? '/dashboard/farmer' : '/dashboard/buyer'} className="py-2 px-3 rounded bg-green-50 text-green-700">Dashboard</Link>
                  <button onClick={() => { handleLogout(); setShowMobileMenu(false); }} className="py-2 px-3 rounded bg-red-50 text-red-600">Logout</button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <button onClick={() => { setShowLoginModal(true); setShowMobileMenu(false); }} className="py-2 px-3 rounded border">Login</button>
                  <button onClick={() => { setShowSignupModal(true); setShowMobileMenu(false); }} className="py-2 px-3 rounded bg-green-600 text-white">Join KrisiConnect</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
  );
};

export default Navbar;
