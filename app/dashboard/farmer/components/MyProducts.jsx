"use client";
import React from "react";
import ProductsTable from '../../../components/ProductsTable';

export default function MyProducts({ products = [], onEdit, onDelete, onAdd, setProducts }) {
  const updateProductQty = async (id, qty) => {
    const prev = products;
    // optimistic UI
    if (typeof setProducts === 'function') setProducts((ps) => ps.map((p) => (p._id === id ? { ...p, quantity: Number(qty) } : p)));
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: Number(qty) }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to update product quantity');
      }
      const updated = await res.json();
      if (typeof setProducts === 'function') setProducts((ps) => ps.map((p) => (p._id === id ? updated : p)));
    } catch (e) {
      console.error(e);
      if (typeof setProducts === 'function') setProducts(prev);
      throw e;
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">My Products</h3>
        <div className="text-sm text-green-600">View All</div>
      </div>
      <ProductsTable
        products={products}
        onEdit={onEdit}
        onDelete={onDelete}
        onAdd={onAdd}
        onQuantityChange={updateProductQty}
      />
    </div>
  );
}
