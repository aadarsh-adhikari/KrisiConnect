"use client";
import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";

export default function MarketplacePreview({ products: initial = [] }) {
  const [products, setProducts] = useState(initial || []);
  const [loading, setLoading] = useState((initial || []).length === 0);
  const [error, setError] = useState('');

  useEffect(() => {
    // If server didn't provide products, try fetching on the client
    if ((initial || []).length === 0) {
      const fetchProducts = async () => {
        setLoading(true);
        try {
          const res = await fetch('/api/products');
          if (!res.ok) throw new Error((await res.json()).message || 'Failed to fetch products');
          const data = await res.json();
          setProducts(Array.isArray(data) ? data : []);
        } catch (e) {
          setError(e.message || 'Error fetching products');
        } finally {
          setLoading(false);
        }
      };
      fetchProducts();
    }
  }, [initial]);

  return (
    <section className="container mx-auto px-6 md:px-12 max-w-6xl py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Marketplace Highlights</h2>
        <a href="/marketplace" className="text-green-600 font-semibold hover:underline">View all</a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse h-64" />
          ))
        ) : error ? (
          <div className="col-span-full text-red-600">{error}</div>
        ) : products.length === 0 ? (
          <div className="col-span-full text-gray-500">No products available yet.</div>
        ) : (
          products.slice(0, 4).map((p) => <ProductCard key={p._id} product={p} />)
        )}
      </div>

    </section>
  );
}
