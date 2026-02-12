"use client";
import React, { useState } from "react";

export default function OrdersReceived({ sellerOrders = [], products = [], setSellerOrders }) {
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const updateOrderStatus = async (orderId, status) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update order');
      const updated = await res.json();
      // update parent state if setter provided
      if (typeof setSellerOrders === 'function') {
        setSellerOrders((prev) => (prev || []).map((o) => (o._id === updated._id ? updated : o)));
      }
    } catch (e) {
      console.error(e);
      // swallow — parent can re-fetch if needed
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
            return (
              <div key={o._id} className="flex items-center justify-between border rounded p-3">
                <div>
                  <div className="font-medium">{product ? product.name : `Product: ${o.productId}`}</div>
                  <div className="text-xs text-gray-500">Qty: {o.quantity} • {new Date(o.orderDate || o.createdAt).toLocaleDateString()}</div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-700">₹{o.totalPrice}</div>

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
                      <button onClick={() => updateOrderStatus(o._id, 'cancelled')} disabled={updatingOrderId === o._id} className="px-2 py-1 bg-red-600 text-white rounded text-xs">{updatingOrderId === o._id ? '...' : 'Cancel'}</button>
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
