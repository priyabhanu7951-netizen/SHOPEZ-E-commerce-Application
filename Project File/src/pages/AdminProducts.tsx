import React, { useState, useEffect } from "react";
import { Product } from "../types";
import ProductCard from "../components/ProductCard";

interface AdminProductsProps {
  onEditProduct: (product: Product) => void;
  searchQuery: string;
}

export default function AdminProducts({ onEditProduct, searchQuery }: AdminProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [sortBy, setSortBy] = useState<string>("Popular");
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeGenders, setActiveGenders] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching admin catalog:", err);
        setLoading(false);
      });
  }, []);

  const handleCategoryToggle = (cat: string) => {
    setActiveCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleGenderToggle = (gender: string) => {
    setActiveGenders((prev) =>
      prev.includes(gender) ? prev.filter((g) => g !== gender) : [...prev, gender]
    );
  };

  const getFilteredAndSorted = () => {
    let list = [...products];

    // 1. Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // 2. Categories
    if (activeCategories.length > 0) {
      list = list.filter((p) => {
        const matchesCategory = activeCategories.some((cat) => {
          if (cat.toLowerCase() === "sports-equipment" || cat.toLowerCase() === "sports equipments") {
            return p.category.toLowerCase().startsWith("sport");
          }
          return p.category.toLowerCase() === cat.toLowerCase();
        });
        return matchesCategory;
      });
    }

    // 3. Gender
    if (activeGenders.length > 0) {
      list = list.filter((p) => activeGenders.some((g) => p.gender.toLowerCase() === g.toLowerCase()));
    }

    // 4. Sort By
    list.sort((a, b) => {
      const aPrice = a.price - (a.price * a.discount) / 100;
      const bPrice = b.price - (b.price * b.discount) / 100;

      if (sortBy === "Price (low to high)") {
        return aPrice - bPrice;
      } else if (sortBy === "Price (high to low)") {
        return bPrice - aPrice;
      } else if (sortBy === "Discount") {
        return b.discount - a.discount;
      } else {
        return a._id.localeCompare(b._id);
      }
    });

    return list;
  };

  const filtered = getFilteredAndSorted();

  return (
    <div className="flex flex-col md:flex-row gap-8 animate-fade-in pb-16">
      
      {/* Sidebar Filters */}
      <div className="w-full md:w-64 bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-md text-white h-fit shrink-0">
        <h3 className="text-base font-black border-b border-slate-800 pb-3 mb-4 text-gray-50 uppercase tracking-wider">
          Filters
        </h3>

        {/* Sort By */}
        <div className="space-y-3 mb-6">
          <h4 className="text-xs font-bold text-slate-500 tracking-wider uppercase">Sort By</h4>
          <div className="space-y-2">
            {["Popular", "Price (low to high)", "Price (high to low)", "Discount"].map((opt) => (
              <label key={opt} className="flex items-center gap-2.5 text-sm text-slate-300 cursor-pointer select-none">
                <input
                  type="radio"
                  name="adminSortBy"
                  checked={sortBy === opt}
                  onChange={() => setSortBy(opt)}
                  className="w-4 h-4 text-indigo-500 border-slate-700 bg-slate-950"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3 mb-6">
          <h4 className="text-xs font-bold text-slate-500 tracking-wider uppercase">Categories</h4>
          <div className="space-y-2">
            {[
              { label: "mobiles", value: "Mobiles" },
              { label: "Electronics", value: "Electronics" },
              { label: "Sports-Equipment", value: "Sports Equipments" },
              { label: "Fashion", value: "Fashion" },
              { label: "Groceries", value: "Groceries" },
            ].map((cat) => {
              const isChecked = activeCategories.some(
                (c) => c.toLowerCase() === cat.label.toLowerCase() || c.toLowerCase() === cat.value.toLowerCase()
              );
              return (
                <label key={cat.label} className="flex items-center gap-2.5 text-sm text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleCategoryToggle(cat.value)}
                    className="w-4 h-4 text-indigo-500 border-slate-700 bg-slate-950 rounded"
                  />
                  <span>{cat.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Gender */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-500 tracking-wider uppercase">Gender</h4>
          <div className="space-y-2">
            {["Men", "Women", "Unisex"].map((g) => {
              const isChecked = activeGenders.includes(g);
              return (
                <label key={g} className="flex items-center gap-2.5 text-sm text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleGenderToggle(g)}
                    className="w-4 h-4 text-indigo-500 border-slate-700 bg-slate-950 rounded"
                  />
                  <span>{g}</span>
                </label>
              );
            })}
          </div>
        </div>

      </div>

      {/* Main Grid Grid */}
      <div className="flex-grow space-y-6">
        <div className="flex items-baseline justify-between border-b border-gray-100 pb-3">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">
            Inventory Catalog Products
          </h2>
          <span className="text-xs font-semibold text-gray-500">
            {filtered.length} products available
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 animate-pulse h-72 rounded-lg"></div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 border border-dashed rounded-lg max-w-lg mx-auto">
            <p className="text-gray-500 font-medium">No inventory items matched filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((prod) => (
              <ProductCard
                key={prod._id}
                product={prod}
                isAdminMode={true}
                onSelect={onEditProduct}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
