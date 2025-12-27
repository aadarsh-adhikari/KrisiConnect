"use client";
import React, { useState } from 'react';
import { FaPlusCircle } from "react-icons/fa";
import { useAuthStore } from "../store/authStore";
import { useRouter } from 'next/navigation';
import LoginModal from "./modals/login";

export default function FarmerCTA() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [infoMsg, setInfoMsg] = useState('');
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  const handleStartSelling = (e) => {
    e.preventDefault();
    if (!user) {
      setIsLoginOpen(true);
      return;
    }

    if (user.role === 'farmer') {
      router.push('/dashboard/farmer');
      return;
    }

    setInfoMsg(`You are already logged in as ${user.role}`);
    setTimeout(() => setInfoMsg(''), 3000);
  };

  return (
    <section className="bg-green-50 py-12">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl flex flex-col md:flex-row items-center gap-6">
        <div className="md:w-2/3">
          <h3 className="text-2xl font-bold text-green-800">Sell your produce on KrisiConnect</h3>
          <p className="text-gray-700 mt-2">Simple listing flow, fair pricing, and access to nearby buyers — get your farm online in minutes.</p>
        </div>
        <div className="md:w-1/3 flex justify-end">
          <button onClick={handleStartSelling} className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-lg font-semibold shadow">
            <FaPlusCircle /> Start Selling
          </button>
        </div>
      </div>

      {infoMsg && <div className="mt-4 text-center text-sm text-green-700">{infoMsg}</div>}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </section>
  );
}
