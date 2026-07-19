import React, { useState, useEffect } from "react";
import { Product } from "../types";
import ProductCard from "../components/ProductCard";

interface ProductsPageProps {
  onSelectProduct: (product: Product) => void;
  selectedCategory: string; // pre-selected from landing
  searchQuery: string; // pre-set search from Navbar
}

export default function ProductsPage({
  onSelectProduct,
  selectedCategory,
  searchQuery,
}: ProductsPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [sortBy, setSortBy] = useState<string>("Popular");
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeGenders, setActiveGenders] = useState<string[]>([]);

  // Synchronize category selection from landing page
  useEffect(() => {
    if (selectedCategory) {
      setActiveCategories([selectedCategory]);
    } else {
      setActiveCategories([]);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, []);

  // Handle Category Toggle
  const handleCategoryToggle = (cat: string) => {
    setActiveCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // Handle Gender Toggle
  const handleGenderToggle = (gender: string) => {
    setActiveGenders((prev) =>
      prev.includes(gender) ? prev.filter((g) => g !== gender) : [...prev, gender]
    );
  };

  // Filter & Sort Logic
  const getFilteredAndSortedProducts = () => {
    let list = [...products];

    // 1. Filter by Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // 2. Filter by Categories
    if (activeCategories.length > 0) {
      list = list.filter((p) => {
        // Map Sports Equipments elegantly
        const matchesCategory = activeCategories.some((cat) => {
          if (cat.toLowerCase() === "sports-equipment" || cat.toLowerCase() === "sports equipments") {
            return p.category.toLowerCase().startsWith("sport");
          }
          return p.category.toLowerCase() === cat.toLowerCase();
        });
        return matchesCategory;
      });
    }

    // 3. Filter by Gender
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
        // "Popular" -> default order / _id order
        return a._id.localeCompare(b._id);
      }
    });

    return list;
  };

  const filteredProducts = getFilteredAndSortedProducts();

  return (
    <div className="flex flex-col md:flex-row gap-8 animate-fade-in pb-16">
      
      {/* Sidebar Filters */}
      <div className="w-full md:w-64 bg-white border border-gray-100 p-6 rounded-lg shadow-sm h-fit shrink-0">
        <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">
          Filters
        </h3>

        {/* Sort By Section */}
        <div className="space-y-3 mb-6">
          <h4 className="text-xs font-bold text-gray-400 tracking-wider uppercase">Sort By</h4>
          <div className="space-y-2">
            {["Popular", "Price (low to high)", "Price (high to low)", "Discount"].map((opt) => (
              <label key={opt} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer select-none">
                <input
                  type="radio"
                  name="sortBy"
                  checked={sortBy === opt}
                  onChange={() => setSortBy(opt)}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Categories Checkbox List */}
        <div className="space-y-3 mb-6">
          <h4 className="text-xs font-bold text-gray-400 tracking-wider uppercase">Categories</h4>
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
                <label key={cat.label} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleCategoryToggle(cat.value)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span>{cat.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Gender Checkboxes */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-400 tracking-wider uppercase">Gender</h4>
          <div className="space-y-2">
            {["Men", "Women", "Unisex"].map((g) => {
              const isChecked = activeGenders.includes(g);
              return (
                <label key={g} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleGenderToggle(g)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span>{g}</span>
                </label>
              );
            })}
          </div>
        </div>

      </div>

      {/* Products Grid Column */}
      <div className="flex-grow space-y-6">
        <div className="flex items-baseline justify-between border-b border-gray-50 pb-3">
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
            {searchQuery ? `Search Results for "${searchQuery}"` : "All Products"}
          </h2>
          <span className="text-xs font-semibold text-gray-500">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? "item" : "items"}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-100 animate-pulse h-72 rounded-lg"></div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 border border-dashed border-gray-200 rounded-lg max-w-lg mx-auto">
            <p className="text-gray-500 font-medium">No products found matching the criteria.</p>
            <button
              onClick={() => {
                setActiveCategories([]);
                setActiveGenders([]);
                setSortBy("Popular");
              }}
              className="mt-3 text-sm font-bold text-indigo-600 hover:text-indigo-800"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((prod) => (
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
