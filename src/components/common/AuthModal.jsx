import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Loader2, 
  AlertCircle, 
  Leaf, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  signInWithGoogle, 
  signInWithEmailPassword, 
  signUpWithEmailPassword 
} from '../../services/customerAuthService';

export default function AuthModal({ isOpen, onClose, onSuccess, title = "Sign in to continue" }) {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { refreshCustomerProfile, triggerWelcomePopup } = useAuth();

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const result = await signInWithGoogle();
      if (result.success) {
        triggerWelcomePopup();
        await refreshCustomerProfile();
        if (onSuccess) onSuccess();
        if (onClose) onClose();
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

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    if (isSignUp && !name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const res = await signUpWithEmailPassword(name, email, password);
        if (res.success) {
          setSuccessMessage(`Account created! We sent a verification link to ${res.email}. Please check your inbox.`);
          setTimeout(() => {
            setIsSignUp(false);
          }, 2000);
        } else {
          setErrorMessage(res.message);
        }
      } else {
        const res = await signInWithEmailPassword(email, password);
        if (res.success) {
          triggerWelcomePopup();
          await refreshCustomerProfile();
          if (onSuccess) onSuccess();
          if (onClose) onClose();
        } else if (res.unverified) {
          setErrorMessage('Please verify your email before logging in. Check your inbox.');
        } else {
          setErrorMessage(res.message);
        }
      }
    } catch (err) {
      console.error('Email authentication error:', err);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6 text-center">
        <div 
          className="relative z-[100000] w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-[#DCE6E0] shadow-2xl space-y-4 animate-popup-scale text-[#17251F] text-left my-8 transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-20"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Brand Header */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="w-14 h-14 bg-white rounded-full p-1 shadow-md border border-[#DCE6E0] mx-auto flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Natural Blend Logo"
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0D4A35] tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-[#64756D] font-medium">
            New here? Your account will be created automatically.
          </p>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-[#C94A4A] text-xs p-3.5 rounded-2xl flex items-center gap-2 font-bold animate-fade-in">
            <AlertCircle className="w-4 h-4 text-[#C94A4A] shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Banner */}
        {successMessage && (
          <div className="bg-[#DDEFE6] border border-[#DCE6E0] text-[#0D4A35] text-xs p-3.5 rounded-2xl flex items-center gap-2 font-bold animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#176B4D] shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Primary Action: Continue with Google */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white hover:bg-slate-50 border-2 border-[#176B4D] text-[#0D4A35] py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 active:scale-98 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#176B4D]" />
              <span>Connecting to Google...</span>
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

        {/* Separator / Alternative Options */}
        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-[#DCE6E0] w-full" />
          <span className="bg-white px-3 text-[11px] font-bold text-[#64756D] shrink-0 uppercase tracking-wider">
            OR
          </span>
        </div>

        {/* Secondary Option: Continue with Email Toggle */}
        {!showEmailForm ? (
          <button
            type="button"
            onClick={() => setShowEmailForm(true)}
            className="w-full text-center text-xs font-bold text-[#176B4D] hover:text-[#0D4A35] py-2 transition-colors flex items-center justify-center gap-1.5"
          >
            <Mail className="w-4 h-4" /> Continue with Email <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="space-y-4 pt-1 animate-fade-in">
            <div className="grid grid-cols-2 bg-[#F8FAF6] p-1 rounded-xl border border-[#DCE6E0] text-xs font-bold">
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

            <form onSubmit={handleEmailSubmit} className="space-y-3">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-bold text-[#0D4A35] mb-1">Full Name *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Enter full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#F8FAF6] border border-[#DCE6E0] rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#176B4D] focus:bg-white text-[#17251F]"
                    />
                    <User className="w-3.5 h-3.5 text-[#64756D] absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#0D4A35] mb-1">Email Address *</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#F8FAF6] border border-[#DCE6E0] rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#176B4D] focus:bg-white text-[#17251F]"
                  />
                  <Mail className="w-3.5 h-3.5 text-[#64756D] absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
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
                    className="w-full bg-[#F8FAF6] border border-[#DCE6E0] rounded-xl pl-9 pr-9 py-2 text-xs focus:outline-none focus:border-[#176B4D] focus:bg-white text-[#17251F]"
                  />
                  <Lock className="w-3.5 h-3.5 text-[#64756D] absolute left-3 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64756D] hover:text-[#0D4A35]"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#176B4D] hover:bg-[#0D4A35] text-white py-2.5 rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>}
              </button>
            </form>
          </div>
        )}

        <div className="text-[10px] text-[#64756D] text-center pt-2 border-t border-[#DCE6E0]">
          Secured by Firebase Authentication • Natural Blend
        </div>
      </div>
    </div>
  </div>,
  document.body
);
}
