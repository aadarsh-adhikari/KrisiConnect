"use client";
import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/format";
import { useAuthStore } from "../../store/authStore";
import { useRouter } from "next/navigation";
import ProductForm from "./ProductForm";
import { FaTimes, FaMoneyBillWave, FaShoppingCart, FaLeaf, FaExclamationTriangle } from "react-icons/fa";

import MyProducts from "./components/MyProducts";
import MonthlyRevenue from "./components/MonthlyRevenue";
import OrdersReceived from "./components/OrdersReceived";

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
  const [orderUpdateError, setOrderUpdateError] = useState("");
  const [productUpdateError, setProductUpdateError] = useState("");

  // small inline "Add New Produce" form state
  const [newProduct, setNewProduct] = useState({ name: '', category: '', price: '', quantity: '', location: '' });
  const [addingProduct, setAddingProduct] = useState(false);

  // derived stats
  const totalProducts = (products || []).length;
  const totalStock = (products || []).reduce((s, p) => s + (Number(p.quantity) || 0), 0);
  // earnings only count orders that were successfully delivered
  const totalEarnings = (sellerOrders || [])
    .filter((o) => o.status === 'delivered')
    .reduce((s, o) => s + (Number(o.totalPrice) || 0), 0);
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
    // only include delivered orders in revenue chart
    for (const o of (sellerOrders || []).filter((o) => o.status === 'delivered')) {
      const dt = new Date(o.orderDate || o.createdAt);
      const key = `${dt.getFullYear()}-${dt.getMonth()+1}`;
      const m = months.find((x) => x.key === key);
      if (m) m.total += Number(o.totalPrice) || 0;
    }
    return months;
  };

  // generic chart data generator for different ranges (hour/day/month buckets)






  const exportProductsCSV = () => {
    if (!products || products.length === 0) return;
    if (!window.confirm('Export products as CSV?')) return;
    const rows = ["id,name,price,quantity,location,category"];
    for (const p of products) {
      rows.push([`"${p._id}"`, `"${(p.name||'').replace(/"/g,'""') }"`, p.price ?? 0, p.quantity ?? 0, `"${(p.location||'').replace(/"/g,'""') }"`, `"${(p.category||'').replace(/"/g,'""') }"`].join(','));
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `products_${user?._id||'me'}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  const exportSellerOrdersCSV = () => {
    if (!sellerOrders || sellerOrders.length === 0) return;
    if (!window.confirm('Export orders as CSV?')) return;
    const rows = ["orderId,product,qty,status,total,buyer,orderDate"];
    for (const o of sellerOrders) {
      const product = products.find((p) => p._id === (o.productId?.toString?.() || o.productId));
      const buyerName = o.buyerId?.name || o.buyerId;
      rows.push([`"${o._id}"`, `"${(product?.name || o.productId || '').toString().replace(/"/g, '') }"`, o.quantity || 0, o.status || '', o.totalPrice ?? '', `"${buyerName}"`, `"${new Date(o.orderDate || o.createdAt).toLocaleString()}"`].join(','));
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
      const res = await fetch(`/api/orders?sellerId=${user?._id}&populateBuyer=1`);
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
            <button
              onClick={exportProductsCSV}
              disabled={!products || products.length === 0}
              className={`px-4 py-2 bg-blue-600 text-white rounded shadow-sm text-sm ${!products || products.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Export Products
            </button>
            <button
              onClick={exportSellerOrdersCSV}
              disabled={!sellerOrders || sellerOrders.length === 0}
              className={`px-4 py-2 bg-blue-600 text-white rounded shadow-sm text-sm ${!sellerOrders || sellerOrders.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Export Orders
            </button>
            <button onClick={handleDeleteAccount} disabled={deleteLoading} className="px-4 py-2 bg-red-500 text-white rounded shadow-sm text-sm">{deleteLoading ? 'Deleting...' : 'Delete Account'}</button>
          </div>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-50 text-green-600 rounded-full">
                <FaMoneyBillWave className="w-5 h-5" />
              </div>
              <div>
                      <div className="text-sm text-gray-500">Total Earnings (delivered)</div>
                <div className="mt-2 text-xl font-bold">{formatCurrency(totalEarnings)}</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
                <FaShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Orders Pending</div>
                <div className="mt-2 text-xl font-bold">{pendingOrdersCount}</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-full">
                <FaLeaf className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Active Products</div>
                <div className="mt-2 text-xl font-bold">{activeProductsCount}</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-50 text-red-600 rounded-full">
                <FaExclamationTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Low Stock</div>
                <div className="mt-2 text-xl font-bold text-red-600">{lowStockCount} Items</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main grid: left -> add form + products, right -> chart + orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* left column: Add quick product + products list */}
          <div className="lg:col-span-2 space-y-6">
           

            <MyProducts
              products={products}
              onEdit={(p) => { setEditProduct(p); setShowForm(true); }}
              onDelete={handleDelete}
              onAdd={() => { setShowForm(true); setEditProduct(null); }}
              setProducts={setProducts}
            />
          </div>

          {/* right column: Monthly revenue + Orders Received */}
          <div className="space-y-6">
            <MonthlyRevenue sellerOrders={sellerOrders} initialRange={"7d"} />

            <OrdersReceived sellerOrders={sellerOrders} products={products} setSellerOrders={setSellerOrders} />
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
