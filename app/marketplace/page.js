"use client";
import { useEffect, useState } from "react";
import ProductCard from "@/app/components/ProductCard";
import { FaSearch } from "react-icons/fa";

export default function Marketplace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter((p) => {
    if (query && !(`${p.name} ${p.description}`.toLowerCase().includes(query.toLowerCase()))) return false;
    if (category && p.category !== category) return false;
    if (minPrice && Number(p.price) < Number(minPrice)) return false;
    if (maxPrice && Number(p.price) > Number(maxPrice)) return false;
    return true;
  }).sort((a,b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return 0;
  });

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Marketplace</h1>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row gap-3 items-center">
          <div className="flex items-center gap-2 flex-1">
            <FaSearch className="text-gray-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products or description" className="w-full px-3 py-2 border rounded" />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-2 border rounded">
            <option value="">All categories</option>
            <option>Fruits</option>
            <option>Vegetables</option>
            <option>Grains & Cereals</option>
            <option>Dairy Products</option>
            <option>Meat & Poultry</option>
            <option>Seeds & Saplings</option>
            <option>Farm Tools & Equipment</option>
            <option>Organic & Natural Products</option>
            <option>Other Food</option>
          </select>
          <div className="flex gap-2">
            <input value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Min price" className="w-24 px-3 py-2 border rounded" />
            <input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Max price" className="w-24 px-3 py-2 border rounded" />
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 border rounded">
            <option value="">Sort</option>
            <option value="price-asc">Price: low → high</option>
            <option value="price-desc">Price: high → low</option>
          </select>
          <button onClick={() => { setQuery(''); setCategory(''); setMinPrice(''); setMaxPrice(''); setSortBy(''); }} className="px-4 py-2 bg-gray-200 rounded">Reset</button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-64 bg-white rounded-lg shadow animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
