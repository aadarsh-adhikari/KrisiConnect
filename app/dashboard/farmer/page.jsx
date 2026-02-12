"use client";
import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useRouter } from "next/navigation";
import ProductForm from "./ProductForm";
import {FaTimes} from "react-icons/fa";
import ProductsTable from "../../components/ProductsTable";

const FarmerDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [products, setProducts] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [orderUpdateError, setOrderUpdateError] = useState("");
  const [productUpdateError, setProductUpdateError] = useState("");

  // small inline "Add New Produce" form state
  const [newProduct, setNewProduct] = useState({ name: '', category: '', price: '', quantity: '', location: '' });
  const [addingProduct, setAddingProduct] = useState(false);

  // derived stats
  const totalProducts = (products || []).length;
  const totalStock = (products || []).reduce((s, p) => s + (Number(p.quantity) || 0), 0);
  const estimatedRevenue = (sellerOrders || []).reduce((s, o) => s + (Number(o.totalPrice) || 0), 0);
  const pendingOrdersCount = (sellerOrders || []).filter((o) => o.status === 'pending').length;
  const activeProductsCount = (products || []).filter((p) => Number(p.quantity) > 0).length;
  const lowStockThreshold = 5;
  const lowStockCount = (products || []).filter((p) => Number(p.quantity) > 0 && Number(p.quantity) <= lowStockThreshold).length;

  // add product (inline quick add)
  const submitQuickAdd = async (e) => {
    e?.preventDefault?.();
    setAddingProduct(true);
    try {
      // reuse existing handleSave
      await handleSave({ ...newProduct });
      setNewProduct({ name: '', category: '', price: '', quantity: '', location: '' });
    } catch (err) {
      // handleSave sets error state already
      console.error(err);
    } finally {
      setAddingProduct(false);
    }
  };

  // compute monthly revenue for last 6 months from sellerOrders
  const getMonthlyRevenue = () => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()+1}`;
      months.push({ key, label: d.toLocaleString('default', { month: 'short' }), total: 0 });
    }
    for (const o of sellerOrders || []) {
      const dt = new Date(o.orderDate || o.createdAt);
      const key = `${dt.getFullYear()}-${dt.getMonth()+1}`;
      const m = months.find((x) => x.key === key);
      if (m) m.total += Number(o.totalPrice) || 0;
    }
    return months;
  };

  // UI: tooltip for monthly revenue bars
  const [hoveredMonth, setHoveredMonth] = useState(null);

  const updateProductQty = async (id, qty) => {
    setProductUpdateError('');
    const prev = products;
    setProducts((ps) => ps.map((p) => (p._id === id ? { ...p, quantity: Number(qty) } : p)));
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
      setProducts((ps) => ps.map((p) => (p._id === id ? updated : p)));
    } catch (e) {
      setProductUpdateError(e.message);
      setProducts(prev);
      throw e;
    }
  };

  const exportProductsCSV = () => {
    const rows = ["id,name,price,quantity,location,category"];
    for (const p of products) {
      rows.push([`"${p._id}"`, `"${(p.name||'').replace(/"/g,'""') }"`, p.price ?? 0, p.quantity ?? 0, `"${(p.location||'').replace(/"/g,'""') }"`, `"${(p.category||'').replace(/"/g,'""') }"`].join(','));
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `products_${user?._id||'me'}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  const exportSellerOrdersCSV = () => {
    const rows = ["orderId,product,qty,status,total,buyer,orderDate"];
    for (const o of sellerOrders) {
      const product = products.find((p) => p._id === (o.productId?.toString?.() || o.productId));
      rows.push([`"${o._id}"`, `"${(product?.name || o.productId || '').toString().replace(/"/g, '""') }"`, o.quantity || 0, o.status || '', o.totalPrice ?? '', `"${o.buyerId}"`, `"${new Date(o.orderDate || o.createdAt).toLocaleString()}"`].join(','));
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `seller_orders_${user?._id||'me'}.csv`; a.click(); URL.revokeObjectURL(url);
  };


  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure? This will permanently delete your account and all your products.")) return;
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
      setDeleteSuccess('Account deleted');
      // perform client-side logout and redirect
      logout();
      localStorage.removeItem('krisi_user');
      router.replace('/');
    } catch (e) {
      setDeleteError(e.message);
    }
    setDeleteLoading(false);
  };

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace("/");
      return;
    }
    if (user.role !== "farmer") {
      router.replace("/");
      return;
    }
    fetchProducts();
    fetchSellerOrders();
    // eslint-disable-next-line
  }, [user, hydrated, router]);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/products?sellerId=${user?._id}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const fetchSellerOrders = async () => {
    try {
      setOrderUpdateError('');
      const res = await fetch(`/api/orders?sellerId=${user?._id}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to fetch seller orders');
      }
      const data = await res.json();
      setSellerOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setOrderUpdateError(e.message);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    if (!window.confirm(`Set order ${orderId} to ${status}?`)) return;
    setOrderUpdateError('');
    setUpdatingOrderId(orderId);
    const prev = sellerOrders;
    setSellerOrders((s) => s.map((o) => (o._id === orderId ? { ...o, status } : o)));

    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-requester-id': user._id },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to update order status');
      }
      const updated = await res.json();
      setSellerOrders((s) => s.map((o) => (o._id === orderId ? updated : o)));
    } catch (e) {
      setOrderUpdateError(e.message);
      setSellerOrders(prev);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleSave = async (form) => {
    setLoading(true);
    setError("");
    try {
      const method = editProduct ? "PUT" : "POST";
      const url = editProduct
        ? `/api/products/${editProduct._id}`
        : "/api/products";
      const sellerId = user._id || user.id;
      if (!sellerId)
        throw new Error("User ID not found. Please log out and log in again.");
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sellerId }),
      });
      if (!res.ok) throw new Error("Failed to save product");
      setShowForm(false);
      setEditProduct(null);
      fetchProducts();
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete product");
      fetchProducts();
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  if (!user || user.role !== "farmer") return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-green-100 to-green-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-green-800">Farmer Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome back, <span className="font-medium">{user.name}</span></p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { setShowForm(true); setEditProduct(null); }} className="px-4 py-2 bg-green-600 text-white rounded shadow-sm text-sm">+ Add Product</button>
            <button onClick={handleDeleteAccount} disabled={deleteLoading} className="px-4 py-2 bg-red-500 text-white rounded shadow-sm text-sm">{deleteLoading ? 'Deleting...' : 'Delete Account'}</button>
          </div>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-500">Total Earnings</div>
            <div className="mt-2 text-xl font-bold">₹{estimatedRevenue?.toLocaleString?.()}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-500">Orders Pending</div>
            <div className="mt-2 text-xl font-bold">{pendingOrdersCount}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-500">Active Products</div>
            <div className="mt-2 text-xl font-bold">{activeProductsCount}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-500">Low Stock</div>
            <div className="mt-2 text-xl font-bold text-red-600">{lowStockCount} Items</div>
          </div>
        </div>

        {/* Main grid: left -> add form + products, right -> chart + orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* left column: Add quick product + products list */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="font-semibold text-lg mb-3">Add New Produce</h3>
              <form onSubmit={submitQuickAdd} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="text-xs text-gray-500">Product Name</label>
                  <input value={newProduct.name} onChange={(e) => setNewProduct((s) => ({ ...s, name: e.target.value }))} className="mt-1 w-full px-3 py-2 border rounded" placeholder="e.g., Fresh Potatoes" required />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Category</label>
                  <select value={newProduct.category} onChange={(e) => setNewProduct((s) => ({ ...s, category: e.target.value }))} className="mt-1 w-full px-3 py-2 border rounded">
                    <option value="">Category</option>
                    <option>Vegetables</option>
                    <option>Fruits</option>
                    <option>Dairy Products</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500">Price (₹)</label>
                    <input value={newProduct.price} onChange={(e) => setNewProduct((s) => ({ ...s, price: e.target.value }))} className="mt-1 w-full px-3 py-2 border rounded" type="number" min="0" />
                  </div>
                  <div className="w-28">
                    <label className="text-xs text-gray-500">Qty</label>
                    <input value={newProduct.quantity} onChange={(e) => setNewProduct((s) => ({ ...s, quantity: e.target.value }))} className="mt-1 w-full px-3 py-2 border rounded" type="number" min="0" />
                  </div>
                  <div className="w-36">
                    <button type="submit" disabled={addingProduct} className="ml-2 bg-green-600 text-white px-4 py-2 rounded">{addingProduct ? 'Posting...' : 'Post Product'}</button>
                  </div>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">My Products</h3>
                <div className="text-sm text-green-600">View All</div>
              </div>
              <ProductsTable
                products={products}
                onEdit={(p) => { setEditProduct(p); setShowForm(true); }}
                onDelete={handleDelete}
                onAdd={() => { setShowForm(true); setEditProduct(null); }}
                onQuantityChange={updateProductQty}
              />
            </div>
          </div>

          {/* right column: Monthly revenue + Orders Received */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border h-[260px] flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Monthly Revenue</h3>
                <div className="text-xs text-gray-400">Last 6 months</div>
              </div>

              {/* simple SVG bar chart */}
              <div className="flex-1 flex items-end gap-3">
                {getMonthlyRevenue().map((m, idx) => {
                  const months = getMonthlyRevenue();
                  const max = Math.max(...months.map(x => x.total), 1);
                  const height = Math.round((m.total / max) * 140) || 6;
                  return (
                    <div
                      key={m.key}
                      className="flex-1 flex flex-col items-center gap-2 relative"
                      onMouseEnter={() => setHoveredMonth(m)}
                      onMouseLeave={() => setHoveredMonth(null)}
                      onFocus={() => setHoveredMonth(m)}
                      onBlur={() => setHoveredMonth(null)}
                      tabIndex={0}
                    >
                      {/* tooltip shown on hover/focus */}
                      {hoveredMonth?.key === m.key && (
                        <div className="absolute -top-10 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow">
                          ₹{(m.total || 0).toLocaleString()}
                        </div>
                      )}

                      <div className="bg-green-100 w-full rounded-t transition-all" style={{ height: `${height}px` }} />
                      <div className="text-xs text-gray-500 mt-2">{m.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Orders Received</h3>
              </div>
              {sellerOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="mb-4">No orders for your products yet.</div>
                  <div className="text-xs text-gray-400">Your products are listed and ready for buyers.</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {sellerOrders.slice(0,6).map((o) => {
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
          </div>
        </div>
      </div>

      {/* product modal (existing) */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-60 bg-black/40 p-4">
          <div className="bg-white p-4 rounded shadow-lg w-full max-w-xl relative h-[96vh] overflow-auto scrollbar-hide">
            <button
              className="absolute top-2 right-2 bg-gray-800 hover:bg-gray-500 p-1 rounded-full"
              onClick={() => { setShowForm(false); setEditProduct(null); }}
            >
              <FaTimes className="text-red-600 " />
            </button>
            <ProductForm
              onSave={async (data) => { await handleSave(data); setShowForm(false); setEditProduct(null); }}
              onCancel={() => { setShowForm(false); setEditProduct(null); }}
              initial={editProduct}
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;
