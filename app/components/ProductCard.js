import React from 'react'

const ProductCard = ({ product }) => {
  if (!product) {
    return null;
  }
  
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 group overflow-hidden border border-gray-100">
      {/* Product Image */}
      <div className="relative h-48 bg-linear-to-br from-green-50 to-green-100 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center">
            <span className="text-green-600 text-2xl">🥬</span>
          </div>
        </div>
        {/* Discount Badge */}
        {product.rating > 4.5 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            FRESH
          </div>
        )}
        {/* Stock Status */}
        <div className="absolute top-3 right-3 bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
          In Stock
        </div>
      </div>
      
      {/* Product Details */}
      <div className="p-5">
        {/* Category */}
        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
          {product.category}
        </span>
        
        {/* Product Name */}
        <h3 className="font-bold text-xl mt-3 mb-2 text-gray-800 group-hover:text-green-600 transition-colors">
          {product.name}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>
        
        {/* Farmer Info */}
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
            <span className="text-green-600 text-sm">👨‍🌾</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">{product.farmer}</p>
            <p className="text-xs text-gray-500">{product.location}</p>
          </div>
        </div>
        
        {/* Rating */}
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`text-sm ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                ★
              </span>
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-600">
            {product.rating} ({product.reviews})
          </span>
        </div>
        
        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-green-600">
              ₹{product.price}
            </span>
            <span className="text-sm text-gray-500">/{product.unit}</span>
          </div>
          <div className="flex space-x-2">
            <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </button>
            <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium transform hover:scale-105 active:scale-95">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
