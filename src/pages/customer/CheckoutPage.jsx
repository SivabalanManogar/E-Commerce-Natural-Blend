import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Truck, CheckCircle2, ShieldCheck, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { createOrder } from '../../services/orderService';

export default function CheckoutPage() {
  const {
    cartItems,
    cartCount,
    productTotal,
    totalWeightGrams,
    deliveryCharge,
    grandTotal,
    clearCart
  } = useCart();

  const { isCustomerLoggedIn, customerUser, customerProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect unauthenticated customers to /login
  useEffect(() => {
    if (!isCustomerLoggedIn) {
      navigate('/login', { state: { from: '/checkout' }, replace: true });
    }
  }, [isCustomerLoggedIn, navigate]);

  const [formData, setFormData] = useState({
    customerName: customerProfile?.displayName || customerUser?.displayName || '',
    phone: customerProfile?.phoneNumber || '',
    address: customerProfile?.address || '',
    city: customerProfile?.city || 'Karaikudi',
    state: customerProfile?.state || 'Tamil Nadu',
    pincode: customerProfile?.pincode || '630001'
  });

  // Pre-fill profile data when customer profile loads
  useEffect(() => {
    if (customerProfile || customerUser) {
      setFormData(prev => ({
        ...prev,
        customerName: prev.customerName || customerProfile?.displayName || customerUser?.displayName || '',
        phone: prev.phone || customerProfile?.phoneNumber || '',
        address: prev.address || customerProfile?.address || '',
        city: prev.city || customerProfile?.city || 'Karaikudi',
        state: prev.state || customerProfile?.state || 'Tamil Nadu',
        pincode: prev.pincode || customerProfile?.pincode || '630001'
      }));
    }
  }, [customerProfile, customerUser]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);

  if (cartItems.length === 0 && !placedOrder) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500">Please add products to your cart before proceeding to checkout.</p>
        <Link to="/products" className="inline-block bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl">
          Return to Shop
        </Link>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
  };

  const authenticatedEmail = customerUser?.email || customerProfile?.email || '';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!formData.address.trim()) {
      setErrorMessage('Please enter your delivery street address.');
      return;
    }
    if (!formData.city.trim()) {
      setErrorMessage('Please enter your city.');
      return;
    }
    if (!formData.state.trim()) {
      setErrorMessage('Please enter your state.');
      return;
    }
    if (!formData.pincode.trim()) {
      setErrorMessage('Please enter your postal pincode.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const orderPayload = {
        customerUid: customerUser.uid,
        customerName: formData.customerName.trim(),
        email: authenticatedEmail,
        phone: formData.phone.trim() || authenticatedEmail,
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        items: cartItems,
        productTotal,
        totalWeight: totalWeightGrams,
        deliveryCharge,
        grandTotal
      };

      const newOrder = await createOrder(orderPayload);
      clearCart();
      setPlacedOrder(newOrder);
    } catch (err) {
      console.error('Failed to place order:', err);
      setErrorMessage('Something went wrong while placing your order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formattedWeight = totalWeightGrams >= 1000
    ? `${(totalWeightGrams / 1000).toFixed(2)} kg`
    : `${totalWeightGrams} g`;

  // Order Confirmation View
  if (placedOrder) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6 animate-fade-in text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className="bg-emerald-50 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-200">
            Order Placed Successfully 🎉
          </span>
          <h1 className="text-3xl font-black text-slate-900">Thank You, {placedOrder.customerName}!</h1>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Your order <strong className="text-emerald-800 font-bold">{placedOrder.orderId}</strong> has been saved and linked to your account.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs text-left text-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <span className="text-slate-400 block">Order ID</span>
              <strong className="text-base text-slate-900">{placedOrder.orderId}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-right">Grand Total</span>
              <strong className="text-base text-emerald-950">₹{placedOrder.grandTotal}</strong>
            </div>
          </div>

          <div className="space-y-1">
            <strong className="text-slate-800 block">Delivery Address:</strong>
            <p className="text-slate-600">{placedOrder.customerName} ({placedOrder.email || placedOrder.phone})</p>
            <p className="text-slate-600">{placedOrder.address}, {placedOrder.city}, {placedOrder.state} - {placedOrder.pincode}</p>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <strong className="text-slate-800 block">Ordered Items ({placedOrder.items.length}):</strong>
            {placedOrder.items.map((it, idx) => (
              <div key={idx} className="flex justify-between text-slate-600">
                <span>{it.quantity}x {it.productName}</span>
                <span className="font-semibold text-slate-900">₹{it.priceAtPurchase * it.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/my-orders')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-3.5 rounded-2xl shadow-md transition-all"
          >
            Track My Order Status
          </button>
          <Link
            to="/products"
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-6 py-3.5 rounded-2xl transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <Link to="/cart" className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-emerald-700">
        <ArrowLeft className="w-4 h-4" /> Return to Cart
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Customer Information Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Delivery Information</h1>
              <p className="text-xs text-slate-500 mt-0.5">Shipping details for authenticated customer ({authenticatedEmail}).</p>
            </div>

            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="customerName"
                    required
                    placeholder="Enter your full name"
                    value={formData.customerName}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Enter contact number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Street Address *</label>
                <textarea
                  name="address"
                  required
                  rows={3}
                  placeholder="Door No, Street Name, Landmark..."
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State *</label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    value={formData.pincode}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl text-sm font-extrabold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Placing Order...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" /> PLACE ORDER — ₹{grandTotal}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6 sticky top-24">
            <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              Order Summary ({cartCount})
            </h2>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 text-xs divide-y divide-slate-100">
              {cartItems.map((item) => (
                <div key={item.id} className="pt-2 first:pt-0 flex justify-between items-center">
                  <div className="pr-2">
                    <p className="font-bold text-slate-900 line-clamp-1">{item.name}</p>
                    <p className="text-slate-500 text-[11px]">
                      {item.quantity} x ₹{item.price}
                    </p>
                  </div>
                  <span className="font-extrabold text-slate-900 shrink-0">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 text-xs border-t border-slate-100 pt-4">
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

            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Cash on Delivery Available
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
