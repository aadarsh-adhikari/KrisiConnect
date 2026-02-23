"use client";
import React from "react";
import ProductsTable from '../../../components/ProductsTable';

export default function MyProducts({ products = [], onEdit, onDelete, onAdd, setProducts }) {
  // quantity editing removed – display only
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
        // omit onQuantityChange to keep quantity column read-only
      />
    </div>
  );
}
