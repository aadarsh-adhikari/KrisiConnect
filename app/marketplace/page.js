"use client";
import { useEffect, useState } from "react";
import ProductCard from "@/app/components/ProductCard";
import { FaSearch } from "react-icons/fa";
import { useCartStore } from "../store/cartStore";

export default function Marketplace() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [sortBy, setSortBy] = useState("")
  const [ratingFilter, setRatingFilter] = useState(0)
  const [locations, setLocations] = useState([])
  const [selectedLocations, setSelectedLocations] = useState(new Set())

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    // derive locations from loaded products
    if (products.length) {
      const locs = Array.from(new Set(products.map((p) => p.location).filter(Boolean)))
      setLocations(locs)
    }
  }, [products])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/products')
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setProducts(data)
    } catch (e) {
      console.error('PRODUCTS FETCH ERROR', e)
    } finally {
      setLoading(false)
    }
  }

  const toggleLocation = (loc) => {
    setSelectedLocations((prev) => {
      const next = new Set(prev)
      if (next.has(loc)) next.delete(loc)
      else next.add(loc)
      return next
    })
  }

  const clearFilters = () => {
    setQuery('')
    setCategory('')
    setMinPrice('')
    setMaxPrice('')
    setSortBy('')
    setRatingFilter(0)
    setSelectedLocations(new Set())
  }

  const maxProductPrice = products.reduce((max, p) => Math.max(max, p.price ?? 0), 0)

  const filtered = products
    .filter((p) => {
      if (query && !(`${p.name} ${p.description}`.toLowerCase().includes(query.toLowerCase()))) return false
      if (category && p.category !== category) return false
      if (minPrice && Number(p.price) < Number(minPrice)) return false
      if (maxPrice && Number(p.price) > Number(maxPrice)) return false
      if (ratingFilter && Math.round(p.rating ?? 0) < ratingFilter) return false
      if (selectedLocations.size && !selectedLocations.has(p.location)) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price
      if (sortBy === 'price-desc') return b.price - a.price
      return 0
    })

  const CartSummary = () => {
    const items = useCartStore((s) => s.items);
    const totalItems = items.reduce((s, i) => s + (i.qty || 0), 0);
    const totalPrice = items.reduce((s, i) => s + (i.qty || 0) * (i.product.price || 0), 0);
    return (
      <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-100">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Your cart</div>
          <div className="text-sm text-gray-600">{totalItems} items</div>
        </div>
        <div className="mt-3 text-sm text-gray-700">Total: <span className="font-semibold">₹{totalPrice}</span></div>
        <div className="mt-3">
          <a href="/cart" className="inline-block bg-green-600 text-white px-3 py-2 rounded text-sm">View cart</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header / Search banner */}
      <div className="bg-linear-to-br from-green-50 to-white py-10">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Browse Products</h1>
          <p className="mt-2 text-gray-600">Discover amazing products from trusted sellers</p>

          <div className="mt-6 flex gap-3">
            <div className="flex items-center bg-white rounded-lg shadow px-4 flex-1">
              <FaSearch className="text-green-400 mr-3" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products by name, category, or location..." className="w-full py-3 outline-none" />
            </div>
            <button onClick={() => {}} className="px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700">Search</button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-6 md:px-12 max-w-6xl py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full md:w-64 bg-white rounded-lg p-4 shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Filters</h3>
              <button onClick={clearFilters} className="text-sm text-green-600">Clear</button>
            </div>

            {/* Cart summary */}
            <CartSummary />


            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700">Price range</label>
              <div className="flex items-center gap-2 mt-2">
                <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Min" className="w-24 px-2 py-1 border rounded" />
                <div className="text-gray-400">—</div>
                <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Max" className="w-24 px-2 py-1 border rounded" />
              </div>
              <div className="text-xs text-gray-400 mt-2">Max price: ₹{maxProductPrice}</div>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700">Rating</label>
              <div className="mt-2 flex flex-col gap-2 text-sm text-gray-600">
                {[5,4,3,2,1].map((r) => (
                  <label key={r} className="inline-flex items-center gap-2">
                    <input type="radio" name="rating" checked={ratingFilter === r} onChange={() => setRatingFilter(r)} className="accent-green-600" />
                    <span className="flex items-center gap-1">
                      {Array.from({length:r}).map((_,i)=> <svg key={i} className="w-4 h-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.945a1 1 0 00.95.69h4.15c.969 0 1.371 1.24.588 1.81l-3.36 2.44a1 1 0 00-.364 1.118l1.287 3.945c.3.921-.755 1.688-1.54 1.118l-3.36-2.44a1 1 0 00-1.176 0l-3.36 2.44c-.784.57-1.838-.197-1.539-1.118l1.287-3.945a1 1 0 00-.364-1.118L2.075 9.372c-.783-.57-.38-1.81.588-1.81h4.15a1 1 0 00.95-.69l1.286-3.945z"/></svg>)}
                      <span className="text-xs text-gray-500">+ stars</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Location</label>
              <div className="mt-2 flex flex-col gap-2 text-sm">
                {locations.length ? locations.map((loc) => (
                  <label key={loc} className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={selectedLocations.has(loc)} onChange={() => toggleLocation(loc)} className="accent-green-600" />
                    <span className="text-gray-700">{loc}</span>
                  </label>
                )) : <div className="text-xs text-gray-400">No locations</div>}
              </div>
            </div>
          </aside>

          {/* Products area */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600">Showing <span className="font-medium text-gray-900">{filtered.length}</span> products</div>
              <div className="flex items-center gap-3">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 border rounded">
                  <option value="">Sort</option>
                  <option value="price-asc">Price: low → high</option>
                  <option value="price-desc">Price: high → low</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-64 bg-white rounded-lg shadow animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {filtered.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
