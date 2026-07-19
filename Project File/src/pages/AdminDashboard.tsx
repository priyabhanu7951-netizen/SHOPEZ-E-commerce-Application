import React, { useState, useEffect } from "react";
import { User, Product, Order } from "../types";
import { Users, ShoppingBag, ClipboardList, PlusCircle, LayoutGrid } from "lucide-react";

interface AdminDashboardProps {
  currentUser: User | null;
  onNavigate: (page: string) => void;
}

export default function AdminDashboard({ currentUser, onNavigate }: AdminDashboardProps) {
  const [stats, setStats] = useState({
    usersCount: 0,
    productsCount: 0,
    ordersCount: 0,
  });
  const [bannerUrl, setBannerUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchStats = async () => {
    try {
      const [resUsers, resProducts, resOrders, resSettings] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/products"),
        fetch("/api/orders"),
        fetch("/api/admin/settings"),
      ]);

      const users = await resUsers.json();
      const products = await resProducts.json();
      const orders = await resOrders.json();
      const settings = await resSettings.json();

      setStats({
        usersCount: users.length,
        productsCount: products.length,
        ordersCount: orders.length,
      });

      if (settings && settings.banner) {
        setBannerUrl(settings.banner);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching admin stats:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleUpdateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerUrl) return;
    setSuccessMsg("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banner: bannerUrl }),
      });
      if (res.ok) {
        setSuccessMsg("Promotional banner URL updated successfully!");
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        alert("Failed to update banner.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-400 animate-pulse font-medium">Loading Dashboard KPI Stats...</div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in pb-16">
      
      {/* Intro Header */}
      <div className="border-b border-gray-50 pb-3 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">
            ShopEZ Admin Console
          </h2>
          <p className="text-xs text-gray-400 mt-1">Configure catalogs, manage user orders, and modify homepage content.</p>
        </div>
        <span className="text-xs font-bold text-gray-400 bg-gray-100 border px-3 py-1 rounded">
          Logged as Admin
        </span>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Users */}
        <div className="bg-slate-800 text-white border border-slate-700 rounded-xl p-6 flex flex-col justify-between space-y-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Total users</span>
              <p className="text-3xl font-black">{stats.usersCount}</p>
            </div>
            <Users size={24} className="text-indigo-400" />
          </div>
          <button
            onClick={() => onNavigate("admin-users")}
            className="w-full py-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded text-xs font-semibold text-slate-200 transition-colors"
          >
            View all
          </button>
        </div>

        {/* Products */}
        <div className="bg-slate-800 text-white border border-slate-700 rounded-xl p-6 flex flex-col justify-between space-y-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">All Products</span>
              <p className="text-3xl font-black">{stats.productsCount}</p>
            </div>
            <LayoutGrid size={24} className="text-amber-400" />
          </div>
          <button
            onClick={() => onNavigate("admin-products")}
            className="w-full py-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded text-xs font-semibold text-slate-200 transition-colors"
          >
            View all
          </button>
        </div>

        {/* Orders */}
        <div className="bg-slate-800 text-white border border-slate-700 rounded-xl p-6 flex flex-col justify-between space-y-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">All Orders</span>
              <p className="text-3xl font-black">{stats.ordersCount}</p>
            </div>
            <ClipboardList size={24} className="text-emerald-400" />
          </div>
          <button
            onClick={() => onNavigate("admin-orders")}
            className="w-full py-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded text-xs font-semibold text-slate-200 transition-colors"
          >
            View all
          </button>
        </div>

        {/* Add Product */}
        <div className="bg-slate-800 text-white border border-slate-700 rounded-xl p-6 flex flex-col justify-between space-y-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Add Product</span>
              <p className="text-sm font-semibold text-slate-400 mt-2">(new)</p>
            </div>
            <PlusCircle size={24} className="text-blue-400" />
          </div>
          <button
            onClick={() => onNavigate("admin-new-product")}
            className="w-full py-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded text-xs font-semibold text-slate-200 transition-colors"
          >
            Add now
          </button>
        </div>

      </div>

      {/* Banner management */}
      <div className="bg-slate-800 border border-slate-700 p-6 md:p-8 rounded-xl shadow-md text-white max-w-xl">
        <h3 className="text-base font-black text-gray-50 border-b border-slate-700 pb-3 mb-5">
          Update banner
        </h3>

        {successMsg && (
          <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold p-3.5 rounded mb-4 text-center">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleUpdateBanner} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-bold block">Banner url</label>
            <input
              type="url"
              required
              placeholder="Enter promotional banner image URL"
              className="w-full bg-slate-950 border border-slate-700 text-white rounded p-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="py-2.5 px-6 border border-amber-600 hover:bg-amber-600/10 text-amber-500 font-bold rounded text-xs transition-all"
            >
              Update
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
