import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Check, Info } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const isOutOfStock = product.stockQuantity !== undefined && Number(product.stockQuantity) <= 0;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  // Format net quantity e.g. 500g or 4 units
  const quantityLabel = product.displayQuantity && product.displayUnit
    ? `${product.displayQuantity}${product.displayUnit === 'units' ? ' Pack' : product.displayUnit}`
    : '';

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group">

      {/* Product Image & Badges */}
      <Link to={`/product/${product.id}`} className="block relative aspect-square bg-slate-50 overflow-hidden">
        <img
          src={product.imageUrl || '/images/products/placeholder.png'}
          alt={product.name}
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://placehold.co/400x400/e2e8f0/1e293b?text=Natural+Blend';
          }}
        />

        {/* Category Badge */}
        <span className="absolute top-2.5 left-2.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
          {product.category || 'Natural'}
        </span>

        {/* Stock Badge */}
        {isOutOfStock ? (
          <span className="absolute top-2.5 right-2.5 bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
            Out of Stock
          </span>
        ) : (
          <span className="absolute top-2.5 right-2.5 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            In Stock
          </span>
        )}
      </Link>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <Link to={`/product/${product.id}`} className="block">
            <h3 className="text-sm font-bold text-slate-900 line-clamp-2 hover:text-emerald-700 transition-colors leading-snug">
              {product.name}
            </h3>
          </Link>

          {quantityLabel && (
            <p className="text-xs font-semibold text-slate-500 mt-1">
              Net Qty: <span className="text-slate-700">{quantityLabel}</span>
            </p>
          )}
        </div>

        {/* Price & Add to Cart button */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Price</span>
            <span className="text-base sm:text-lg font-extrabold text-emerald-900">
              ₹{product.price}
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${added
                ? 'bg-emerald-800 text-white'
                : isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
              }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added!
              </>
            ) : isOutOfStock ? (
              'Unavailable'
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
