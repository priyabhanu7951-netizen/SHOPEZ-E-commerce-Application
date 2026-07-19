import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Product } from "./types";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AuthPage from "./pages/AuthPage";
import UserProfile from "./pages/UserProfile";
import CartPage from "./pages/CartPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminOrders from "./pages/AdminOrders";
import AdminProducts from "./pages/AdminProducts";
import AdminNewProduct from "./pages/AdminNewProduct";

export default function App() {
  // Authentication & session state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("shopez_user");
    return saved ? JSON.parse(saved) : null;
  });

  // Navigation states
  const [currentPage, setCurrentPage] = useState<string>(() => {
    const savedUser = localStorage.getItem("shopez_user");
    if (savedUser) {
      const parsed: User = JSON.parse(savedUser);
      return parsed.usertype === "Admin" ? "admin-dashboard" : "landing";
    }
    return "landing";
  });

  // Parameter passing states
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Cart Badge Counter State
  const [cartCount, setCartCount] = useState<number>(0);

  // Sync Cart badge
  const refreshCartCount = async () => {
    if (!currentUser || currentUser.usertype === "Admin") {
      setCartCount(0);
      return;
    }
    try {
      const res = await fetch(`/api/cart?userId=${currentUser._id}`);
      if (res.ok) {
        const cartItems = await res.json();
        const totalItems = cartItems.reduce((acc: number, item: any) => acc + item.quantity, 0);
        setCartCount(totalItems);
      }
    } catch (err) {
      console.error("Failed to fetch cart count:", err);
    }
  };

  useEffect(() => {
    refreshCartCount();
  }, [currentUser]);

  // Auth actions
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("shopez_user", JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("shopez_user");
    setCartCount(0);
    setCurrentPage("landing");
  };

  // Cart Add action
  const handleAddToCart = async (product: Product, size: string, quantity: number) => {
    if (!currentUser) {
      alert("Please log in to add products to your cart!");
      setCurrentPage("auth");
      return;
    }

    const payload = {
      userId: currentUser._id,
      title: product.title,
      description: product.description,
      mainImg: product.mainImg,
      size,
      quantity,
      price: product.price,
      discount: product.discount,
    };

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(`Successfully added ${quantity}x ${product.title} (${size}) to your cart!`);
        refreshCartCount();
        setCurrentPage("cart");
      } else {
        alert("Could not add item to cart.");
      }
    } catch (err) {
      console.error("Cart addition failure:", err);
    }
  };

  // Page Routing Switch
  const renderActivePage = () => {
    switch (currentPage) {
      case "landing":
        return (
          <LandingPage
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setSearchQuery(""); // clear search query on category click
              setCurrentPage("products");
            }}
            onSelectProduct={(prod) => {
              setSelectedProduct(prod);
              setCurrentPage("product-detail");
            }}
          />
        );

      case "products":
        return (
          <ProductsPage
            onSelectProduct={(prod) => {
              setSelectedProduct(prod);
              setCurrentPage("product-detail");
            }}
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
          />
        );

      case "product-detail":
        if (!selectedProduct) {
          setCurrentPage("products");
          return null;
        }
        return (
          <ProductDetailPage
            product={selectedProduct}
            currentUser={currentUser}
            onBack={() => setCurrentPage("products")}
            onAddToCart={handleAddToCart}
            onNavigate={setCurrentPage}
          />
        );

      case "auth":
        return (
          <AuthPage
            onAuthSuccess={handleLoginSuccess}
            onNavigate={setCurrentPage}
          />
        );

      case "profile":
        return (
          <UserProfile
            currentUser={currentUser}
            onLogout={handleLogout}
            onNavigate={setCurrentPage}
          />
        );

      case "cart":
        return (
          <CartPage
            currentUser={currentUser}
            onNavigate={setCurrentPage}
            onRefreshCartCount={refreshCartCount}
          />
        );

      // --- Admin Pages ---
      case "admin-dashboard":
        return (
          <AdminDashboard
            currentUser={currentUser}
            onNavigate={setCurrentPage}
          />
        );

      case "admin-users":
        return <AdminUsers />;

      case "admin-orders":
        return <AdminOrders />;

      case "admin-products":
        return (
          <AdminProducts
            onEditProduct={(prod) => {
              setProductToEdit(prod);
              setCurrentPage("admin-new-product");
            }}
            searchQuery={searchQuery}
          />
        );

      case "admin-new-product":
        return (
          <AdminNewProduct
            productToEdit={productToEdit}
            onSuccess={() => {
              setProductToEdit(null);
              setCurrentPage("admin-products");
            }}
            onBack={() => {
              setProductToEdit(null);
              setCurrentPage("admin-dashboard");
            }}
          />
        );

      default:
        return <div className="text-center py-12 text-gray-500">Page not found.</div>;
    }
  };

  const handleGlobalSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedCategory(""); // Reset category when searching
    if (currentUser?.usertype === "Admin") {
      setCurrentPage("admin-products");
    } else {
      setCurrentPage("products");
    }
  };

  const handleNavigationChange = (page: string) => {
    // Clean up category/query states unless going between catalogs
    if (page !== "products" && page !== "admin-products") {
      setSelectedCategory("");
      setSearchQuery("");
    }
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans antialiased text-gray-900" id="shopez-root-layout">
      
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        cartCount={cartCount}
        onNavigate={handleNavigationChange}
        currentPage={currentPage}
        onLogout={handleLogout}
        onSearch={handleGlobalSearch}
      />

      {/* Main Content Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full"
          >
            {renderActivePage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 text-center text-xs text-gray-400 font-medium shrink-0">
        <p>© 2026 ShopEZ Incorporated. All rights reserved. Operating under Secure SSL-AES Encrypted Gateways.</p>
      </footer>

    </div>
  );
}
