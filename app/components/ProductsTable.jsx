"use client";
import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { FaEllipsisV, FaSearch } from "react-icons/fa";
import { formatCurrency } from "@/lib/format";

export default function ProductsTable({ products = [], onEdit, onDelete, onAdd, onQuantityChange }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [qtyMap, setQtyMap] = useState({});
  const [savingQty, setSavingQty] = useState({});

  // sync quantities when products change
  useEffect(() => {
    const map = {};
    (products || []).forEach((p) => { map[p._id] = p.quantity ?? 0; });
    setQtyMap(map);
  }, [products]);

  // use API products directly
  const combined = useMemo(() => {
    return (products || []);
  }, [products]);

  const filtered = useMemo(() => {
    if (!query) return combined;
    const q = query.toLowerCase();
    return combined.filter((p) => `${p.name} ${p.category} ${p.location}`.toLowerCase().includes(q));
  }, [combined, query]);

  // Pagination
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // ensure page is valid when data/filter changes
  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const startIndex = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(filtered.length, page * PAGE_SIZE);

  const toggle = (id) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-3 bg-white border rounded-md px-3 py-2">
          <FaSearch className="text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type Product..."
            className="outline-none text-sm"
          />

        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => onAdd?.()} className="px-4 py-2 rounded bg-green-600 text-white text-sm">+ Add Product</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-white border-b">
            <tr className="text-xs text-gray-500 uppercase tracking-wider">
              <th className="p-3 border-r w-10">
                <input
                  type="checkbox"
                  checked={pageItems.length > 0 && pageItems.every((p) => selected.has(p._id))}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelected((s) => {
                        const next = new Set(s);
                        pageItems.forEach((p) => next.add(p._id));
                        return next;
                      });
                    } else {
                      setSelected((s) => {
                        const next = new Set(s);
                        pageItems.forEach((p) => next.delete(p._id));
                        return next;
                      });
                    }
                  }}
                />
              </th>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Quantity</th>
              <th className="p-3 text-left">Revenue</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center p-6 text-gray-400">
                  No products yet.
                </td>
              </tr>
            ) : (
              pageItems.map((p) => {
                const revenue = (p.price || 0) * (p.quantity || 0);
                return (
                  <tr key={p._id} className={`hover:bg-gray-50`}>
                    <td className="p-3 border-r">
                      <input type="checkbox" checked={selected.has(p._id)} onChange={() => toggle(p._id)} />
                    </td>

                    <td className="p-3 align-top">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                          {p.images && p.images[0] ? (
                            // use next/image where possible, but fallback to img for unknown remote sources
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-xs text-gray-400">No image</div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{p.name}</div>
                          <div className="text-xs text-gray-500">{p.category || "—"} • {p.location || "—"}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">{formatCurrency(p.price)}</td>
                    <td className="p-3">
                      {typeof onQuantityChange === 'function' ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={qtyMap[p._id] ?? (p.quantity ?? 0)}
                            onChange={(e) => setQtyMap((m) => ({ ...m, [p._id]: Number(e.target.value || 0) }))}
                            onBlur={async (e) => {
                              const newQty = Number(e.target.value || 0);
                              if (newQty === (p.quantity ?? 0)) return;
                              try {
                                setSavingQty((s) => ({ ...s, [p._id]: true }));
                                await onQuantityChange(p._id, newQty);
                              } catch (err) {
                                // revert locally on error
                                setQtyMap((m) => ({ ...m, [p._id]: p.quantity ?? 0 }));
                              } finally {
                                setSavingQty((s) => ({ ...s, [p._id]: false }));
                              }
                            }}
                            className="w-20 px-2 py-1 border rounded text-sm"
                            min={0}
                          />
                          <div className="text-xs text-gray-500">{savingQty[p._id] ? 'Saving...' : 'Saved'}</div>
                        </div>
                      ) : (
                        p.quantity ?? 0
                      )}
                    </td>
                    <td className="p-3">{formatCurrency(revenue)}</td>
                    <td className="p-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs ${p.quantity > 0 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>{p.quantity > 0 ? 'Active' : 'Out of stock'}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => onEdit?.(p)} className="px-3 py-1 bg-yellow-400 text-white rounded text-xs">Edit</button>
                        <button onClick={() => onDelete?.(p._id)} className="px-3 py-1 bg-red-500 text-white rounded text-xs">Delete</button>
                        {/* <button className="p-2 text-gray-400 hover:text-gray-600"><FaEllipsisV /></button> */}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* pagination controls */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing {startIndex}-{endIndex} of {filtered.length} items
          <span className="ml-3 text-gray-400">(Page {page} of {totalPages})</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
