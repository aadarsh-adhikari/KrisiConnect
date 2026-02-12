"use client";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/app/store/authStore";
import { useRouter } from "next/navigation";
import { FaShoppingCart, FaBox } from "react-icons/fa";
import { useCartStore } from "@/app/store/cartStore";
import Link from "next/link";

const BuyerDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const cartItems = useCartStore((s) => s.getTotalItems());
  const cartTotal = useCartStore((s) => s.getTotalPrice());
  const cartList = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clear);
  const updateQty = useCartStore((s) => s.updateQty);

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [placingItemId, setPlacingItemId] = useState(null);
  const [placingAll, setPlacingAll] = useState(false);
  const [cartOrderError, setCartOrderError] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // confirm / cancel order states
  const [confirmingId, setConfirmingId] = useState(null);
  const [confirmError, setConfirmError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelError, setCancelError] = useState("");

  // UI: order search + filter
  const [orderQuery, setOrderQuery] = useState("");
  const [orderFilter, setOrderFilter] = useState("");

  // filtered orders for display (search by product name or id + status)
  const filteredOrders = (orders || []).filter((o) => {
    const productName = (products.find((p) => p._id === (o.productId?.toString?.() || o.productId))?.name || "").toLowerCase();
    const q = (orderQuery || "").toLowerCase();
    if (orderFilter && o.status !== orderFilter) return false;
    if (!q) return true;
    return productName.includes(q) || o._id?.toString?.().includes(q) || (o.status || "").toLowerCase().includes(q);
  });

  const exportOrdersCSV = () => {
    const rows = ["orderId,product,qty,status,total,orderDate"];
    for (const o of filteredOrders) {
      const product = products.find((p) => p._id === (o.productId?.toString?.() || o.productId));
      const line = [
        `"${o._id}"`,
        `"${(product?.name || o.productId || '').toString().replace(/"/g, '""') }"`,
        o.quantity || 0,
        o.status || '',
        o.totalPrice ?? '',
        `"${new Date(o.orderDate || o.createdAt).toLocaleString()}"`,
      ].join(',');
      rows.push(line);
    }
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${user?._id || 'me'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure? This will permanently delete your account.")) return;
    setDeleteLoading(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'x-requester-id': user._id },
        body: JSON.stringify({ requesterId: user._id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to delete account');
      }
      // Success -> logout and redirect
      logout();
      localStorage.removeItem('krisi_user');
      router.replace('/');
    } catch (e) {
      setDeleteError(e.message);
    }
    setDeleteLoading(false);
  };

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }
    if (user.role !== "buyer") {
      router.push("/");
      return;
    }

    fetchData();
  }, [user, router]);

  // fetch orders for this user
  const fetchOrders = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/orders?userId=${user._id}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to fetch orders');
      }
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };



  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to fetch products');
      }
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchOrders(), fetchProducts()]);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  // confirm order action
  const confirmOrder = async (orderId) => {
    if (!window.confirm('Confirm this order?')) return;
    setConfirmError('');
    setConfirmingId(orderId);

    // optimistic UI update
    const prev = orders;
    setOrders((s) => s.map((o) => (o._id === orderId ? { ...o, status: 'delivered' } : o)));

    try {
      const res = await fetch(`/api/orders/${orderId}/confirm`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-requester-id': user._id },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to confirm order');
      }
      const updated = await res.json();
      setOrders((s) => s.map((o) => (o._id === orderId ? updated : o)));
    } catch (e) {
      setConfirmError(e.message);
      // revert on error
      setOrders(prev);
    } finally {
      setConfirmingId(null);
    }
  }

  // cancel order action (buyer)
  const cancelOrder = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;
    setCancelError('');
    setCancellingId(orderId);

    const prev = orders;
    // optimistic remove for better UX
    setOrders((s) => s.filter((o) => o._id !== orderId));

    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-requester-id': user._id },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to cancel order');
      }
      // success: order removed already
    } catch (e) {
      setCancelError(e.message);
      setOrders(prev);
    } finally {
      setCancellingId(null);
    }
  }

  // place order for a single cart item
  const placeOrderItem = async (item) => {
    setCartOrderError('');
    setPlacingItemId(item.productId);
    try {
      const body = { productId: item.productId, quantity: Number(item.qty || 1) };
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-requester-id': user._id },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to create order');
      }
      const order = await res.json();
      setOrders((s) => [order, ...s]);

      // update product stock locally if present
      setProducts((ps) => ps.map((p) => (p._id === order.productId.toString() ? { ...p, quantity: Math.max(0, (p.quantity || 0) - order.quantity) } : p)));

      // remove from cart
      removeItem(item.productId);
    } catch (e) {
      setCartOrderError(e.message);
    } finally {
      setPlacingItemId(null);
    }
  }

  // place orders for all cart items
  const placeAllOrders = async () => {
    if (!cartList || cartList.length === 0) return;
    setCartOrderError('');
    setPlacingAll(true);
    const errors = [];
    const created = [];
    for (const item of cartList) {
      try {
        const body = { productId: item.productId, quantity: Number(item.qty || 1) };
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-requester-id': user._id },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          errors.push(err.message || 'Failed to create order');
          continue;
        }
        const order = await res.json();
        created.push(order);
        // update product stock locally
        setProducts((ps) => ps.map((p) => (p._id === order.productId.toString() ? { ...p, quantity: Math.max(0, (p.quantity || 0) - order.quantity) } : p)));
      } catch (e) {
        errors.push(e.message);
      }
    }

    if (created.length > 0) setOrders((s) => [...created.reverse(), ...s]);
    if (errors.length > 0) setCartOrderError(errors.join('; '));
    else clearCart();
    setPlacingAll(false);
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-blue-50 p-6">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-green-700 mb-2">Welcome, {user.name}!</h1>
          <p className="text-gray-600">Manage your orders and discover fresh farm products</p>
        </div>
        <div className="mt-2">
          {deleteError && <div className="text-red-600 mb-2">{deleteError}</div>}
          <button
            onClick={handleDeleteAccount}
            disabled={deleteLoading}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md shadow-sm transition disabled:opacity-50"
          >
            {deleteLoading ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Orders</p>
              <p className="text-3xl font-bold text-green-700">{orders.length}</p>
            </div>
            <FaBox className="text-4xl text-green-200" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Cart</p>
              <p className="text-3xl font-bold text-blue-700">{cartItems}</p>
              <p className="text-sm text-gray-500 mt-1">Total: Rs. {cartTotal?.toLocaleString?.() ?? '0'}</p>
            </div>
            <FaShoppingCart className="text-4xl text-blue-200" />
          </div>
        </div>
      </div> 

      {/* Cart Orders Section */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <h3 className="text-lg font-semibold mb-3">Cart Orders</h3>

        {(!cartList || cartList.length === 0) ? (
          <div className="text-gray-500">Your cart is empty.</div>
        ) : (
          <div className="space-y-3">
            {cartList.map((item) => (
              <div key={item.productId} className="flex items-center justify-between gap-4 border rounded p-3">
                <div>
                  <div className="font-semibold">{item.product?.name ?? item.productId}</div>
                  <div className="text-sm text-gray-500">Unit: Rs. {item.product?.price?.toLocaleString?.() ?? item.product?.price}</div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    className="border rounded px-2 py-1 w-20"
                    min={1}
                    value={item.qty}
                    onChange={(e) => updateQty(item.productId, Number(e.target.value || 1))}
                  />

                  <div className="text-sm">Subtotal: Rs. {(Number(item.qty || 1) * (item.product?.price || 0)).toLocaleString()}</div>

                  <button
                    onClick={() => placeOrderItem(item)}
                    disabled={placingItemId === item.productId}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                  >
                    {placingItemId === item.productId ? 'Placing...' : 'Place'}
                  </button>

                  <button
                    onClick={() => removeItem(item.productId)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between border-t pt-3">
              <div className="text-sm text-gray-600">Total: Rs. {cartTotal?.toLocaleString?.() ?? '0'}</div>
              <div className="flex items-center gap-3">
                <button
                  onClick={placeAllOrders}
                  disabled={placingAll}
                  className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded ${placingAll ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {placingAll ? 'Placing All...' : 'Place All Orders'}
                </button>
                <button
                  onClick={() => clearCart()}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded"
                >
                  Clear Cart
                </button>
              </div>
            </div>

            {cartOrderError && <div className="text-red-600 mt-2">{cartOrderError}</div>}
          </div>
        )}
      </div>

      {/* Orders Section */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-green-700">
              <FaBox className="inline mr-2" /> My Orders
            </h2>
            <div className="text-sm text-gray-500 ml-2">Manage and track your recent purchases</div>
          </div>

          <div className="flex items-center gap-3">
            <input
              placeholder="Search orders or product..."
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm w-64"
            />

            <select value={orderFilter} onChange={(e) => setOrderFilter(e.target.value)} className="px-3 py-2 border rounded-md text-sm">
              <option value="">All status</option>
              <option value="pending">Pending</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button onClick={exportOrdersCSV} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm">Export CSV</button>
          </div>
        </div>

        <div className="p-6">
            <div>
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-4">No orders found</p>
                  <Link
                    href="/marketplace"
                    className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div key={order._id} className="border rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-lg text-gray-800">Order #{order._id}</p>
                          <p className="text-sm text-gray-600">Product: {products.find((p) => p._id === (order.productId?.toString?.() || order.productId))?.name ?? order.productId}</p>
                          <p className="text-gray-500 text-sm">Qty: {order.quantity} · Date: {new Date(order.orderDate || order.createdAt).toLocaleDateString()}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-end">
                            <span className={`px-4 py-1 rounded-full text-sm font-semibold ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {order.status || "Processing"}
                            </span>

                            {/* simple status stepper */}
                            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                              <div className={`${order.status === 'pending' ? 'font-semibold text-yellow-700' : order.status !== 'pending' ? 'text-gray-400' : ''}`}>● Pending</div>
                              <div className={`${order.status === 'shipped' ? 'font-semibold text-blue-700' : order.status === 'delivered' || order.status === 'shipped' ? 'text-gray-400' : ''}`}>● Shipped</div>
                              <div className={`${order.status === 'delivered' ? 'font-semibold text-green-700' : 'text-gray-400'}`}>● Delivered</div>
                            </div>
                          </div>

                          {order.status === 'shipped' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); confirmOrder(order._id); }}
                              disabled={confirmingId === order._id}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                            >
                              {confirmingId === order._id ? 'Confirming...' : 'Confirm'}
                            </button>
                          )}

                          {order.status === 'pending' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); cancelOrder(order._id); }}
                              disabled={cancellingId === order._id}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                            >
                              {cancellingId === order._id ? 'Cancelling...' : 'Cancel'}
                            </button>
                          )}
                        </div>
                      </div>

                      {confirmError && confirmingId === order._id && <div className="text-red-600 mt-2">{confirmError}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
       
        </div>
      </div>


    </div>
  );
};

export default BuyerDashboard;