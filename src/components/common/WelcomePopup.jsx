import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Leaf, ShieldCheck, Sparkles, Star, Award, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function WelcomePopup() {
  const { 
    isCustomerLoggedIn, 
    customerUser, 
    customerProfile, 
    customerLoading,
    justLoggedIn,
    consumeWelcomePopup
  } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Popup shows ONLY ONCE immediately upon active login event
  useEffect(() => {
    if (!customerLoading && isCustomerLoggedIn) {
      const storedTrigger = sessionStorage.getItem('nb_show_welcome_popup') === 'true';

      if (justLoggedIn || storedTrigger) {
        setIsOpen(true);
        consumeWelcomePopup();
      }
    }
  }, [isCustomerLoggedIn, customerLoading, justLoggedIn]);

  // Lock body scroll when popup is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close popup on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen || customerLoading || !isCustomerLoggedIn) {
    return null;
  }

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleExploreProducts = () => {
    setIsOpen(false);
    navigate('/products');
  };

  // Get user's first name cleanly (e.g. "Sivan")
  const rawName = customerProfile?.name || customerUser?.displayName || customerUser?.email?.split('@')[0] || 'Friend';
  const firstName = rawName.trim().split(' ')[0];
  const capitalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-overlay-fade overflow-y-auto"
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
    >
      {/* Luxury Glassmorphism Herbal Welcome Card */}
      <div 
        className="relative w-full max-w-[92vw] sm:max-w-xl md:max-w-2xl bg-gradient-to-b from-white/95 via-[#F4F9F6]/95 to-[#EBF4F0]/95 backdrop-blur-2xl rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 md:p-10 border border-[#DCE6E0] shadow-2xl text-center text-[#17251F] animate-popup-scale my-auto max-h-[90vh] overflow-y-auto overflow-x-hidden selection:bg-[#176B4D] selection:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= FLOATING ANIMATED SMALL LEAVES & BOTANICAL ELEMENTS ================= */}
        {/* Top-Left Floating Leaf */}
        <div className="absolute -top-1 -left-1 sm:top-4 sm:left-6 text-3xl sm:text-4xl select-none pointer-events-none animate-float-natural-1 filter drop-shadow-md z-10" title="Leaf">
          🌿
        </div>

        {/* Top-Right Floating Herb */}
        <div className="absolute top-2 right-12 sm:top-5 sm:right-16 text-3xl sm:text-4xl select-none pointer-events-none animate-float-natural-2 filter drop-shadow-md z-10" title="Herb">
          🌱
        </div>

        {/* Bottom-Left Floating Flower */}
        <div className="absolute bottom-4 left-3 sm:bottom-6 sm:left-8 text-3xl sm:text-4xl select-none pointer-events-none animate-float-natural-3 filter drop-shadow-md z-10" title="Flower">
          🌸
        </div>

        {/* Bottom-Right Floating Petal */}
        <div className="absolute bottom-5 right-4 sm:bottom-8 sm:right-10 text-3xl sm:text-4xl select-none pointer-events-none animate-float-natural-1 filter drop-shadow-md z-10" title="Petal">
          🍃
        </div>

        {/* Middle-Left Floating Clover */}
        <div className="hidden sm:block absolute top-1/2 left-2 -translate-y-1/2 text-2xl sm:text-3xl select-none pointer-events-none animate-float-natural-4 opacity-80 filter drop-shadow-xs z-10" title="Clover">
          🍀
        </div>

        {/* Middle-Right Floating Hibiscus */}
        <div className="hidden sm:block absolute top-1/2 right-2 -translate-y-1/2 text-2xl sm:text-3xl select-none pointer-events-none animate-float-natural-2 opacity-80 filter drop-shadow-xs z-10" title="Hibiscus">
          🌺
        </div>

        {/* Decorative Organic Ambient Blobs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-[#176B4D]/15 rounded-full blur-[70px] pointer-events-none animate-blob-1" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-[#0D4A35]/15 rounded-full blur-[70px] pointer-events-none animate-blob-2" />

        {/* ================= ❌ CLOSE BUTTON ================= */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3 right-3 sm:top-5 sm:right-5 p-2.5 rounded-full bg-white/90 text-[#64756D] hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 hover:scale-110 active:scale-95 border border-[#DCE6E0] cursor-pointer z-30 shadow-xs flex items-center justify-center"
          aria-label="Close welcome modal"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* ================= POPUP CONTENT ================= */}
        <div className="relative z-20 space-y-4 sm:space-y-6 pt-1">
          
          {/* Small "Handcrafted with love in Karaikudi" Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#DDEFE6] text-[#0D4A35] text-[11px] sm:text-xs font-extrabold border border-[#DCE6E0] shadow-xs">
            <Heart className="w-3.5 h-3.5 text-[#176B4D] fill-[#176B4D]" />
            <span>Handcrafted with love in Karaikudi</span>
          </div>

          {/* 🌿 Large Natural Blend Logo in Glowing Circle */}
          <div className="relative shrink-0 flex items-center justify-center my-2">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white p-2.5 shadow-[0_0_40px_rgba(23,107,77,0.4)] border-4 border-[#176B4D]/30 flex items-center justify-center animate-float-soft relative">
              <img
                src="/logo.png"
                alt="Natural Blend Logo"
                className="w-full h-full object-contain rounded-full"
              />
              <div className="absolute -bottom-1 -right-1 bg-white text-[#0D4A35] text-[9px] font-black px-2 py-0.5 rounded-full border border-[#DCE6E0] shadow-xs flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 text-[#C89B3C] fill-[#C89B3C]" /> Authentic
              </div>
            </div>
          </div>

          {/* 👋 Personalized Greeting & Title */}
          <div className="space-y-1.5 sm:space-y-2 max-w-lg mx-auto">
            <h3 className="text-base sm:text-lg font-black text-[#176B4D] tracking-tight">
              👋 Welcome, {capitalizedName}!
            </h3>

            <h2 className="text-2xl sm:text-4xl font-black text-[#0D4A35] tracking-tight leading-tight">
              Welcome to Natural Blend 🌿
            </h2>

            {/* 🌱 Tagline */}
            <p className="text-xs sm:text-sm font-extrabold text-[#176B4D] italic pt-0.5">
              🌱 “Your natural journey starts here”
            </p>

            <p className="text-xs sm:text-sm text-[#64756D] font-medium leading-relaxed max-w-md mx-auto pt-1">
              Explore authentic handcrafted herbal tooth powder, organic soaps, cold-pressed oils & traditional wellness foods.
            </p>
          </div>

          {/* Highlight Features Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 py-1.5 sm:py-2">
            <div className="bg-white/90 border border-[#DCE6E0] p-2 sm:p-3 rounded-2xl flex flex-col items-center justify-center text-center space-y-1 hover:border-[#176B4D]/40 transition-colors shadow-2xs">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#DDEFE6] text-[#176B4D] flex items-center justify-center shrink-0">
                <Leaf className="w-4 h-4" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-[#0D4A35]">100% Pure Herbs</span>
            </div>

            <div className="bg-white/90 border border-[#DCE6E0] p-2 sm:p-3 rounded-2xl flex flex-col items-center justify-center text-center space-y-1 hover:border-[#176B4D]/40 transition-colors shadow-2xs">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#DDEFE6] text-[#176B4D] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-[#0D4A35]">No Chemicals</span>
            </div>

            <div className="bg-white/90 border border-[#DCE6E0] p-2 sm:p-3 rounded-2xl flex flex-col items-center justify-center text-center space-y-1 hover:border-[#176B4D]/40 transition-colors shadow-2xs">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#DDEFE6] text-[#176B4D] flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-[#0D4A35]">Tamil Nadu Express</span>
            </div>
          </div>

          {/* ================= 🌿 EXPLORE HOME PAGE BUTTON ================= */}
          <div className="pt-2 sm:pt-3">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/');
              }}
              className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-[#176B4D] to-[#0D4A35] hover:from-[#0D4A35] hover:to-[#0A3B2A] text-white font-extrabold text-xs sm:text-sm shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer group active:scale-98 border border-[#176B4D]/30 mx-auto"
            >
              <Leaf className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
              <span>Explore Home Page</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
