"use client";
import React, { useState } from "react";
import { useAuthStore } from "../../../store/authStore";
import { formatCurrency } from '@/lib/format';

export default function OrdersReceived({ sellerOrders = [], products = [], setSellerOrders }) {
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [hoveredBuyerId, setHoveredBuyerId] = useState(null);

  const user = useAuthStore((s) => s.user);

  const updateOrderStatus = async (orderId, status) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-requester-id': user?._id,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to update order');
      }
      const updated = await res.json();
      if (typeof setSellerOrders === 'function') {
        setSellerOrders((prev) => (prev || []).map((o) => (o._id === updated._id ? updated : o)));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Orders Received</h3>
      </div>

      {(!sellerOrders || sellerOrders.length) === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="mb-4">No orders for your products yet.</div>
          <div className="text-xs text-gray-400">Your products are listed and ready for buyers.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {sellerOrders.slice(0, 6).map((o) => {
            const product = products.find((p) => p._id === (o.productId?.toString?.() || o.productId));
            const buyer = o.buyerId && typeof o.buyerId === 'object' ? o.buyerId : null;
            return (
              <div key={o._id} className="flex items-center justify-between border rounded p-3">
                <div>
                  <div className="font-medium">{product ? product.name : `Product: ${o.productId}`}</div>
                  <div className="text-xs text-gray-500">Qty: {o.quantity} • {new Date(o.orderDate || o.createdAt).toLocaleDateString()}</div>
                  {buyer && (
                    <div className="relative inline-block mt-1">
                      <button
                        className="text-xs text-blue-600 underline cursor-pointer"
                        onMouseEnter={() => setHoveredBuyerId(o._id)}
                        onMouseLeave={() => setHoveredBuyerId(null)}
                      >
                        👤 {buyer.name || 'Buyer'}
                      </button>
                      {hoveredBuyerId === o._id && (
                        <div className="absolute left-0 top-full mt-1 z-50 bg-white border rounded shadow-lg p-2 text-xs text-gray-800 w-52 pointer-events-none">
                          <div><strong>Name:</strong> {buyer.name || 'N/A'}</div>
                          {buyer.email && <div className="mt-0.5"><strong>Email:</strong> {buyer.email}</div>}
                          {buyer.contact && <div className="mt-0.5"><strong>Contact:</strong> {buyer.contact}</div>}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-700">{formatCurrency(o.totalPrice)}</div>

                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${o.status === 'delivered' ? 'bg-green-100 text-green-800' : o.status === 'shipped' ? 'bg-blue-100 text-blue-800' : o.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>
                      {o.status}
                    </span>

                    {o.status === 'pending' && (
                      <button onClick={() => updateOrderStatus(o._id, 'shipped')} disabled={updatingOrderId === o._id} className="px-2 py-1 bg-blue-600 text-white rounded text-xs">{updatingOrderId === o._id ? '...' : 'Mark Shipped'}</button>
                    )}

                    {o.status === 'shipped' && (
                      <button onClick={() => updateOrderStatus(o._id, 'delivered')} disabled={updatingOrderId === o._id} className="px-2 py-1 bg-green-600 text-white rounded text-xs">{updatingOrderId === o._id ? '...' : 'Mark Delivered'}</button>
                    )}

                    {o.status !== 'cancelled' && o.status !== 'delivered' && (
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to cancel this order?')) {
                            updateOrderStatus(o._id, 'cancelled');
                          }
                        }}
                        disabled={updatingOrderId === o._id}
                        className="px-2 py-1 bg-red-600 text-white rounded text-xs"
                      >
                        {updatingOrderId === o._id ? '...' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
