import React, { useState, useEffect } from "react";
import { AdminSettings, Product } from "../types";
import ProductCard from "../components/ProductCard";

interface LandingPageProps {
  onSelectCategory: (category: string) => void;
  onSelectProduct: (product: Product) => void;
}

export default function LandingPage({ onSelectCategory, onSelectProduct }: LandingPageProps) {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch banner and categories
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch((err) => console.error("Error loading settings:", err));

    // Fetch products
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        // Just show 4 featured products
        setFeaturedProducts(data.slice(0, 4));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading products:", err);
        setLoading(false);
      });
  }, []);

  // Static images mapping for category cards to make them match the mock exactly
  const categoryImages: Record<string, string> = {
    Fashion: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&auto=format&fit=crop&q=80",
    Electronics: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400&auto=format&fit=crop&q=80",
    Mobiles: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80",
    Groceries: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80",
    "Sports Equipments": "https://images.unsplash.com/photo-1531415080290-bc9854593f6f?w=400&auto=format&fit=crop&q=80",
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Banner / Hero Slider */}
      {settings?.banner ? (
        <div className="relative w-full rounded-xl overflow-hidden shadow-lg border border-gray-100 aspect-[3/1] bg-gray-50">
          <img
            src={settings.banner}
            alt="Promotion Banner"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/10 flex items-center p-6 sm:p-12">
            <div className="text-white max-w-md space-y-2 drop-shadow-md">
              <span className="bg-red-500 text-xs uppercase font-extrabold px-2.5 py-1 rounded">
                Super Sale
              </span>
              <h1 className="text-xl sm:text-3xl font-black tracking-tight leading-tight uppercase">
                Up to 50% Off Everything!
              </h1>
              <p className="text-xs sm:text-sm text-gray-100 font-medium">
                Find incredible discounts on top electronics, fashion items, and essentials.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-48 sm:h-64 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center">
          <span className="text-indigo-600 animate-pulse font-medium">Loading banner...</span>
        </div>
      )}

      {/* Categories Circle Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
          Shop by Categories
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {(settings?.categories || ["Fashion", "Electronics", "Mobiles", "Groceries", "Sports Equipments"]).map((cat) => (
            <div
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md hover:border-indigo-100 transition-all duration-300 group"
              id={`category-${cat.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div className="w-24 h-24 rounded-full overflow-hidden mb-3 bg-gray-50 flex items-center justify-center border-2 border-transparent group-hover:border-indigo-500 transition-colors">
                <img
                  src={categoryImages[cat] || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=150"}
                  alt={cat}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-sm font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
                {cat}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Featured/Hot products */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">
            Top Deals on ShopEZ
          </h2>
          <button 
            onClick={() => onSelectCategory("")}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            See All Products
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-100 animate-pulse h-64 rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map((prod) => (
              <ProductCard
                key={prod._id}
                product={prod}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
