import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Truck, CheckCircle2, ShieldCheck, ArrowLeft, Loader2, AlertCircle, Zap, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { createOrder } from '../../services/orderService';
import { calculateDeliveryCharge } from '../../utils/delivery';

export default function CheckoutPage() {
  const {
    cartItems,
    addToCart,
    clearCart
  } = useCart();

  const { isCustomerLoggedIn, customerUser, customerProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if this is a direct "Buy Product" flow or cart checkout
  const buyNowItem = location.state?.buyNowItem;
  const isBuyNow = !!buyNowItem;
  const checkoutItems = isBuyNow ? [buyNowItem] : cartItems;

  const [addedToCart, setAddedToCart] = useState(false);

  const handleSaveToCart = () => {
    if (isBuyNow && buyNowItem) {
      addToCart(buyNowItem, buyNowItem.quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2500);
    }
  };

  // Compute live checkout metrics for active items
  const checkoutCount = checkoutItems.reduce((acc, item) => acc + item.quantity, 0);
  const checkoutProductTotal = checkoutItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const checkoutTotalWeightGrams = checkoutItems.reduce((acc, item) => {
    const weight = item.shippingWeightGrams ? (item.shippingWeightGrams * item.quantity) : 0;
    return acc + weight;
  }, 0);
  const checkoutDeliveryCharge = calculateDeliveryCharge(checkoutTotalWeightGrams);
  const checkoutGrandTotal = checkoutProductTotal + checkoutDeliveryCharge;

  // Redirect unauthenticated customers to /login
  useEffect(() => {
    if (!isCustomerLoggedIn) {
      navigate('/login', { state: { from: '/checkout' }, replace: true });
    }
  }, [isCustomerLoggedIn, navigate]);

  const [formData, setFormData] = useState({
    customerName: customerProfile?.displayName || customerUser?.displayName || '',
    phone: customerProfile?.phoneNumber || customerUser?.phoneNumber || '',
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
        phone: prev.phone || customerProfile?.phoneNumber || customerUser?.phoneNumber || '',
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

  if (checkoutItems.length === 0 && !placedOrder) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 font-sans text-[#18231D]">
        <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-[#173D2B]">No Items Selected for Checkout</h2>
        <p className="text-xs text-[#65736A]">Please select a product or add items to your cart before proceeding to checkout.</p>
        <Link to="/products" className="inline-block bg-[#246B45] hover:bg-[#173D2B] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors">
          Browse Products
        </Link>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
  };

  const scrollToError = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const authenticatedEmail = customerUser?.email || customerProfile?.email || '';

  const handleSubmit = async (e) => {
    e.preventDefault();

    const customerName = formData.customerName.trim();
    const phone = formData.phone.trim();
    const address = formData.address.trim();
    const city = formData.city.trim();
    const state = formData.state.trim();
    const pincode = formData.pincode.trim();

    // Mandatory Delivery Information Validation
    if (!customerName) {
      setErrorMessage('Please enter your full name for delivery.');
      scrollToError();
      return;
    }
    if (!phone) {
      setErrorMessage('Please enter your contact mobile/phone number. Phone number is strictly required for delivery.');
      scrollToError();
      return;
    }
    const cleanPhone = phone.replace(/[\s\-\+\(\)]/g, '');
    if (cleanPhone.length < 10 || !/^\d+$/.test(cleanPhone)) {
      setErrorMessage('Please enter a valid contact mobile/phone number (minimum 10 digits).');
      scrollToError();
      return;
    }
    if (!address) {
      setErrorMessage('Please enter your complete street delivery address.');
      scrollToError();
      return;
    }
    if (!city) {
      setErrorMessage('Please enter your delivery city.');
      scrollToError();
      return;
    }
    if (!state) {
      setErrorMessage('Please enter your delivery state.');
      scrollToError();
      return;
    }
    if (!pincode) {
      setErrorMessage('Please enter your 6-digit postal pincode.');
      scrollToError();
      return;
    }
    if (pincode.length < 6 || !/^\d+$/.test(pincode)) {
      setErrorMessage('Please enter a valid 6-digit postal pincode.');
      scrollToError();
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const orderPayload = {
        customerUid: customerUser?.uid || 'guest',
        customerName: customerName,
        email: authenticatedEmail,
        phone: phone,
        address: address,
        city: city,
        state: state,
        pincode: pincode,
        items: checkoutItems,
        productTotal: checkoutProductTotal,
        totalWeight: checkoutTotalWeightGrams,
        deliveryCharge: checkoutDeliveryCharge,
        grandTotal: checkoutGrandTotal
      };

      const newOrder = await createOrder(orderPayload);
      
      if (!isBuyNow) {
        clearCart();
      }

      setPlacedOrder(newOrder);
    } catch (err) {
      console.error('Failed to place order:', err);
      setErrorMessage('Something went wrong while placing your order. Please check your network and try again.');
      scrollToError();
    } finally {
      setSubmitting(false);
    }
  };

  const formattedWeight = checkoutTotalWeightGrams >= 1000
    ? `${(checkoutTotalWeightGrams / 1000).toFixed(2)} kg`
    : `${checkoutTotalWeightGrams} g`;

  // Order Confirmation View
  if (placedOrder) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6 animate-fade-in text-center font-sans text-[#18231D]">
        <div className="w-20 h-20 bg-emerald-100 text-[#246B45] rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className="bg-emerald-50 text-[#173D2B] text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-200">
            Order Placed Successfully 🎉
          </span>
          <h1 className="text-3xl font-black text-[#173D2B]">Thank You, {placedOrder.customerName}!</h1>
          <p className="text-xs text-[#65736A] max-w-md mx-auto">
            Your order <strong className="text-[#246B45] font-bold">{placedOrder.orderId}</strong> has been confirmed and registered for delivery.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#173D2B]/10 shadow-xs text-left text-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <span className="text-[#65736A] block text-[11px]">Order ID</span>
              <strong className="text-base text-[#173D2B]">{placedOrder.orderId}</strong>
            </div>
            <div>
              <span className="text-[#65736A] block text-right text-[11px]">Grand Total</span>
              <strong className="text-base text-[#173D2B]">₹{placedOrder.grandTotal}</strong>
            </div>
          </div>

          <div className="space-y-1">
            <strong className="text-[#173D2B] block">Delivery Address:</strong>
            <p className="text-[#65736A] font-medium">{placedOrder.customerName} ({placedOrder.phone || placedOrder.email})</p>
            <p className="text-[#65736A]">{placedOrder.address}, {placedOrder.city}, {placedOrder.state} - {placedOrder.pincode}</p>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <strong className="text-[#173D2B] block">Ordered Product ({placedOrder.items.length}):</strong>
            {placedOrder.items.map((it, idx) => (
              <div key={idx} className="flex justify-between text-[#65736A]">
                <span>{it.quantity}x {it.name || it.productName}</span>
                <span className="font-semibold text-[#173D2B]">₹{(it.price || it.priceAtPurchase) * it.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/my-orders')}
            className="bg-[#246B45] hover:bg-[#173D2B] text-white font-extrabold text-xs px-6 py-3.5 rounded-2xl shadow-md transition-all active:scale-98"
          >
            Track My Order Status
          </button>
          <Link
            to="/products"
            className="bg-[#EEF2EA] hover:bg-[#dce4d6] text-[#173D2B] font-extrabold text-xs px-6 py-3.5 rounded-2xl transition-all text-center"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 font-sans text-[#18231D]">
      
      {/* Return Link */}
      <Link to={isBuyNow ? "/products" : "/cart"} className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#65736A] hover:text-[#246B45] transition-colors">
        <ArrowLeft className="w-4 h-4" /> {isBuyNow ? "Return to Products" : "Return to Cart"}
      </Link>

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8 items-start">

        {/* 1. ORDER SUMMARY (Rendered FIRST on Mobile, Right Column on Desktop) */}
        <div className="w-full order-1 lg:order-2 lg:col-span-1 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-[#173D2B]/10 shadow-xs space-y-6 sticky top-24">
            <h2 className="text-base font-black text-[#173D2B] border-b border-slate-100 pb-3 flex justify-between items-center">
              <span>Order Summary</span>
              <span className="text-xs bg-[#EEF2EA] text-[#246B45] px-2.5 py-0.5 rounded-full font-extrabold">
                {checkoutCount} {checkoutCount === 1 ? 'Item' : 'Items'}
              </span>
            </h2>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 text-xs divide-y divide-slate-100">
              {checkoutItems.map((item, idx) => (
                <div key={idx} className="pt-2.5 first:pt-0 flex justify-between items-center">
                  <div className="pr-2 space-y-0.5">
                    <p className="font-extrabold text-[#173D2B] line-clamp-1">{item.name}</p>
                    <p className="text-[#65736A] text-[11px] font-medium">
                      {item.quantity} x ₹{item.price}
                    </p>
                  </div>
                  <span className="font-black text-[#173D2B] shrink-0">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Option to Add Product to Cart during Direct Purchase */}
            {isBuyNow && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleSaveToCart}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 border shadow-xs ${
                    addedToCart
                      ? 'bg-emerald-800 text-white border-emerald-800'
                      : 'bg-white hover:bg-[#EEF2EA] text-[#173D2B] border-[#173D2B]/20 active:scale-95'
                  }`}
                >
                  {addedToCart ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-[#246B45]" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="space-y-2.5 text-xs border-t border-slate-100 pt-4">
              <div className="flex justify-between text-[#65736A] font-medium">
                <span>Product Total</span>
                <span className="font-bold text-[#173D2B]">₹{checkoutProductTotal}</span>
              </div>

              <div className="flex justify-between text-[#65736A] font-medium">
                <span>Total Shipping Weight</span>
                <span className="font-bold text-[#173D2B]">{formattedWeight}</span>
              </div>

              <div className="flex justify-between text-[#173D2B] bg-[#EEF2EA] p-3 rounded-xl border border-[#246B45]/20 font-extrabold">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#246B45]" /> Delivery Charge
                </span>
                <span>₹{checkoutDeliveryCharge}</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-sm font-black text-[#173D2B]">Grand Total</span>
                <span className="text-2xl font-black text-[#246B45]">₹{checkoutGrandTotal}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. DELIVERY INFORMATION FORM (Rendered SECOND on Mobile, Left Column on Desktop) */}
        <div className="w-full order-2 lg:order-1 lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-8 border border-[#173D2B]/10 shadow-xs space-y-6">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#173D2B]">Delivery Information</h1>
                {isBuyNow && (
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-amber-500 text-amber-500" /> Direct Purchase
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs text-[#65736A] mt-1 font-medium">
                Shipping details for authenticated customer ({authenticatedEmail}).
              </p>
            </div>

            {/* Clear Error Validation Message Alert */}
            {errorMessage && (
              <div id="checkout-error-banner" className="bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs p-4 rounded-2xl flex items-start gap-3 shadow-xs animate-shake">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <strong className="font-extrabold block text-rose-950">Required Information Missing</strong>
                  <p className="font-medium text-rose-800 leading-snug">{errorMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-extrabold text-[#173D2B] mb-1">
                    Full Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    required
                    placeholder="Enter your full name"
                    value={formData.customerName}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs sm:text-sm focus:outline-none focus:border-[#246B45] focus:bg-white transition-all font-medium"
                  />
                </div>

                {/* Contact Mobile Phone Number (Mandatory) */}
                <div>
                  <label className="block text-xs font-extrabold text-[#173D2B] mb-1">
                    Contact Phone Number <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="Enter 10-digit mobile number"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full bg-slate-50 border rounded-xl px-3.5 py-3 text-xs sm:text-sm focus:outline-none focus:bg-white transition-all font-medium ${
                      errorMessage && (!formData.phone.trim() || formData.phone.trim().length < 10)
                        ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                        : 'border-slate-200 focus:border-[#246B45]'
                    }`}
                  />
                  <span className="text-[10px] text-[#65736A] mt-1 block">
                    Required for courier delivery updates & verification.
                  </span>
                </div>
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-xs font-extrabold text-[#173D2B] mb-1">
                  Street Address <span className="text-rose-600">*</span>
                </label>
                <textarea
                  name="address"
                  required
                  rows={3}
                  placeholder="Door No, Building Name, Street Name, Landmark..."
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs sm:text-sm focus:outline-none focus:border-[#246B45] focus:bg-white transition-all font-medium"
                />
              </div>

              {/* City, State, Pincode */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-[#173D2B] mb-1">
                    City <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    placeholder="e.g. Karaikudi"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs sm:text-sm focus:outline-none focus:border-[#246B45] focus:bg-white transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#173D2B] mb-1">
                    State <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    required
                    placeholder="e.g. Tamil Nadu"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs sm:text-sm focus:outline-none focus:border-[#246B45] focus:bg-white transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#173D2B] mb-1">
                    Pincode <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    placeholder="6-digit pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs sm:text-sm focus:outline-none focus:border-[#246B45] focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#246B45] hover:bg-[#173D2B] text-white py-4 rounded-2xl text-sm font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Placing Order...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" /> PLACE ORDER — ₹{checkoutGrandTotal}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
