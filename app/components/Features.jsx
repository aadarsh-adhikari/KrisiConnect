"use client";
import { FaTruck, FaSeedling, FaShieldAlt, FaLeaf, FaRegLightbulb,FaArrowRight   } from "react-icons/fa";

export default function Features(){
  const items = [
    { icon: <FaSeedling className="text-green-600" />, title: "Farm-fresh", desc: "Seasonal produce directly from local farms harvested and delivered quickly." },
    { icon: <FaTruck className="text-green-600" />, title: "Local Delivery", desc: "Fast and reliable delivery options from nearby sellers." },
    { icon: <FaShieldAlt className="text-green-600" />, title: "Trusted Sellers", desc: "Verified farmer profiles with transparent ratings and reviews." },
    { icon: <FaLeaf className="text-green-600" />, title: "Sustainable", desc: "Support regenerative practices and reduce food miles." },
    { icon: <FaRegLightbulb className="text-green-600" />, title: "Smart Pricing", desc: "Fair prices that benefit both buyers and farmers." },
  ];

  return (
    <section className="container mx-auto px-6 md:px-12 max-w-6xl py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Why KrisiConnect?</h2>
        <p className="text-gray-500 mt-2 max-w-2xl mx-auto">We make it easy to buy fresh produce directly from local farmers with transparency and trust.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {items.map((it, i) => (
          <div key={i} className="bg-white rounded-lg p-6 shadow hover:shadow-lg transform hover:-translate-y-1 transition-all">
            <div className="flex items-center gap-4 mb-3">
              <div className="bg-green-50 p-3 rounded-md">{it.icon}</div>
              <h4 className="font-semibold text-gray-800">{it.title}</h4>
            </div>
            <p className="text-sm text-gray-600">{it.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-row mt-8 text-green-600 group">
        <a href="/about" className="font-semibold hover:underline inline-flex items-center gap-2">
          <span>Learn more about how we work</span>
          <FaArrowRight className="transform transition-transform duration-150 group-hover:translate-x-1" />
        </a>
      </div>
    </section>
  );
}
