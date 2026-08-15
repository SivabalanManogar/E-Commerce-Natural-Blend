import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShoppingBag,
  Check,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Leaf,
  Plus,
  Minus,
  Info,
  Clock,
  Building,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { getProductById } from '../../services/productService';
import { useCart } from '../../context/CartContext';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const prod = await getProductById(id);
        setProduct(prod);
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 animate-pulse space-y-6">
        <div className="h-6 w-32 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-80 bg-slate-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4" />
            <div className="h-6 bg-slate-200 rounded w-1/4" />
            <div className="h-24 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-xs text-slate-500">The product you are looking for might have been moved or removed from our catalog.</p>
        <Link to="/products" className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors">
          Browse All Products
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stockQuantity !== undefined && Number(product.stockQuantity) <= 0;
  const maxStock = product.stockQuantity !== undefined ? Number(product.stockQuantity) : 99;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const quantityLabel = product.displayQuantity && product.displayUnit
    ? `${product.displayQuantity}${product.displayUnit === 'units' ? ' Pack' : product.displayUnit}`
    : '';

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Back Link */}
      <Link
        to="/products"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to All Products
      </Link>

      {/* Main Details Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

        {/* Left Column: Image */}
        <div className="bg-slate-50 rounded-2xl p-6 flex items-center justify-center border border-slate-100 relative min-h-[300px]">
          <img
            src={product.imageUrl || '/images/products/placeholder.png'}
            alt={product.name}
            className="w-full max-h-96 object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/500x500/e2e8f0/1e293b?text=Natural+Blend';
            }}
          />
          <span className="absolute top-4 left-4 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
            {product.category || 'Natural Care'}
          </span>
        </div>

        {/* Right Column: Key Details & Purchasing */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {product.name}
            </h1>

            {quantityLabel && (
              <p className="text-xs font-bold text-slate-500">
                Net Content: <span className="text-slate-800 font-semibold">{quantityLabel}</span>
              </p>
            )}

            {/* Price & Stock */}
            <div className="pt-2 flex items-center justify-between border-y border-slate-100 py-3">
              <div>
                <span className="text-xs text-slate-400 font-medium block">Price (Inclusive of taxes)</span>
                <span className="text-3xl font-black text-emerald-950">₹{product.price}</span>
              </div>

              <div>
                {isOutOfStock ? (
                  <span className="bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1.5 rounded-full border border-rose-200">
                    Out of Stock
                  </span>
                ) : (
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200">
                    In Stock ({product.stockQuantity || 'Available'})
                  </span>
                )}
              </div>
            </div>

            {/* Product Description */}
            {product.description && (
              <div className="text-xs text-slate-600 leading-relaxed pt-2">
                <h3 className="font-bold text-slate-900 text-sm mb-1">Product Description</h3>
                <p className="whitespace-pre-line">{product.description}</p>
              </div>
            )}
          </div>

          {/* Quantity Selector & Add to Cart */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-700">Quantity:</span>
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1.5 hover:bg-white text-slate-600 rounded-lg transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 font-bold text-slate-900 text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                    className="p-1.5 hover:bg-white text-slate-600 rounded-lg transition-colors"
                    disabled={quantity >= maxStock}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full py-3.5 rounded-2xl text-sm font-extrabold transition-all flex items-center justify-center gap-2 shadow-md ${added
                  ? 'bg-emerald-800 text-white'
                  : isOutOfStock
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-98'
                }`}
            >
              {added ? (
                <>
                  <Check className="w-5 h-5" /> Added to Cart!
                </>
              ) : isOutOfStock ? (
                'Currently Out of Stock'
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" /> Add {quantity} to Cart — ₹{product.price * quantity}
                </>
              )}
            </button>

            {/* Delivery Rule Info */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 text-[11px] text-emerald-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Standard shipping rate: <strong>₹50 for first 1kg</strong> (₹20 per additional 500g).
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Structured Sections (Only displaying non-empty fields) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Directions & Usage */}
        {product.directions && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-2">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-600" /> Directions for Use
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{product.directions}</p>
          </div>
        )}

        {/* Benefits */}
        {product.benefits && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-2">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-600" /> Benefits
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{product.benefits}</p>
          </div>
        )}

        {/* Ingredients */}
        {product.ingredients && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-2">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" /> Ingredients
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">{product.ingredients}</p>
          </div>
        )}

        {/* Storage Instructions */}
        {product.storage && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-2">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" /> Storage Instructions
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">{product.storage}</p>
          </div>
        )}

        {/* Manufacturer & Marketer Info */}
        {(product.manufacturer || product.marketer || product.shelfLife) && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-3 md:col-span-2">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-600" /> Manufacturing & Marketing Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
              {product.manufacturer && (
                <div>
                  <strong className="text-slate-800 block">Manufactured By:</strong>
                  <span>{product.manufacturer}</span>
                </div>
              )}

              {product.marketer && (
                <div>
                  <strong className="text-slate-800 block">Marketed By:</strong>
                  <span>{product.marketer}</span>
                </div>
              )}

              {product.shelfLife && (
                <div>
                  <strong className="text-slate-800 block">Shelf Life:</strong>
                  <span>{product.shelfLife}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        {product.disclaimer && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl md:col-span-2 flex items-start gap-2 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Disclaimer:</strong> {product.disclaimer}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
