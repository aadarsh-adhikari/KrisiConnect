"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";

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
  const [added, setAdded] = React.useState(false);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            {/* Main image */}
            <div className="h-80 md:h-[420px] flex items-center justify-center bg-gray-50">
              {images.length > 0 ? (
                <img
                  src={images[index]}
                  alt={`${product.name} ${index + 1}`}
                  className="max-h-full max-w-full object-contain transition-all duration-300"
                  ref={mainRef}
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
                      <img src={img} className="w-24 h-16 object-cover" />
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
            <span className="text-3xl font-bold text-green-600">₹{product.price}</span>
            <span className="text-sm text-gray-500 ml-2">/{product.unit}</span>
          </div>

          <div className="mt-4 text-gray-700">
            <p>{product.description}</p>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            {/* Contact: WhatsApp if phone available; fallback to email */}
            <ContactSellerButton product={product} />
            <button onClick={handleAddToCart} className={`border px-4 py-2 rounded ${added ? 'bg-green-50 text-green-700 cursor-default' : 'text-gray-700 hover:bg-gray-100'}`}>{added ? 'Added' : 'Add to Cart'}</button>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <div>Seller: <span className="font-medium text-gray-800">{product.seller?.name || product.sellerName || product.sellerId}</span></div>
            <div className="mt-1">Posted: {formatDate(product.createdAt)}</div>
          </div>
        </div>
      </div>

      {/* Back to marketplace */}
      <div className="mt-6">
        <button onClick={() => router.push('/marketplace')} className="text-sm text-green-700 hover:underline">← Back to Marketplace</button>
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
     <button onClick={handleEmail} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Contact via Email</button>
      <button onClick={handleWhatsApp} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Message on WhatsApp</button>
    </div>)
   }
  if (seller.contact) {
    return (
      <button onClick={handleWhatsApp} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Message on WhatsApp</button>
    );
  }

  if (seller.email) {
    return (
      <button onClick={handleEmail} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Contact via Email</button>
    );
  }

  return (
    <button disabled className="bg-gray-200 text-gray-500 px-4 py-2 rounded cursor-not-allowed">Contact info unavailable</button>
  );
};

export default ProductDetailClient;