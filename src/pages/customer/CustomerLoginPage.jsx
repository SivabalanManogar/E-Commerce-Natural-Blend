import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, Loader2, AlertCircle, ArrowLeft, Leaf, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { signInWithGoogle } from '../../services/customerAuthService';

export default function CustomerLoginPage() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { isCustomerLoggedIn, refreshCustomerProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from || '/';

  // Redirect if already logged in
  useEffect(() => {
    if (isCustomerLoggedIn) {
      navigate(redirectPath, { replace: true });
    }
  }, [isCustomerLoggedIn, navigate, redirectPath]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const result = await signInWithGoogle();
      if (result.success) {
        await refreshCustomerProfile();
        navigate(redirectPath, { replace: true });
      } else {
        setErrorMessage(result.message || 'Unable to sign in with Google. Please try again.');
      }
    } catch (err) {
      console.error('Google login error:', err);
      setErrorMessage('Unable to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 animate-liquid-gradient overflow-hidden relative font-sans text-[#18231D]">
      
      {/* Animated Floating Organic Blobs */}
      <div className="absolute -top-24 -right-24 w-[30rem] h-[30rem] bg-[#4F9D69]/20 rounded-full blur-[90px] pointer-events-none animate-blob-1" />
      <div className="absolute -bottom-24 -left-24 w-[30rem] h-[30rem] bg-[#246B45]/15 rounded-full blur-[90px] pointer-events-none animate-blob-2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-white/40 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Full-Page Translucent Glass Login Card */}
      <div className="glass-panel rounded-[2.5rem] p-8 sm:p-12 border border-white/80 shadow-2xl w-full max-w-lg space-y-6 relative z-10 text-[#18231D] backdrop-blur-2xl">
        
        {/* Top Header & Store Link */}
        <div className="flex items-center justify-between border-b border-[#173D2B]/10 pb-4">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#65736A] hover:text-[#246B45] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Return to Store
          </Link>
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#246B45] bg-[#EEF2EA] px-3 py-1 rounded-full border border-[#173D2B]/10">
            <Leaf className="w-3.5 h-3.5" /> Karaikudi Heritage
          </span>
        </div>

        {/* Logo & Store Info */}
        <div className="text-center space-y-3 pt-2">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center shrink-0">
            <div className="w-20 h-20 bg-white rounded-full p-1.5 shadow-xl border-2 border-[#246B45]/30 flex items-center justify-center animate-float-soft">
              <img 
                src="/logo.png" 
                alt="Natural Blend Logo" 
                className="w-full h-full object-contain rounded-full"
              />
            </div>
          </div>

          <h1 className="text-3xl font-black text-[#173D2B] tracking-tight leading-none">
            Natural <span className="text-[#246B45]">Blend</span>
          </h1>
          <p className="text-xs font-bold text-[#246B45]">Pure Natural Care & Homemade Wellness</p>
          <p className="text-xs text-[#65736A] max-w-xs mx-auto leading-relaxed">
            Sign in with your Google account to browse handcrafted herbal products & track your orders.
          </p>
        </div>

        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-[#D95C5C] text-xs p-4 rounded-2xl flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-[#D95C5C] shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Google Sign-In Action */}
        <div className="space-y-4 pt-2">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white hover:bg-slate-50 border border-[#173D2B]/15 text-[#173D2B] py-4 px-6 rounded-2xl text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3.5 active:scale-98 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-[#246B45]" />
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
                <span className="font-extrabold text-[#173D2B]">Continue with Google</span>
              </>
            )}
          </button>
        </div>

        {/* Feature Points */}
        <div className="bg-white/60 p-4 rounded-2xl border border-[#173D2B]/10 space-y-2 text-xs text-[#65736A]">
          <div className="flex items-center gap-2 font-bold text-[#173D2B]">
            <CheckCircle2 className="w-4 h-4 text-[#246B45]" /> Fast & Secure Authentication
          </div>
          <p className="text-[11px] leading-tight">No passwords required. Access your order tracking, address book, and order status instantly.</p>
        </div>

        <div className="pt-2 text-center text-[11px] text-[#65736A] border-t border-[#173D2B]/10">
          Secured by Firebase Google Authentication • Natural Blend Karaikudi
        </div>

      </div>
    </div>
  );
}
