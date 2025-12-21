"use client";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/app/store/authStore";
import { useRouter } from "next/navigation";
import { FaShoppingCart, FaHeart, FaBox, FaLeaf } from "react-icons/fa";
import Link from "next/link";
import ProductCard from "@/app/components/ProductCard";

const BuyerDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

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
    fetchFavorites();

    const onFavChange = () => fetchFavorites();
    window.addEventListener("krisi:favorites:changed", onFavChange);
    return () => window.removeEventListener("krisi:favorites:changed", onFavChange);
  }, [user, router]);

  const fetchFavorites = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/users/${user._id}/favorites`);
      if (!res.ok) throw new Error("Failed to fetch favorites");
      const serverFavs = await res.json();

      // Merge local favorites (product ids stored locally) that may not be on server
      let merged = serverFavs || [];
      try {
        const localIds = JSON.parse(localStorage.getItem("krisi_favs") || "[]");
        const missing = (Array.isArray(localIds) ? localIds : []).filter((id) => !merged.find((p) => p._id === id));
        if (missing.length > 0) {
          const allRes = await fetch("/api/products");
          if (allRes.ok) {
            const all = await allRes.json();
            const extra = all.filter((p) => missing.includes(p._id));
            merged = [...merged, ...extra];
          }
        }
      } catch (e) {
        // ignore localStorage parse errors
      }

      setFavorites(merged);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      // TODO: Fetch user orders from backend
      setOrders([]);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
              <p className="text-gray-500 text-sm">Cart Items</p>
              <p className="text-3xl font-bold text-blue-700">0</p>
            </div>
            <FaShoppingCart className="text-4xl text-blue-200" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Wishlist</p>
              <p className="text-3xl font-bold text-red-700">0</p>
            </div>
            <FaHeart className="text-4xl text-red-200" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Saved Items</p>
              <p className="text-3xl font-bold text-yellow-700">{favorites.length}</p>
            </div>
            <FaLeaf className="text-4xl text-yellow-200" />
          </div>
        </div>
      </div>

      {/* Orders Section */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b p-6">
          <h2 className="text-2xl font-bold text-green-700">
            <FaBox className="inline mr-2" /> My Orders
          </h2>
        </div>

        <div className="p-6">
            <div>
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-4">No orders yet</p>
                  <Link
                    href="/marketplace"
                    className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order._id} className="border rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-lg text-gray-800">Order #{order._id}</p>
                          <p className="text-gray-500 text-sm">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className="bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-semibold">
                          {order.status || "Processing"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
       
        </div>
      </div>

      {/* Favorites Section */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b p-6">
          <h2 className="text-2xl font-bold text-yellow-700">
            <FaHeart className="inline mr-2 text-red-600" /> Saved Items
          </h2>
        </div>
        <div className="p-6">
          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">You haven't saved any products yet.</p>
              <Link href="/marketplace" className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold mt-4">Browse Marketplace</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {favorites.map((p) => (
                <ProductCard
                  key={p._id}
                  product={p}
                  onToggleFavorite={(id, favs) => {
                    // if user unfavorited, remove from favorites list
                    const me = user._id?.toString();
                    const stillFavorited = (favs || []).find((u) => u.toString() === me);
                    if (!stillFavorited) setFavorites((prev) => prev.filter((x) => x._id !== id));
                    else setFavorites((prev) => prev.map((x) => (x._id === id ? { ...x, favorites: favs } : x)));
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;