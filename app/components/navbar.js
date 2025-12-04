"use client";
import React, { useEffect } from 'react'
import Link from 'next/link';
import { useAuthStore } from "../store/authStore";

const Navbar = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    // On mount, restore user from localStorage
    const storedUser = localStorage.getItem("krisi_user");
    if (storedUser) {
      useAuthStore.getState().setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("krisi_user");
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
          <>
            <span className="font-medium text-green-700">Hello, {user.name}</span>
            <button onClick={handleLogout} className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200">Logout</button>
          </>
        ) : (
          <>
            <Link href="/login" className="px-4 py-2 rounded hover:bg-gray-100">Login</Link>
            <Link href="/signup" className="bg-green-600 text-white px-4 py-2 rounded">Suit on KrisiConnect</Link>
          </>
        )}
      </div>
    </header>
  )
}

export default Navbar
