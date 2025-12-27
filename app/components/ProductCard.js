"use client";

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
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
  const items = useCartStore((s) => s.items)
  const added = items.some((i) => i.productId === product._id)
  const [qty, setQty] = useState(product?.quantity > 0 ? 1 : 0)
  const router = useRouter()

  if (!product) return null

  const maxQty = product.quantity ?? 0
  const inStock = maxQty > 0
  const createdAt = useMemo(() => new Date(product.createdAt).toLocaleDateString(), [product.createdAt])

  const performAdd = () => {
    if (!inStock) return
    addItem(product, qty)
  }

  const handleAdd = (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault()
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation()
    if (added) {
      router.push('/cart')
      return
    }
    if (typeof onAddToCart === 'function') return onAddToCart(product, qty)
    performAdd()
  }

  return (
    <Link href={`/product/${product._id}`} className="block" aria-label={`View details for ${product.name}`}>
      <article className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden w-full h-full flex flex-col transform transition-transform duration-200 hover:scale-105 cursor-pointer">
        {/* Image */}
        <div className="relative w-full h-64 md:h-40 lg:h-50 bg-white shrink-0">
          <div className="w-full h-full relative z-0">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
              className="object-cover"
              priority={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">No image</div>
          )}
        </div>
       
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-2xl font-semibold text-gray-900">{product.name}</h3>
          <div className="text-2xl font-bold text-green-600">{typeof product.price === 'number' ? `Rs. ${product.price.toLocaleString()}` : product.price}</div>
        </div>

        <div className="mt-3 flex items-center gap-2">
         
          <span className="text-xs font-medium px-3 py-1 border rounded-full bg-white text-gray-700">{product.category}</span>
        </div>

        <p className="text-sm text-gray-600 mt-4 line-clamp-3">{product.description}</p>

        <div className="mt-5 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl">👨‍🌾</div>
            <div>
              <div className="text-gray-800 font-medium">{product.sellerName ?? product.farmer ?? (product.sellerId && typeof product.sellerId === 'object' ? product.sellerId.name : product.sellerId) ?? 'Seller'}</div>
              <div className="text-xs text-gray-400">Added: {createdAt}</div>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
           

            <div className="text-sm text-gray-500">{inStock ? `${maxQty} quantity` : 'Out of stock'}</div>
          </div>
        </div>
      </div>

      {/* Add to cart full width button */}
      <div className="px-5 pb-5 mt-auto ">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleAdd(e); }}
          disabled={!inStock}
          className={`w-full py-3 rounded-lg text-white font-semibold transition focus:outline-none ${!inStock ? 'bg-gray-300 text-gray-700 cursor-not-allowed' : 'bg-linear-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 shadow-md'}`}
        >
          {added ? 'View Cart' : 'Add to Cart'}
        </button>
      </div>

    </article>
    </Link>
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
