"use client";
import Link from "next/link";
import { FaPlusCircle } from "react-icons/fa";

export default function FarmerCTA() {
  return (
    <section className="bg-green-50 py-12">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl flex flex-col md:flex-row items-center gap-6">
        <div className="md:w-2/3">
          <h3 className="text-2xl font-bold text-green-800">Sell your produce on KrisiConnect</h3>
          <p className="text-gray-700 mt-2">Simple listing flow, fair pricing, and access to nearby buyers — get your farm online in minutes.</p>
        </div>
        <div className="md:w-1/3 flex justify-end">
          <Link href="/dashboard/farmer" className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-lg font-semibold shadow">
            <FaPlusCircle /> Start Selling
          </Link>
        </div>
      </div>
    </section>
  );
}
