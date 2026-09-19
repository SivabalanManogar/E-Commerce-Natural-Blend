import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Truck, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowLeft, 
  Loader2, 
  AlertCircle, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { createOrder } from '../../services/orderService';
import { 
  signInWithGoogle, 
  signInWithEmailPassword, 
  signUpWithEmailPassword 
} from '../../services/customerAuthService';

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

  const { 
    isCustomerLoggedIn, 
    customerUser, 
    customerProfile, 
    refreshCustomerProfile, 
    triggerWelcomePopup 
  } = useAuth();
  const navigate = useNavigate();

  // Auth Form State for inline unauthenticated checkout
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState('');
  const [authSuccessMessage, setAuthSuccessMessage] = useState('');

  // Checkout Delivery Form State
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

  // Auto-scroll to top of page when order is successfully placed
  useEffect(() => {
    if (placedOrder) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [placedOrder]);

  // Handle Google Sign-In at Checkout
  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthErrorMessage('');
    setAuthSuccessMessage('');

    try {
      const result = await signInWithGoogle();
      if (result.success) {
        triggerWelcomePopup();
        await refreshCustomerProfile();
      } else {
        setAuthErrorMessage(result.message || 'Unable to sign in with Google. Please try again.');
      }
    } catch (err) {
      console.error('Google login error during checkout:', err);
      setAuthErrorMessage('Unable to sign in with Google. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Email Sign-In / Registration at Checkout
  const handleEmailAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthErrorMessage('');
    setAuthSuccessMessage('');

    if (!email.trim() || !password.trim()) {
      setAuthErrorMessage('Please enter both email and password.');
      return;
    }

    if (isSignUp && !name.trim()) {
      setAuthErrorMessage('Please enter your full name.');
      return;
    }

    if (password.length < 6) {
      setAuthErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setAuthLoading(true);

    try {
      if (isSignUp) {
        const res = await signUpWithEmailPassword(name, email, password);
        if (res.success) {
          setAuthSuccessMessage(`Account created! We sent a verification link to ${res.email}. Please check your inbox.`);
          setTimeout(() => setIsSignUp(false), 2000);
        } else {
          setAuthErrorMessage(res.message);
        }
      } else {
        const res = await signInWithEmailPassword(email, password);
        if (res.success) {
          triggerWelcomePopup();
          await refreshCustomerProfile();
        } else if (res.unverified) {
          setAuthErrorMessage('Please verify your email before logging in. Check your inbox.');
        } else {
          setAuthErrorMessage(res.message);
        }
      }
    } catch (err) {
      console.error('Email auth error during checkout:', err);
      setAuthErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  if (cartItems.length === 0 && !placedOrder) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500">Please add products to your cart before proceeding to checkout.</p>
        <Link to="/products" className="inline-block bg-[#176B4D] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs">
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

  const handleSubmitOrder = async (e) => {
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
      <div className="min-h-[70vh] flex flex-col justify-center items-center py-10 px-4 font-sans text-[#17251F]">
        <div className="w-full max-w-xl space-y-6 animate-fade-in text-center">
          <div className="w-20 h-20 bg-[#DDEFE6] text-[#176B4D] rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <span className="bg-[#DDEFE6] text-[#0D4A35] text-xs font-extrabold px-3 py-1 rounded-full border border-[#DCE6E0]">
              Order Placed Successfully 🎉
            </span>
            <h1 className="text-3xl font-black text-[#0D4A35]">Thank You, {placedOrder.customerName}!</h1>
            <p className="text-xs text-[#64756D] max-w-md mx-auto">
              Your order <strong className="text-[#0D4A35] font-bold">{placedOrder.orderId}</strong> has been saved and linked to your account.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#DCE6E0] shadow-xs text-left text-xs space-y-4">
            <div className="flex justify-between items-center border-b border-[#DCE6E0] pb-3">
              <div>
                <span className="text-[#64756D] block">Order ID</span>
                <strong className="text-base text-[#0D4A35]">{placedOrder.orderId}</strong>
              </div>
              <div>
                <span className="text-[#64756D] block text-right">Grand Total</span>
                <strong className="text-base text-[#176B4D]">₹{placedOrder.grandTotal}</strong>
              </div>
            </div>

            <div className="space-y-1">
              <strong className="text-[#0D4A35] block">Delivery Address:</strong>
              <p className="text-[#17251F]">{placedOrder.customerName} ({placedOrder.email || placedOrder.phone})</p>
              <p className="text-[#64756D]">{placedOrder.address}, {placedOrder.city}, {placedOrder.state} - {placedOrder.pincode}</p>
            </div>

            <div className="pt-2 border-t border-[#DCE6E0] space-y-2">
              <strong className="text-[#0D4A35] block">Ordered Items ({placedOrder.items.length}):</strong>
              {placedOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-[#64756D]">
                  <span>{it.quantity}x {it.productName}</span>
                  <span className="font-semibold text-[#0D4A35]">₹{it.priceAtPurchase * it.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/my-orders')}
              className="bg-[#176B4D] hover:bg-[#0D4A35] text-white font-extrabold text-xs px-6 py-3.5 rounded-2xl shadow-md transition-all cursor-pointer"
            >
              Track My Order Status
            </button>
            <Link
              to="/products"
              className="bg-[#F8FAF6] hover:bg-[#DDEFE6] text-[#0D4A35] font-bold text-xs px-6 py-3.5 rounded-2xl border border-[#DCE6E0] transition-all"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans text-[#17251F]">
      <Link to="/cart" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64756D] hover:text-[#176B4D] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Return to Cart
      </Link>

      {/* STEP 1: ORDER SUMMARY FIRST */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DCE6E0] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#DCE6E0] pb-4 gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0D4A35] tracking-tight">
              1. Order Summary ({cartCount} {cartCount === 1 ? 'Item' : 'Items'})
            </h1>
            <p className="text-xs text-[#64756D] mt-0.5">
              Review your selected items and shipping weight breakdown before ordering.
            </p>
          </div>
          <span className="bg-[#DDEFE6] text-[#0D4A35] text-xs font-extrabold px-3 py-1 rounded-full border border-[#DCE6E0] self-start sm:self-auto">
            Step 1 of 2
          </span>
        </div>

        {/* Selected Items List */}
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1 text-xs divide-y divide-[#DCE6E0]">
          {cartItems.map((item) => (
            <div key={item.id} className="pt-3 first:pt-0 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img 
                  src={item.imageUrl || '/images/products/placeholder.png'} 
                  alt={item.name} 
                  className="w-12 h-12 object-contain bg-[#F8FAF6] p-1 rounded-lg border border-[#DCE6E0]"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/100x100/e2e8f0/1e293b?text=Product';
                  }}
                />
                <div>
                  <p className="font-extrabold text-[#0D4A35] text-xs sm:text-sm">{item.name}</p>
                  <p className="text-[#64756D] text-[11px] mt-0.5">
                    Quantity: <strong className="text-[#0D4A35]">{item.quantity}</strong> × ₹{item.price}
                  </p>
                </div>
              </div>
              <span className="font-black text-[#0D4A35] text-sm shrink-0">₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        {/* Totals & Shipping Weight Breakdown */}
        <div className="space-y-3 text-xs border-t border-[#DCE6E0] pt-4 bg-[#F8FAF6] p-4 sm:p-5 rounded-2xl border border-[#DCE6E0]">
          <div className="flex justify-between text-[#64756D]">
            <span>Product Subtotal</span>
            <span className="font-extrabold text-[#0D4A35]">₹{productTotal}</span>
          </div>

          <div className="flex justify-between text-[#64756D]">
            <span>Total Shipping Weight</span>
            <span className="font-extrabold text-[#0D4A35]">{formattedWeight}</span>
          </div>

          <div className="flex justify-between text-[#0D4A35] bg-[#DDEFE6] p-3 rounded-xl border border-[#DCE6E0] font-bold text-xs">
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#176B4D]" /> Delivery Charge
            </span>
            <span className="font-extrabold">₹{deliveryCharge}</span>
          </div>

          <div className="pt-3 border-t border-[#DCE6E0] flex justify-between items-center">
            <span className="text-sm sm:text-base font-extrabold text-[#0D4A35]">Grand Total</span>
            <span className="text-2xl sm:text-3xl font-black text-[#176B4D]">₹{grandTotal}</span>
          </div>
        </div>
      </div>

      {/* STEP 2: CHECKOUT AUTHENTICATION OR DELIVERY FORM */}
      {!isCustomerLoggedIn ? (
        /* ================= INLINE CHECKOUT AUTHENTICATION SCREEN ================= */
        <div className="bg-white rounded-3xl p-4 sm:p-8 border border-[#DCE6E0] shadow-md space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#DCE6E0] pb-4 gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0D4A35] tracking-tight">
                2. Sign in to continue
              </h2>
              <p className="text-xs text-[#64756D] mt-0.5 font-medium">
                New here? Your account will be created automatically.
              </p>
            </div>
            <span className="bg-[#DDEFE6] text-[#0D4A35] text-xs font-extrabold px-3 py-1 rounded-full border border-[#DCE6E0] self-start sm:self-auto">
              Step 2 of 2
            </span>
          </div>

          {authErrorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-[#C94A4A] text-xs p-3.5 rounded-2xl flex items-center gap-2 font-bold animate-fade-in">
              <AlertCircle className="w-4 h-4 text-[#C94A4A] shrink-0" />
              <span>{authErrorMessage}</span>
            </div>
          )}

          {authSuccessMessage && (
            <div className="bg-[#DDEFE6] border border-[#DCE6E0] text-[#0D4A35] text-xs p-3.5 rounded-2xl flex items-center gap-2 font-bold animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-[#176B4D] shrink-0" />
              <span>{authSuccessMessage}</span>
            </div>
          )}

          {/* Primary Action Button: Continue with Google */}
          <div className="max-w-md mx-auto space-y-4 pt-2">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={authLoading}
              className="w-full bg-white hover:bg-slate-50 border-2 border-[#176B4D] text-[#0D4A35] py-4 px-4 rounded-2xl text-xs sm:text-sm font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 active:scale-98 disabled:opacity-50"
            >
              {authLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-[#176B4D]" />
                  <span>Signing in with Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {/* Separator */}
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-[#DCE6E0] w-full" />
              <span className="bg-white px-3 text-[11px] font-bold text-[#64756D] shrink-0 uppercase tracking-wider">
                OR
              </span>
            </div>

            {/* Secondary Action: Email Option */}
            {!showEmailForm ? (
              <button
                type="button"
                onClick={() => setShowEmailForm(true)}
                className="w-full text-center text-xs font-bold text-[#176B4D] hover:text-[#0D4A35] py-2 transition-colors flex items-center justify-center gap-1.5"
              >
                <Mail className="w-4 h-4" /> Continue with Email <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="space-y-4 pt-1 animate-fade-in bg-[#F8FAF6] p-4 rounded-2xl border border-[#DCE6E0]">
                <div className="grid grid-cols-2 bg-white p-1 rounded-xl border border-[#DCE6E0] text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    className={`py-2 rounded-lg transition-all ${!isSignUp ? 'bg-[#176B4D] text-white shadow-xs' : 'text-[#64756D] hover:text-[#0D4A35]'}`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    className={`py-2 rounded-lg transition-all ${isSignUp ? 'bg-[#176B4D] text-white shadow-xs' : 'text-[#64756D] hover:text-[#0D4A35]'}`}
                  >
                    Create Account
                  </button>
                </div>

                <form onSubmit={handleEmailAuthSubmit} className="space-y-3">
                  {isSignUp && (
                    <div>
                      <label className="block text-xs font-bold text-[#0D4A35] mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white border border-[#DCE6E0] rounded-xl px-3 py-2 text-xs text-[#17251F] focus:outline-none focus:border-[#176B4D]"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-[#0D4A35] mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-[#DCE6E0] rounded-xl px-3 py-2 text-xs text-[#17251F] focus:outline-none focus:border-[#176B4D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0D4A35] mb-1">Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder={isSignUp ? 'At least 6 characters' : 'Enter password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white border border-[#DCE6E0] rounded-xl pl-3 pr-9 py-2 text-xs text-[#17251F] focus:outline-none focus:border-[#176B4D]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64756D]"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-[#176B4D] hover:bg-[#0D4A35] text-white py-2.5 rounded-xl text-xs font-extrabold shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ================= AUTHENTICATED DELIVERY INFORMATION FORM ================= */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DCE6E0] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#DCE6E0] pb-4 gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0D4A35] tracking-tight">
                2. Delivery Information
              </h2>
              <p className="text-xs text-[#64756D] mt-0.5">
                Shipping address for authenticated customer ({authenticatedEmail}).
              </p>
            </div>
            <span className="bg-[#DDEFE6] text-[#0D4A35] text-xs font-extrabold px-3 py-1 rounded-full border border-[#DCE6E0] self-start sm:self-auto">
              Step 2 of 2
            </span>
          </div>

          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-[#C94A4A] text-xs p-3.5 rounded-2xl flex items-center gap-2 font-bold animate-fade-in">
              <AlertCircle className="w-4 h-4 text-[#C94A4A] shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmitOrder} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0D4A35] mb-1">Full Name *</label>
                <input
                  type="text"
                  name="customerName"
                  required
                  placeholder="Enter your full name"
                  value={formData.customerName}
                  onChange={handleChange}
                  className="w-full bg-[#F8FAF6] border border-[#DCE6E0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#176B4D] focus:bg-white transition-all text-[#17251F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0D4A35] mb-1">Contact Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="Enter contact mobile number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-[#F8FAF6] border border-[#DCE6E0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#176B4D] focus:bg-white transition-all text-[#17251F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0D4A35] mb-1">Street Address *</label>
              <textarea
                name="address"
                required
                rows={3}
                placeholder="Door No, Street Name, Landmark..."
                value={formData.address}
                onChange={handleChange}
                className="w-full bg-[#F8FAF6] border border-[#DCE6E0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#176B4D] focus:bg-white transition-all text-[#17251F]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0D4A35] mb-1">City *</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full bg-[#F8FAF6] border border-[#DCE6E0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#176B4D] focus:bg-white transition-all text-[#17251F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0D4A35] mb-1">State *</label>
                <input
                  type="text"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full bg-[#F8FAF6] border border-[#DCE6E0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#176B4D] focus:bg-white transition-all text-[#17251F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0D4A35] mb-1">Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  required
                  value={formData.pincode}
                  onChange={handleChange}
                  className="w-full bg-[#F8FAF6] border border-[#DCE6E0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#176B4D] focus:bg-white transition-all text-[#17251F]"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#176B4D] hover:bg-[#0D4A35] text-white py-4 rounded-2xl text-sm font-extrabold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Placing Order...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-[#C89B3C]" /> PLACE ORDER — ₹{grandTotal}
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="text-[11px] text-[#64756D] flex items-center gap-1.5 justify-center pt-2 border-t border-[#DCE6E0]">
            <ShieldCheck className="w-4 h-4 text-[#176B4D]" /> Verified Store Purchase • Direct Store Dispatch from Karaikudi
          </div>
        </div>
      )}
    </div>
  );
}
