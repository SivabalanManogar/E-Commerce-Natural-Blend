import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Check, Star, Zap, Eye } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { getProductPrimaryImage } from '../../services/productService';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const navigate = useNavigate();

  const isOutOfStock = product.stockQuantity !== undefined && Number(product.stockQuantity) <= 0;

  // Format net quantity e.g. 500g or 4 units
  const quantityLabel = product.displayQuantity && product.displayUnit
    ? `${product.displayQuantity}${product.displayUnit === 'units' ? ' Pack' : product.displayUnit}`
    : '';

  // Flipkart style rating calculation
  const rating = product.rating || (4.5 + (product.id ? (product.id.charCodeAt(0) % 5) * 0.1 : 0.3)).toFixed(1);
  const reviewsCount = product.reviewsCount || (42 + (product.id ? (product.id.charCodeAt(0) % 90) : 15));

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyProduct = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
    navigate('/checkout');
  };

  return (
    <div className="bg-white rounded-2xl border border-[#DCE6E0] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group text-[#17251F]">

      {/* Product Image & Badges */}
      <Link to={`/product/${product.id}`} className="block relative aspect-square bg-[#F8FAF6] overflow-hidden p-4">
        <img
          src={getProductPrimaryImage(product)}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://placehold.co/400x400/e2e8f0/1e293b?text=Natural+Blend';
          }}
        />

        {/* Category Badge */}
        <span className="absolute top-2.5 left-2.5 bg-white/90 text-[#0D4A35] text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-[#DCE6E0] shadow-xs backdrop-blur-md">
          {product.category || 'Natural'}
        </span>

        {/* Stock Badge */}
        {isOutOfStock ? (
          <span className="absolute top-2.5 right-2.5 bg-[#C94A4A] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-xs">
            Out of Stock
          </span>
        ) : (
          <span className="absolute top-2.5 right-2.5 bg-[#176B4D] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
            In Stock
          </span>
        )}
      </Link>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Flipkart Style Rating Pill */}
          <div className="flex items-center gap-1.5">
            <span className="bg-[#176B4D] text-white text-[10px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-xs">
              {rating} <Star className="w-2.5 h-2.5 fill-[#C89B3C] text-[#C89B3C]" />
            </span>
            <span className="text-[10px] font-bold text-[#64756D]">
              ({reviewsCount} reviews)
            </span>
          </div>

          <Link to={`/product/${product.id}`} className="block">
            <h3 className="text-xs sm:text-sm font-extrabold text-[#0D4A35] line-clamp-2 hover:text-[#176B4D] transition-colors leading-snug">
              {product.name}
            </h3>
          </Link>

          {quantityLabel && (
            <p className="text-[11px] font-medium text-[#64756D]">
              Net Qty: <span className="text-[#0D4A35] font-bold">{quantityLabel}</span>
            </p>
          )}
        </div>

        {/* Price & Single Buy Product Action Button */}
        <div className="pt-2 border-t border-[#DCE6E0] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#64756D] font-bold">Price (Inclusive taxes)</span>
            <span className="text-base font-black text-[#0D4A35]">
              ₹{product.price}
            </span>
          </div>

          {/* Full-width Buy Product Action Button */}
          <div className="pt-1">
            <button
              onClick={handleBuyProduct}
              disabled={isOutOfStock}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-xs active:scale-98 ${isOutOfStock
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-[#176B4D] hover:bg-[#0D4A35] text-white'
                }`}
              title="Buy Product"
            >
              <Zap className="w-4 h-4 fill-[#C89B3C] text-[#C89B3C]" />
              <span>Buy Product</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
