"use client";
import React, { useState } from 'react';
import Link from "next/link";
import { FaLeaf, FaStore } from "react-icons/fa";
import { TiTick } from "react-icons/ti";
import { useAuthStore } from "../store/authStore";
import LoginModal from "./modals/login";

import Image from "next/image";
import { useRouter } from 'next/navigation';
export default function Hero() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [infoMsg, setInfoMsg] = useState('');
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  const handleFarmerClick = (e) => {
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
    <section className="bg-linear-to-r from-green-600 to-green-500 text-white py-20">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl flex flex-col md:flex-row items-center gap-8">
        <div className="md:w-1/2">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">Fresh produce. Direct from farmers to your table.</h1>
          <p className="text-green-100 mb-6 max-w-lg">Discover fresh, seasonal, and locally grown farm products. Buy directly from nearby farmers and support sustainable agriculture.</p>
          <div className="flex gap-4">
            <Link href="/marketplace" className="inline-flex items-center gap-2 bg-white text-green-700 px-5 py-3 rounded-lg font-semibold shadow hover:shadow-lg">
              <FaStore /> Marketplace
            </Link>
            <button onClick={handleFarmerClick} className="inline-flex items-center gap-2 border border-white/40 px-5 py-3 rounded-lg font-semibold hover:bg-white/10">
              <FaLeaf /> For Farmers
            </button>
          </div>
          {infoMsg && <div className="mt-3 text-sm text-green-100">{infoMsg}</div>}
          <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
          <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-2 text-green-100 text-sm">
            <li className="flex items-center gap-2"><TiTick className="text-green-100" /> <span>Hand-picked & seasonal</span></li>
            <li className="flex items-center gap-2"><TiTick className="text-green-100" /> <span>Transparent pricing</span></li>
            <li className="flex items-center gap-2"><TiTick className="text-green-100" /> <span>Local delivery options</span></li>
            <li className="flex items-center gap-2"><TiTick className="text-green-100" /> <span>Support small farms</span></li>
          </ul>
        </div>
        <div className="md:w-1/2 ">
          <div className="bg-white rounded-xl p-2 shadow-lg h-[450px] mx-auto  ">
           <Image src="/herosection.png" alt="Farmers" width={600} height={600} className="rounded-xl object-cover w-full h-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
