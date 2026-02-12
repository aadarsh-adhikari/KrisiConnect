"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuthStore } from "../store/authStore";
import LoginModal from "./modals/login";
import SignupModal from "./modals/signup";
import { FaUserCircle, FaBars, FaTimes, FaShoppingCart, FaMoon, FaSun } from "react-icons/fa";
import Image from "next/image";
import { useCartStore } from "../store/cartStore";
const Navbar = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [theme, setTheme] = useState(() => {
    // Initialize from localStorage or system preference lazily to avoid setState in an effect
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem("theme");
    if (stored) return stored;
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  });
  const [mounted, setMounted] = useState(false);
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
    // Mark mount so theme-sensitive UI won't cause hydration mismatches
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
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

  useEffect(() => {
    // Apply theme to document and persist
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

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
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 sm:px-6 h-20 bg-emerald-600 backdrop-blur-sm shadow-md border-b border-gray-100 dark:border-gray-800">
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

      <nav className="space-x-6 hidden md:flex text-base font-medium text-white">
        <Link href="/" className="relative group inline-flex items-center px-1 py-1 -my-1">
          <span className="relative z-10 transition-transform duration-200 group-hover:-translate-y-0.5">Home</span>
          <span className="absolute left-0 -bottom-1 h-0.5 w-full bg-white/30 scale-x-0 group-hover:scale-x-100 origin-center transform transition-transform duration-300"></span>
        </Link>

        <Link href="/marketplace" className="relative group inline-flex items-center px-1 py-1 -my-1">
          <span className="relative z-10 transition-transform duration-200 group-hover:-translate-y-0.5">Marketplace</span>
          <span className="absolute left-0 -bottom-1 h-0.5 w-full bg-white/30 scale-x-0 group-hover:scale-x-100 origin-center transform transition-transform duration-300"></span>
        </Link>

        {/* <Link href="/farmers" className="relative group inline-flex items-center px-1 py-1 -my-1">
          <span className="relative z-10 transition-transform duration-200 group-hover:-translate-y-0.5">Farmers</span>
          <span className="absolute left-0 -bottom-1 h-0.5 w-full bg-white/30 scale-x-0 group-hover:scale-x-100 origin-center transform transition-transform duration-300"></span>
        </Link> */}

        <Link href="/about" className="relative group inline-flex items-center px-1 py-1 -my-1">
          <span className="relative z-10 transition-transform duration-200 group-hover:-translate-y-0.5">About</span>
          <span className="absolute left-0 -bottom-1 h-0.5 w-full bg-white/30 scale-x-0 group-hover:scale-x-100 origin-center transform transition-transform duration-300"></span>
        </Link>

        <Link href="/contact" className="relative group inline-flex items-center px-1 py-1 -my-1">
          <span className="relative z-10 transition-transform duration-200 group-hover:-translate-y-0.5">Contact</span>
          <span className="absolute left-0 -bottom-1 h-0.5 w-full bg-white/30 scale-x-0 group-hover:scale-x-100 origin-center transform transition-transform duration-300"></span>
        </Link>
      </nav>

      <div className="hidden md:flex items-center gap-3">
        <Link href="/cart" className="relative inline-flex items-center p-2 text-white hover:text-green-300">
          <FaShoppingCart className="text-2xl text-white" />
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
              <FaUserCircle className="text-3xl text-white" />
              <span className="font-medium text-white">{user.name}</span>
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                <Link
                  href={
                    user.role === "farmer"
                      ? "/dashboard/farmer"
                      : "/dashboard/buyer"
                  }
                  className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900 hover:text-green-600 dark:hover:text-green-400"
                  onClick={() => setShowDropdown(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-400"
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
              className="text-white hover:text-green-300 px-3 py-1 rounded-md transition"
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

        {/* Theme toggle */}
        {/* <button
          onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          aria-label="Toggle theme"
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          {mounted ? (
            theme === "dark" ? (
              <FaSun className="text-yellow-400 text-xl" />
            ) : (
              <FaMoon className="text-gray-700 dark:text-gray-200 text-xl" />
            )
          ) : (
            <span className="w-5 h-5 inline-block" aria-hidden="true" />
          )}
        </button> */}
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden">
        <button
          onClick={() => setShowMobileMenu((v) => !v)}
          aria-label={showMobileMenu ? "Close menu" : "Open menu"}
          aria-expanded={showMobileMenu}
          className="p-2 rounded-md hover:bg-white/10 focus:outline-none text-white"
        >
          {showMobileMenu ? (
            <FaTimes className="text-2xl text-white" />
          ) : (
            <FaBars className="text-2xl text-white" />
          )}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setShowMobileMenu(false)}>
          <div ref={mobileMenuRef} className="absolute top-20 left-4 right-4 bg-slate-900/95 text-white rounded-lg shadow-lg p-4 backdrop-blur" onClick={(e) => e.stopPropagation()}>


            <nav className="flex flex-col gap-3">
              <Link href="/" onClick={() => setShowMobileMenu(false)} className="py-2 px-3 rounded text-white hover:bg-white/10 group">
                <span className="inline-block transition-transform duration-150 group-hover:-translate-x-1">Home</span>
              </Link>

              <Link href="/marketplace" onClick={() => setShowMobileMenu(false)} className="py-2 px-3 rounded text-white hover:bg-white/10 group">
                <span className="inline-block transition-transform duration-150 group-hover:-translate-x-1">Marketplace</span>
              </Link>

              {/* <Link href="/farmers" onClick={() => setShowMobileMenu(false)} className="py-2 px-3 rounded text-white hover:bg-white/10 group">
                <span className="inline-block transition-transform duration-150 group-hover:-translate-x-1">Farmers</span>
              </Link> */}

              <Link href="/about" onClick={() => setShowMobileMenu(false)} className="py-2 px-3 rounded text-white hover:bg-white/10 group">
                <span className="inline-block transition-transform duration-150 group-hover:-translate-x-1">About</span>
              </Link>

              <Link href="/cart" onClick={() => setShowMobileMenu(false)} className="py-2 px-3 rounded text-white hover:bg-white/10 group"> 
                <span className="inline-block transition-transform duration-150 group-hover:-translate-x-1">Cart</span>
                {totalItems > 0 && (<span className="ml-2 inline-block bg-red-500 text-white text-xs rounded-full w-5 h-5 text-center">{totalItems}</span>)}
              </Link>

              <Link href="/contact" onClick={() => setShowMobileMenu(false)} className="py-2 px-3 rounded text-white hover:bg-white/10 group">
                <span className="inline-block transition-transform duration-150 group-hover:-translate-x-1">Contact</span>
              </Link>
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
