"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '../store/cartStore';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);

  const total = items.reduce((sum, i) => sum + (i.qty || 0) * (i.product.price || 0), 0);

  if (!items || items.length === 0) {
    return (
      <main className="min-h-screen py-20">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Looks like you haven't added anything yet.</p>
          <Link href="/marketplace" className="inline-block bg-green-600 text-white px-6 py-3 rounded-md">Browse marketplace</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-20">
      <div className="container mx-auto px-6 md:px-12 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

        <div className="space-y-4">
          {items.map((it) => (
            <div key={it.productId} className="flex items-center gap-4 bg-white rounded-lg p-4 shadow">
              <div className="w-24 h-24 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                {it.product.images && it.product.images[0] ? (
                  <img src={it.product.images[0]} className="w-full h-full object-cover" alt={it.product.name} />
                ) : (
                  <div className="text-gray-300">No image</div>
                )}
              </div>

              <div className="flex-1">
                <Link href={`/product/${it.productId}`} className="font-medium text-gray-800 block">{it.product.name}</Link>
                <div className="text-sm text-gray-500">₹{it.product.price} / {it.product.unit}</div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => updateQty(it.productId, (it.qty || 1) - 1)} className="px-3 py-1 border rounded">-</button>
                <div className="px-3 py-1 border rounded">{it.qty}</div>
                <button onClick={() => updateQty(it.productId, (it.qty || 1) + 1)} className="px-3 py-1 border rounded">+</button>
              </div>

              <div className="ml-6 text-right">
                <div className="font-medium">₹{(it.qty || 0) * (it.product.price || 0)}</div>
                <button onClick={() => removeItem(it.productId)} className="text-sm text-red-600 mt-2">Remove</button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-white rounded-lg p-4 shadow flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-2xl font-bold">₹{total}</div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { clear(); }} className="py-2 px-4 rounded border">Clear</button>
            <button onClick={() => alert('Checkout not implemented')} className="py-2 px-4 rounded bg-green-600 text-white">Checkout</button>
          </div>
        </div>
      </div>
    </main>
  );
}
