"use client";
import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useRouter } from "next/navigation";
import ProductForm from "./ProductForm";

const FarmerDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [error, setError] = useState("");

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

  const handleSave = async (form) => {
    setLoading(true);
    setError("");
    try {
      const method = editProduct ? "PUT" : "POST";
      const url = editProduct ? `/api/products/${editProduct._id}` : "/api/products";
      const sellerId = user._id || user.id;
      if (!sellerId) throw new Error("User ID not found. Please log out and log in again.");
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sellerId })
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
      <h1 className="text-4xl font-bold text-green-800 mb-6">Farmer Dashboard</h1>
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-8 flex flex-col gap-8">
        <section>
          <h2 className="text-2xl font-semibold text-green-700 mb-2">Welcome, {user.name}!</h2>
          <p className="text-gray-700">Role: <span className="font-medium text-green-600">{user.role}</span></p>
          <p className="text-gray-700">Email: <span className="font-medium">{user.email}</span></p>
        </section>
        <section>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-semibold text-green-700">Your Products</h3>
            <button onClick={() => { setShowForm(true); setEditProduct(null); }} className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 transition">Add Product</button>
          </div>
          {error && <div className="text-red-600 mb-2">{error}</div>}
          {showForm && (
            <div className="fixed inset-0 flex items-center justify-center ">
              <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                  onClick={() => setShowForm(false)}
                >
                  &times;
                </button>
                <ProductForm
                  onSave={(data) => {
                    handleSave(data);
                    setShowForm(false);
                  }}
                  initial={editProduct}
                  loading={loading}
                />
              </div>
            </div>
          )}
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-green-100">
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Category</th>
                  <th className="p-2 border">Price</th>
                  <th className="p-2 border">Qty</th>
                  <th className="p-2 border">Location</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 && (
                  <tr><td colSpan={6} className="text-center p-4 text-gray-400">No products yet.</td></tr>
                )}
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-green-50">
                    <td className="p-2 border">{p.name}</td>
                    <td className="p-2 border">{p.category}</td>
                    <td className="p-2 border">₹{p.price}</td>
                    <td className="p-2 border">{p.quantity}</td>
                    <td className="p-2 border">{p.location}</td>
                    <td className="p-2 border space-x-2">
                      <button onClick={() => { setEditProduct(p); setShowForm(true); }} className="px-2 py-1 bg-yellow-400 text-white rounded">Edit</button>
                      <button onClick={() => handleDelete(p._id)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        {/* Orders section can be implemented here */}
      </div>
    </div>
  );
};

export default FarmerDashboard;
