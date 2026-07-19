import React, { useState } from "react";
import { ShoppingCart, User as UserIcon, LogOut, Search, Settings, ShieldCheck } from "lucide-react";
import { User } from "../types";

interface NavbarProps {
  currentUser: User | null;
  cartCount: number;
  onNavigate: (page: string) => void;
  currentPage: string;
  onLogout: () => void;
  onSearch: (query: string) => void;
}

export default function Navbar({
  currentUser,
  cartCount,
  onNavigate,
  currentPage,
  onLogout,
  onSearch,
}: NavbarProps) {
  const [searchVal, setSearchVal] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchVal);
  };

  const isAdmin = currentUser?.usertype === "Admin";

  return (
    <nav className={`w-full text-white shadow-md ${isAdmin ? "bg-slate-900 border-b border-slate-800" : "bg-indigo-600"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <div 
            onClick={() => onNavigate(isAdmin ? "admin-dashboard" : "landing")}
            className="flex items-center cursor-pointer select-none gap-2 shrink-0"
            id="nav-logo"
          >
            <span className="text-2xl font-bold font-sans tracking-tight">
              ShopEZ {isAdmin && <span className="text-sm font-normal text-indigo-300 ml-1">(admin)</span>}
            </span>
          </div>

          {/* Search bar (only if not admin or on product listing context) */}
          <form 
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-lg relative"
            id="nav-search-form"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search Electronics, Fashion, mobiles, etc.,"
                className="w-full bg-white text-gray-900 pl-4 pr-10 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-600"
                id="search-btn"
              >
                <Search size={18} />
              </button>
            </div>
          </form>

          {/* Navigation Links & User Controls */}
          <div className="flex items-center gap-4 text-sm font-medium">
            {isAdmin ? (
              // Admin Links
              <div className="hidden md:flex items-center gap-5">
                <button
                  onClick={() => onNavigate("admin-dashboard")}
                  className={`hover:text-indigo-200 transition-colors ${currentPage === "admin-dashboard" ? "text-indigo-300 font-semibold underline underline-offset-4" : ""}`}
                >
                  Home
                </button>
                <button
                  onClick={() => onNavigate("admin-users")}
                  className={`hover:text-indigo-200 transition-colors ${currentPage === "admin-users" ? "text-indigo-300 font-semibold underline underline-offset-4" : ""}`}
                >
                  Users
                </button>
                <button
                  onClick={() => onNavigate("admin-orders")}
                  className={`hover:text-indigo-200 transition-colors ${currentPage === "admin-orders" ? "text-indigo-300 font-semibold underline underline-offset-4" : ""}`}
                >
                  Orders
                </button>
                <button
                  onClick={() => onNavigate("admin-products")}
                  className={`hover:text-indigo-200 transition-colors ${currentPage === "admin-products" ? "text-indigo-300 font-semibold underline underline-offset-4" : ""}`}
                >
                  Products
                </button>
                <button
                  onClick={() => onNavigate("admin-new-product")}
                  className={`hover:text-indigo-200 transition-colors ${currentPage === "admin-new-product" ? "text-indigo-300 font-semibold underline underline-offset-4" : ""}`}
                >
                  New Product
                </button>
              </div>
            ) : (
              // Customer / Guest Links
              <button
                onClick={() => onNavigate("products")}
                className={`hover:text-indigo-100 transition-colors ${currentPage === "products" ? "font-semibold underline underline-offset-4" : ""}`}
              >
                Products
              </button>
            )}

            {/* Mobile / General responsive spacer or indicators */}
            <div className="flex items-center gap-3">
              {currentUser ? (
                <>
                  {/* Cart icon for customers */}
                  {!isAdmin && (
                    <button
                      onClick={() => onNavigate("cart")}
                      className="relative p-1.5 rounded-full hover:bg-indigo-700 transition-colors flex items-center"
                      id="cart-icon-btn"
                    >
                      <ShoppingCart size={20} />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white font-bold text-xs w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                          {cartCount}
                        </span>
                      )}
                    </button>
                  )}

                  {/* Profile info / action */}
                  <button
                    onClick={() => onNavigate(isAdmin ? "admin-dashboard" : "profile")}
                    className="flex items-center gap-1.5 hover:bg-indigo-700 hover:bg-opacity-40 px-2.5 py-1.5 rounded-md transition-colors"
                    id="profile-nav-btn"
                  >
                    <UserIcon size={18} />
                    <span className="max-w-[100px] truncate">{currentUser.username}</span>
                  </button>

                  {/* Logout */}
                  <button
                    onClick={onLogout}
                    className="p-1.5 rounded-full hover:bg-red-700 hover:text-white transition-colors flex items-center"
                    title="Logout"
                    id="logout-btn"
                  >
                    <LogOut size={18} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => onNavigate("auth")}
                  className="bg-white text-indigo-600 px-4 py-1.5 rounded-md font-semibold hover:bg-indigo-50 transition-all text-sm shadow-sm"
                  id="nav-login-btn"
                >
                  Login
                </button>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Admin Mobile Menu Bar */}
      {isAdmin && (
        <div className="md:hidden bg-slate-800 px-4 py-2 flex items-center justify-around text-xs border-t border-slate-700">
          <button
            onClick={() => onNavigate("admin-dashboard")}
            className={currentPage === "admin-dashboard" ? "text-indigo-400 font-bold" : "text-gray-300"}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate("admin-users")}
            className={currentPage === "admin-users" ? "text-indigo-400 font-bold" : "text-gray-300"}
          >
            Users
          </button>
          <button
            onClick={() => onNavigate("admin-orders")}
            className={currentPage === "admin-orders" ? "text-indigo-400 font-bold" : "text-gray-300"}
          >
            Orders
          </button>
          <button
            onClick={() => onNavigate("admin-products")}
            className={currentPage === "admin-products" ? "text-indigo-400 font-bold" : "text-gray-300"}
          >
            Products
          </button>
          <button
            onClick={() => onNavigate("admin-new-product")}
            className={currentPage === "admin-new-product" ? "text-indigo-400 font-bold" : "text-gray-300"}
          >
            New Product
          </button>
        </div>
      )}
    </nav>
  );
}
