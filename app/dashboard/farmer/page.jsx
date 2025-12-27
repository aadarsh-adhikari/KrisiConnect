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
    <div className="min-h-screen bg-linear-to-br from-green-100 via-green-200 to-green-400 flex flex-col items-center p-8">
      <h1 className="text-4xl font-bold text-green-800 mb-6">
        Farmer Dashboard
      </h1>
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-8 flex flex-col gap-8">
        <section>
          <h2 className="text-2xl font-semibold text-green-700 mb-2">
            Welcome, {user.name}!
          </h2>
          <p className="text-gray-700">
            Role:{" "}
            <span className="font-medium text-green-600">{user.role}</span>
          </p>
          <p className="text-gray-700">
            Email: <span className="font-medium">{user.email}</span>
          </p>

          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Danger zone</p>
            {deleteError && <div className="text-red-600 mb-2">{deleteError}</div>}
            {deleteSuccess && <div className="text-green-600 mb-2">{deleteSuccess}</div>}
            <button
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow-sm transition disabled:opacity-50"
            >
              {deleteLoading ? 'Deleting account...' : 'Delete Account'}
            </button>
          </div>
        </section>
        <section>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-semibold text-green-700">
              Your Products
            </h3>
          </div>
          {error && <div className="text-red-600 mb-2">{error}</div>}
          {showForm && (
            <div className="fixed inset-0 flex items-center justify-center z-60 bg-black/40 p-4">
              <div className="bg-white p-4 rounded shadow-lg w-full max-w-xl relative h-[96vh] overflow-auto scrollbar-hide">
                <div className="max-w-full overflow-hidden">
                  <div className="px-2 py-1">
                    {/* reduced padding wrapper to save vertical space */}
                  </div>
                </div>
                <button
                  className="absolute top-2 right-2 bg-gray-800 hover:bg-gray-500 p-1 rounded-full"
                  onClick={() => {
                    setShowForm(false);
                    setEditProduct(null);
                  }}
                >
                  <FaTimes className="text-red-600 " />
                </button>
                <ProductForm
                  onSave={async (data) => {
                    await handleSave(data);
                    setShowForm(false);
                    setEditProduct(null);
                  }}
                  onCancel={() => {
                    setShowForm(false);
                    setEditProduct(null);
                  }}
                  initial={editProduct}
                  loading={loading}
                />
              </div>
            </div>
          )}
          <div className="overflow-x-auto mt-4">
            <ProductsTable
              products={products}
              onEdit={(p) => {
                setEditProduct(p);
                setShowForm(true);
              }}
              onDelete={(id) => handleDelete(id)}
              onAdd={() => { setShowForm(true); setEditProduct(null); }}
            />
          </div>
        </section>
        {/* Orders section */}
        <section>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-semibold text-green-700">Orders for your products</h3>
          </div>

          {orderUpdateError && <div className="text-red-600 mb-2">{orderUpdateError}</div>}

          {sellerOrders.length === 0 ? (
            <div className="text-center p-6 text-gray-500">No orders for your products yet.</div>
          ) : (
            <div className="space-y-4">
              {sellerOrders.map((o) => {
                const product = products.find((p) => p._id === (o.productId?.toString?.() || o.productId));
                return (
                  <div key={o._id} className="border rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{product ? product.name : `Product: ${o.productId}`}</p>
                      <p className="text-sm text-gray-500">Buyer: {o.buyerId}</p>
                      <p className="text-sm text-gray-500">Qty: {o.quantity} • Total: Rs. {o.totalPrice?.toLocaleString?.() ?? o.totalPrice}</p>
                      <p className="text-xs text-gray-400">Date: {new Date(o.orderDate || o.createdAt).toLocaleDateString()}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${o.status === 'delivered' ? 'bg-green-100 text-green-800' : o.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {o.status}
                      </span>

                      {o.status === 'pending' && (
                        <button
                          onClick={() => updateOrderStatus(o._id, 'shipped')}
                          disabled={updatingOrderId === o._id}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                        >
                          {updatingOrderId === o._id ? 'Updating...' : 'Mark Shipped'}
                        </button>
                      )}

                      {o.status !== 'cancelled' && o.status !== 'delivered' && (
                        <button
                          onClick={() => updateOrderStatus(o._id, 'cancelled')}
                          disabled={updatingOrderId === o._id}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                        >
                          {updatingOrderId === o._id ? 'Updating...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default FarmerDashboard;
