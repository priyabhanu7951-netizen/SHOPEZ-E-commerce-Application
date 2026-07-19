import React from "react";
import { Product } from "../types";

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  isAdminMode?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect, isAdminMode = false }) => {
  const discountAmount = (product.price * product.discount) / 100;
  const discountedPrice = Math.round(product.price - discountAmount);

  return (
    <div 
      className="bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full cursor-pointer group"
      onClick={() => onSelect(product)}
      id={`product-card-${product._id}`}
    >
      {/* Product Image */}
      <div className="relative aspect-square w-full bg-gray-50 overflow-hidden flex items-center justify-center">
        <img
          src={product.mainImg}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="object-contain h-full w-full p-2 group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // fallback image if broken url
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500";
          }}
        />
        {product.discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
            {product.discount}% OFF
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        <span className="text-xs text-indigo-600 font-semibold tracking-wider uppercase mb-1">
          {product.category}
        </span>
        
        <h3 className="text-sm font-bold text-gray-950 line-clamp-1 group-hover:text-indigo-600 transition-colors">
          {product.title}
        </h3>
        
        <p className="text-xs text-gray-500 mt-1 line-clamp-2 flex-grow">
          {product.description}
        </p>

        {/* Pricing */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-base font-extrabold text-gray-900">
            ₹{discountedPrice}
          </span>
          {product.discount > 0 && (
            <>
              <span className="text-xs text-gray-400 line-through">
                ₹{product.price}
              </span>
              <span className="text-xs text-red-500 font-medium">
                ({product.discount}% off)
              </span>
            </>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-3 border-t border-gray-50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className={`w-full py-2 px-4 rounded-md font-medium text-xs transition-all flex items-center justify-center ${
              isAdminMode 
                ? "bg-slate-800 text-white hover:bg-slate-700" 
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
            }`}
          >
            {isAdminMode ? "Update" : "Shop Now"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductCard;
