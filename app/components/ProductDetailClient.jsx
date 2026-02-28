"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { formatCurrency } from "@/lib/format";
import ProductCard from "./ProductCard";

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

const ProductDetailClient = ({ product }) => {
  const [index, setIndex] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const images = (product.images || []).slice(0, 7);
  const router = useRouter();
  const mainRef = useRef(null);

  useEffect(() => {
    setIndex(0);
  }, [product._id]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [index]);

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);

  const addItem = useCartStore((s) => s.addItem);
  const inCart = useCartStore((s) => s.items.some((i) => i.productId === product._id));
  const user = useAuthStore((s) => s.user);

  const handleAddToCart = () => {
    if (!product) return;
    if (user?.role === 'farmer') {
      alert('You must be logged in as a buyer to purchase products');
      return;
    }
    addItem(product, 1);
  };

  useEffect(() => {
    let isActive = true;
    const loadSuggestions = async () => {
      setSuggestionsLoading(true);
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        const filtered = (data || []).filter((p) => p._id !== product._id);
        const sameCategory = filtered.filter((p) => p.category === product.category);
        const picked = (sameCategory.length ? sameCategory : filtered).slice(0, 4);
        if (isActive) setSuggestions(picked);
      } catch (e) {
        if (isActive) setSuggestions([]);
      } finally {
        if (isActive) setSuggestionsLoading(false);
      }
    };
    loadSuggestions();
    return () => {
      isActive = false;
    };
  }, [product._id, product.category]);

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            {/* Main image */}
            <div className="h-80 md:h-[420px] flex items-center justify-center bg-gray-50">
              {images.length > 0 ? (
                  <Image
                    src={images[index]}
                    alt={`${product.name} ${index + 1}`}
                    className="max-h-[50vh] max-w-full object-contain transition-all duration-300"
                    ref={mainRef}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="text-gray-400">No images</div>
                )}

              {/* Prev/Next */}
              {images.length > 1 && (
                <>
                  <button onClick={prev} aria-label="Previous" className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow-md hover:bg-gray-100">
                    <FaChevronLeft />
                  </button>
                  <button onClick={next} aria-label="Next" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow-md hover:bg-gray-100">
                    <FaChevronRight />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="mt-3 p-3 bg-white">
                <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setIndex(i)} className={`rounded overflow-hidden border ${i === index ? 'ring-2 ring-green-500' : 'border-gray-100'}`}>
                      <Image src={img} alt={`Thumbnail ${i + 1}`} className="w-24 h-16 object-cover" width={96} height={64} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
          <p className="text-sm text-gray-500 mt-1">{product.category} • {product.location}</p>
          <div className="mt-4">
            <span className="text-3xl font-bold text-green-600">{formatCurrency(product.price)}</span>
          </div>

          <div className="mt-4 text-gray-700">
            <p>{product.description}</p>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            {/* Contact: WhatsApp if phone available; fallback to email */}
            <ContactSellerButton product={product} />
            <button
              onClick={() => {
                if (user?.role === 'farmer') {
                  alert('You must be logged in as a buyer to purchase products');
                  return;
                }
                if (inCart) router.push('/cart'); else handleAddToCart();
              }}
              disabled={false /* only disable when desired - seller logic handled in click */}
              title={user?.role === 'farmer' ? 'Login as buyer to add to cart' : ''}
              className={`w-full py-3 rounded-lg text-white font-semibold transition focus:outline-none cursor-pointer ${user?.role === 'farmer' ? 'bg-gray-300 text-gray-700' : inCart ? 'bg-green-600' : 'bg-linear-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 shadow-md'}`}
            >
              {inCart ? 'View Cart' : 'Add to Cart'}
            </button>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <div>Seller: <span className="font-medium text-gray-800">{product.seller?.name || product.sellerName || product.sellerId}</span></div>
            <div className="mt-1">Posted: {formatDate(product.createdAt)}</div>
          </div>
        </div>
      </div>

      {/* Back to marketplace */}
      <div className="mt-6">
        <button onClick={() => router.push('/marketplace')} className="text-sm text-gray-700 hover:text-gray-900">← Back to Marketplace</button>
      </div>

      {/* Suggestions */}
      <div className="mt-10">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">More products you may like</h2>
            <p className="text-sm text-gray-500">Hand-picked from the marketplace</p>
          </div>
          <button onClick={() => router.push('/marketplace')} className="text-sm text-gray-700 hover:text-gray-900 hover:underline">View all</button>
        </div>

        {suggestionsLoading ? (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-50 border border-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : suggestions.length ? (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {suggestions.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        ) : (
          <div className="mt-4 text-sm text-gray-500">No suggestions available right now.</div>
        )}
      </div>
    </div>
  );
};


const sanitizePhone = (raw) => {
  if (!raw) return null;
  // remove non-digit characters and leading +
  const digits = raw.replace(/\D+/g, '');
  if (!digits) return null;
  return digits;
};

const ContactSellerButton = ({ product }) => {
  const user = useAuthStore((state) => state.user);
  const seller = product.seller || {};

  const handleWhatsApp = () => {
    const phone = sanitizePhone(seller.contact);
    if (!phone) return;
    const myName = user?.name ? `${user.name}` : '';
    const myContact = user?.contact ? `\nMy contact: ${user.contact}` : '';
    const productUrl = typeof window !== 'undefined' ? window.location.href : '';
    const msg = `Hi ${seller.name || 'there'},%0AI'm interested in your product \"${product.name}\".${myName ? `%0AName: ${encodeURIComponent(myName)}` : ''}${myContact ? `%0A${encodeURIComponent(myContact)}` : ''}%0AProduct: ${encodeURIComponent(productUrl)}`;
    const link = `https://wa.me/${phone}?text=${msg}`;
    window.open(link, '_blank');
  };

  const handleEmail = () => {
    if (!seller.email) return;
    const subject = `Inquiry about ${product.name}`;
    const bodyLines = [`Hi ${seller.name || ''},`, `I'm interested in your product "${product.name}".`, user?.name ? `Name: ${user.name}` : null, user?.contact ? `Contact: ${user.contact}` : null, `Product: ${typeof window !== 'undefined' ? window.location.href : ''}`].filter(Boolean);
    const body = bodyLines.join('\n');
    window.location.href = `mailto:${seller.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  
   if(seller.contact && seller.email){
    return(<div className="flex flex-row gap-2"> 
     <button
       onClick={handleEmail}
       title={seller.email}
       className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer"
     >
       Contact via Email
     </button>
      <button
        onClick={handleWhatsApp}
        title={seller.contact}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded cursor-pointer"
      >
        Message on WhatsApp
      </button>
    </div>)
   }
  if (seller.contact) {
    return (
      <button
        onClick={handleWhatsApp}
        title={seller.contact}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded cursor-pointer"
      >
        Message on WhatsApp
      </button>
    );
  }

  if (seller.email) {
    return (
      <button
        onClick={handleEmail}
        title={seller.email}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer"
      >
        Contact via Email
      </button>
    );
  }

  return (
    <button disabled className="bg-gray-200 text-gray-500 px-4 py-2 rounded cursor-not-allowed">Contact info unavailable</button>
  );
};

export default ProductDetailClient;