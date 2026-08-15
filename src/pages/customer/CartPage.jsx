import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Truck, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function CartPage() {
  const {
    cartItems,
    cartCount,
    productTotal,
    totalWeightGrams,
    deliveryCharge,
    grandTotal,
    updateQuantity,
    removeFromCart,
    clearCart
  } = useCart();

  const navigate = useNavigate();

  // Format display weight in kg or g
  const formattedWeight = totalWeightGrams >= 1000
    ? `${(totalWeightGrams / 1000).toFixed(2)} kg`
    : `${totalWeightGrams} g`;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900">Your cart is empty</h2>
          <p className="text-xs text-slate-500">
            Looks like you haven't added any products to your cart yet.
          </p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-3 rounded-full transition-all shadow-md"
        >
          Continue Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Shopping Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review your order items, shipping weight, and calculated delivery charge.
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Cart Item List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => {
            const itemTotal = item.price * item.quantity;
            const itemWeight = item.shippingWeightGrams ? (item.shippingWeightGrams * item.quantity) : 0;
            const itemWeightLabel = itemWeight >= 1000 ? `${(itemWeight / 1000).toFixed(2)} kg` : `${itemWeight} g`;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img
                    src={item.imageUrl || '/images/products/placeholder.png'}
                    alt={item.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-contain bg-slate-50 rounded-xl p-2 border border-slate-100 shrink-0"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/200x200/e2e8f0/1e293b?text=Product';
                    }}
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Unit Price: <span className="font-bold text-slate-800">₹{item.price}</span>
                      {item.displayQuantity && (
                        <span> ({item.displayQuantity}{item.displayUnit === 'units' ? ' Pack' : item.displayUnit})</span>
                      )}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                      Shipping Weight: {itemWeightLabel}
                    </p>
                  </div>
                </div>

                {/* Controls & Price */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* Quantity selector */}
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 hover:bg-white text-slate-600 rounded-lg transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 font-extrabold text-slate-900 text-xs">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 hover:bg-white text-slate-600 rounded-lg transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">Subtotal</span>
                    <span className="text-base font-extrabold text-emerald-950">₹{itemTotal}</span>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Remove product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary & Delivery calculation card */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6 sticky top-24">
            <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Product Total</span>
                <span className="font-bold text-slate-900">₹{productTotal}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Total Shipping Weight</span>
                <span className="font-bold text-slate-900">{formattedWeight}</span>
              </div>

              <div className="flex justify-between text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 font-bold">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" /> Delivery Charge
                </span>
                <span>₹{deliveryCharge}</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-sm font-extrabold text-slate-900">Grand Total</span>
                <span className="text-2xl font-black text-emerald-950">₹{grandTotal}</span>
              </div>
            </div>

            {/* Delivery rule explanation note */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 leading-tight space-y-1">
              <p className="font-bold text-slate-800">Delivery Charge Formula:</p>
              <p>• Up to 1kg (1000g) = ₹50</p>
              <p>• Above 1kg = ₹50 + ₹20 per additional 500g (or part of 500g)</p>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl text-sm font-extrabold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
