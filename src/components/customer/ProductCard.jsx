import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Check, Star, Zap, Eye } from 'lucide-react';
import { useCart } from '../../context/CartContext';

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
    
    // Direct buy without adding item to persistent cart
    const buyNowItem = {
      id: product.id,
      name: product.name,
      price: Number(product.price),
      displayQuantity: product.displayQuantity,
      displayUnit: product.displayUnit,
      shippingWeightGrams: product.shippingWeightGrams !== null && product.shippingWeightGrams !== undefined ? Number(product.shippingWeightGrams) : null,
      imageUrl: product.imageUrl,
      stockQuantity: product.stockQuantity !== undefined ? Number(product.stockQuantity) : 999,
      quantity: 1
    };
    
    navigate('/checkout', { state: { buyNowItem } });
  };

  return (
    <div className="glass-panel rounded-2xl border border-white/80 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group text-[#18231D]">

      {/* Product Image & Badges */}
      <Link to={`/product/${product.id}`} className="block relative aspect-square bg-white/70 overflow-hidden p-4">
        <img
          src={product.imageUrl || '/images/products/placeholder.png'}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://placehold.co/400x400/e2e8f0/1e293b?text=Natural+Blend';
          }}
        />

        {/* Category Badge */}
        <span className="absolute top-2.5 left-2.5 bg-white/85 text-[#173D2B] text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-[#173D2B]/10 shadow-xs backdrop-blur-md">
          {product.category || 'Natural'}
        </span>

        {/* Stock Badge */}
        {isOutOfStock ? (
          <span className="absolute top-2.5 right-2.5 bg-rose-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-xs">
            Out of Stock
          </span>
        ) : (
          <span className="absolute top-2.5 right-2.5 bg-[#246B45] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
            In Stock
          </span>
        )}
      </Link>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Flipkart Style Rating Pill */}
          <div className="flex items-center gap-1.5">
            <span className="bg-[#246B45] text-white text-[10px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-xs">
              {rating} <Star className="w-2.5 h-2.5 fill-white" />
            </span>
            <span className="text-[10px] font-bold text-[#65736A]">
              ({reviewsCount} reviews)
            </span>
          </div>

          <Link to={`/product/${product.id}`} className="block">
            <h3 className="text-xs sm:text-sm font-extrabold text-[#173D2B] line-clamp-2 hover:text-[#246B45] transition-colors leading-snug">
              {product.name}
            </h3>
          </Link>

          {quantityLabel && (
            <p className="text-[11px] font-medium text-[#65736A]">
              Net Qty: <span className="text-[#173D2B] font-bold">{quantityLabel}</span>
            </p>
          )}
        </div>

        {/* Price & Action Buttons */}
        <div className="pt-2 border-t border-[#173D2B]/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#65736A] font-bold">Price (Inclusive taxes)</span>
            <span className="text-base font-black text-[#173D2B]">
              ₹{product.price}
            </span>
          </div>

          {/* Action Buttons: Hide Add to Cart on mobile devices (< sm), show only Buy Product */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={handleAdd}
              disabled={isOutOfStock}
              className={`hidden sm:flex py-2 px-2 rounded-xl text-[11px] font-bold transition-all items-center justify-center gap-1 border border-[#173D2B]/15 shadow-xs ${
                added
                  ? 'bg-emerald-800 text-white'
                  : isOutOfStock
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200'
                    : 'bg-white hover:bg-[#EEF2EA] text-[#173D2B] active:scale-95'
              }`}
              title="Add to Cart"
            >
              {added ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5 text-[#246B45]" />}
              <span>{added ? 'Added' : 'Add to Cart'}</span>
            </button>

            <button
              onClick={handleBuyProduct}
              disabled={isOutOfStock}
              className={`w-full py-2.5 sm:py-2 px-2 rounded-xl text-[11px] font-extrabold transition-all flex items-center justify-center gap-1 shadow-xs ${
                isOutOfStock
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-[#246B45] hover:bg-[#173D2B] text-white active:scale-95'
              }`}
              title="Buy Product"
            >
              <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span>Buy Product</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
