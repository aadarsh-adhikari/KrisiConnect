"use client";
import Link from "next/link";

export default function Footer(){
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 mt-12">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h5 className="font-bold text-white">KRISICONNECT</h5>
          <p className="text-sm mt-2">Connecting farmers and buyers for fresher food and fairer prices.</p>
        </div>
        <div>
          <h6 className="font-semibold text-white">Quick Links</h6>
          <ul className="mt-2 text-sm">
            <li><Link href="/marketplace">Marketplace</Link></li>
            <li><Link href="/dashboard/farmer">Farmer Dashboard</Link></li>
            <li><Link href="/about">About</Link></li>
          </ul>
        </div>
        <div>
          <h6 className="font-semibold text-white">Contact</h6>
          <p className="text-sm mt-2">hello@krisiconnect.example</p>
        </div>
      </div>
    </footer>
  );
}
