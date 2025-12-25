"use client";

"use client";

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FaShoppingCart, FaCheck } from 'react-icons/fa'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'

/**
 * ProductCard
 * Responsive, accessible product card that surfaces fields from the product schema:
 * - name, description, category, price, quantity, rating, images, location, createdAt, sellerId
 * 
 * Props:
 * - product (required)
 * - onAddToCart (optional) => function(product, qty)
 */
const ProductCard = ({ product, onAddToCart }) => {
  const user = useAuthStore((s) => s.user)
  const addItem = useCartStore((s) => s.addItem)
  const [qty, setQty] = useState(product?.quantity > 0 ? 1 : 0)
  const [added, setAdded] = useState(false)

  if (!product) return null

  const maxQty = product.quantity ?? 0
  const inStock = maxQty > 0
  const createdAt = useMemo(() => new Date(product.createdAt).toLocaleDateString(), [product.createdAt])

  const performAdd = () => {
    if (!inStock) return
    addItem(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1400)
  }

  const handleAdd = (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault()
    if (typeof onAddToCart === 'function') return onAddToCart(product, qty)
    performAdd()
  }

  return (
    <article className="group bg-white rounded-xl shadow-sm hover:shadow-lg transform hover:scale-[0.52] scale-[0.5] transition duration-200 border border-gray-100 overflow-hidden w-2xs">
      {/* Image area */}
      <div className="relative w-full h-60 sm:h-72 md:h-80 bg-white flex items-center justify-center">
        <Link href={`/product/${product._id}`} className="block absolute inset-0 z-0" />

        <div className="w-full h-full relative z-0">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
              className="object-cover"
              priority={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">No image</div>
          )}
        </div>

        {/* Add-to-cart overlay */}
        <div className="absolute top-3 right-3 z-10">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); performAdd() }}
            aria-label="Add to cart"
            title="Add to cart"
            className="p-2 rounded-full bg-white shadow hover:bg-gray-50 border border-gray-100 flex items-center justify-center"
          >
            {added ? <FaCheck className="text-green-600" /> : <FaShoppingCart className="text-gray-700" />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="text-xs font-medium px-2 py-1 border rounded-md bg-white text-gray-700">{product.unit?.toUpperCase() ?? 'UNIT'}</span>
              <span className="text-xs font-medium px-2 py-1 border rounded-md bg-white text-gray-700">{product.category}</span>
            </div>

            <p className="text-sm text-gray-600 mt-3 line-clamp-3">{product.description}</p>

            <div className="mt-3 flex items-center gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">👨‍🌾</span>
                <div>
                  <div className="text-gray-700 font-medium">{product.sellerName ?? product.farmer ?? (product.sellerId && typeof product.sellerId === 'object' ? product.sellerId.name : product.sellerId) ?? 'Seller'}</div>
                  <div className="text-xs">{product.location}</div>
                </div>
              </div>

              <div className="ml-auto text-xs text-gray-400">Added: {createdAt}</div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-end text-right">
            <div className="text-xs text-gray-400">Price</div>
            <div className="text-2xl font-bold text-gray-900">₹{product.price}</div>
            <div className="text-xs text-gray-500 mt-2">{inStock ? `${maxQty} available` : 'Out of stock'}</div>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center rounded-md border overflow-hidden">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQty((p) => Math.max(1, p - 1))}
                  disabled={!inStock || qty <= 1}
                  className="px-3 py-2 text-gray-700 disabled:opacity-40"
                >
                  −
                </button>
                <div className="px-3 py-2 w-10 text-center text-sm">{qty}</div>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQty((p) => Math.min(maxQty, p + 1))}
                  disabled={!inStock || qty >= maxQty}
                  className="px-3 py-2 text-gray-700 disabled:opacity-40"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                disabled={!inStock || added}
                className={`px-4 py-2 rounded-md text-white font-medium transition ${!inStock ? 'bg-gray-300 text-gray-700 cursor-not-allowed' : 'bg-purple-700 hover:bg-purple-800'} ${added ? 'opacity-70 cursor-default' : ''}`}
              >
                {added ? 'Added' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer strip (rating) */}
      <div className="border-t border-gray-100 px-4 py-3 bg-white text-sm text-gray-600 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Rating value={product.rating ?? 0} />
          <span>{(product.reviews ?? 0)} reviews</span>
        </div>
        <div className="text-xs text-gray-400">{product.location}</div>
      </div>
    </article>
  )
}

function Rating({ value = 0 }) {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1)
  return (
    <div className="flex items-center gap-1">
      {stars.map((s) => (
        <svg key={s} className={`w-4 h-4 ${s <= Math.round(value) ? 'text-yellow-400' : 'text-gray-200'}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.945a1 1 0 00.95.69h4.15c.969 0 1.371 1.24.588 1.81l-3.36 2.44a1 1 0 00-.364 1.118l1.287 3.945c.3.921-.755 1.688-1.54 1.118l-3.36-2.44a1 1 0 00-1.176 0l-3.36 2.44c-.784.57-1.838-.197-1.539-1.118l1.287-3.945a1 1 0 00-.364-1.118L2.075 9.372c-.783-.57-.38-1.81.588-1.81h4.15a1 1 0 00.95-.69l1.286-3.945z" />
        </svg>
      ))}
    </div>
  )
}

export default ProductCard
