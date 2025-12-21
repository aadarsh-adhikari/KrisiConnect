"use client";
import ProductCard from "./ProductCard";

export default function MarketplacePreview({ products = [] }) {
  return (
    <section className="container mx-auto px-6 md:px-12 max-w-6xl py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Marketplace Highlights</h2>
        <a href="/marketplace" className="text-green-600 font-semibold hover:underline">View all</a>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.length === 0 ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse h-64" />
          ))
        ) : (
          products.slice(0, 8).map((p) => <ProductCard key={p._id} product={p} />)
        )}
      </div>
      
    </section>
  );
}
