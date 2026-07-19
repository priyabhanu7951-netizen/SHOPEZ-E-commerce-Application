import React, { useState, useEffect } from "react";
import { Product } from "../types";
import { ArrowLeft, PlusCircle, RefreshCw } from "lucide-react";

interface AdminNewProductProps {
  productToEdit: Product | null; // If null, we are in CREATE mode; otherwise EDIT mode
  onSuccess: () => void;
  onBack: () => void;
}

export default function AdminNewProduct({ productToEdit, onSuccess, onBack }: AdminNewProductProps) {
  const isEdit = !!productToEdit;

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mainImg, setMainImg] = useState("");
  const [img1, setImg1] = useState("");
  const [img2, setImg2] = useState("");
  const [img3, setImg3] = useState("");
  const [category, setCategory] = useState("Fashion");
  const [gender, setGender] = useState<"Men" | "Women" | "Unisex">("Unisex");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("0");
  const [sizes, setSizes] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Load product to edit
  useEffect(() => {
    if (productToEdit) {
      setTitle(productToEdit.title);
      setDescription(productToEdit.description);
      setMainImg(productToEdit.mainImg);
      setImg1(productToEdit.carousel?.[0] || "");
      setImg2(productToEdit.carousel?.[1] || "");
      setImg3(productToEdit.carousel?.[2] || "");
      setCategory(productToEdit.category);
      setGender(productToEdit.gender);
      setPrice(productToEdit.price.toString());
      setDiscount(productToEdit.discount.toString());
      setSizes(productToEdit.sizes || []);
    } else {
      // Clear fields for CREATE
      setTitle("");
      setDescription("");
      setMainImg("");
      setImg1("");
      setImg2("");
      setImg3("");
      setCategory("Fashion");
      setGender("Unisex");
      setPrice("");
      setDiscount("0");
      setSizes([]);
    }
  }, [productToEdit]);

  const handleSizeToggle = (sz: string) => {
    setSizes((prev) =>
      prev.includes(sz) ? prev.filter((s) => s !== sz) : [...prev, sz]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !mainImg || !price) {
      setErrorMsg("Please fill out all required fields!");
      return;
    }
    setErrorMsg("");
    setLoading(true);

    const carousel = [img1, img2, img3].filter(Boolean);
    const payload = {
      title,
      description,
      mainImg,
      carousel,
      sizes,
      category,
      gender,
      price: Number(price),
      discount: Number(discount),
    };

    const url = isEdit ? `/api/products/${productToEdit._id}` : "/api/products";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Save failed");
      }

      alert(isEdit ? "Product updated successfully!" : "Product added successfully!");
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred while saving the product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-16">
      
      {/* Breadcrumb back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Main card box with Admin dark style */}
      <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-xl shadow-lg text-white">
        
        <div className="border-b border-slate-800 pb-3 mb-6 text-center">
          <h2 className="text-xl font-black text-gray-50 uppercase tracking-wider">
            {isEdit ? "Update Product" : "New Product"}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isEdit ? "Modify catalog item properties." : "Add a fresh inventory listing item to the catalog."}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold p-3.5 rounded mb-5 text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Product name & Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-bold block">Product name</label>
              <input
                type="text"
                required
                placeholder="e.g. Iphone 12"
                className="w-full bg-slate-950 border border-slate-800 text-white rounded p-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-bold block">Product Description</label>
              <input
                type="text"
                required
                placeholder="Brief description about specifications..."
                className="w-full bg-slate-950 border border-slate-800 text-white rounded p-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Main image URL */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-bold block">Thumbnail Img url</label>
            <input
              type="url"
              required
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full bg-slate-950 border border-slate-800 text-white rounded p-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              value={mainImg}
              onChange={(e) => setMainImg(e.target.value)}
            />
          </div>

          {/* Additional Carousel items */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-bold block">Add on img1 url</label>
              <input
                type="url"
                placeholder="Optional carousel image 1"
                className="w-full bg-slate-950 border border-slate-800 text-white rounded p-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                value={img1}
                onChange={(e) => setImg1(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-bold block">Add on img2 url</label>
              <input
                type="url"
                placeholder="Optional carousel image 2"
                className="w-full bg-slate-950 border border-slate-800 text-white rounded p-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                value={img2}
                onChange={(e) => setImg2(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-bold block">Add on img3 url</label>
              <input
                type="url"
                placeholder="Optional carousel image 3"
                className="w-full bg-slate-950 border border-slate-800 text-white rounded p-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                value={img3}
                onChange={(e) => setImg3(e.target.value)}
              />
            </div>
          </div>

          {/* Category, Gender, Price, Discount */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-bold block">Category</label>
              <select
                className="w-full bg-slate-950 border border-slate-800 text-white rounded p-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Fashion">Fashion</option>
                <option value="Electronics">Electronics</option>
                <option value="Mobiles">Mobiles</option>
                <option value="Groceries">Groceries</option>
                <option value="Sports Equipments">Sports Equipments</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-bold block">Gender</label>
              <select
                className="w-full bg-slate-950 border border-slate-800 text-white rounded p-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
              >
                <option value="Unisex">Unisex</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-bold block">Price (₹)</label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 1699"
                className="w-full bg-slate-950 border border-slate-800 text-white rounded p-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-bold block">Discount (%)</label>
              <input
                type="number"
                min="0"
                max="99"
                placeholder="e.g. 23"
                className="w-full bg-slate-950 border border-slate-800 text-white rounded p-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>
          </div>

          {/* Sizes checkboxes */}
          <div className="space-y-2">
            <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Available Sizes / Varieties</span>
            <div className="flex gap-4">
              {["S", "M", "L", "XL", "Standard", "128GB", "256GB"].map((sz) => {
                const isChecked = sizes.includes(sz);
                return (
                  <label key={sz} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleSizeToggle(sz)}
                      className="w-4 h-4 text-indigo-500 border-slate-800 bg-slate-950 rounded"
                    />
                    <span>{sz}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onBack}
              className="py-2.5 px-6 border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold rounded text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-8 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              {loading && <RefreshCw size={13} className="animate-spin" />}
              {isEdit ? "Update product" : "Add product"}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
