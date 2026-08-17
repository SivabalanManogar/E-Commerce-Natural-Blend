import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  Phone,
  MapPin,
  ShieldCheck,
  Leaf,
  User,
  LogOut,
  Package,
  UserCheck
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { cartCount } = useCart();
  const { isCustomerLoggedIn, customerProfile, customerUser, logoutCustomer, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    await logoutCustomer();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Categories', path: '/categories' },
    { name: 'Products', path: '/products' },
    { name: 'My Orders', path: '/my-orders' },
    { name: 'Contact', path: '/contact' }
  ];

  const isActive = (path) => location.pathname === path;
  const customerName = customerProfile?.displayName || customerUser?.displayName || customerUser?.email?.split('@')[0] || 'Customer';
  const photoURL = customerUser?.photoURL || customerProfile?.photoURL;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      {/* Top Banner */}
      <div className="bg-emerald-950 text-emerald-100 px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 font-medium">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" /> Natural Blend | Owned by M. Kavitha M.Sc
            </span>
            <span className="hidden sm:inline-block text-emerald-400">•</span>
            <span className="hidden md:flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400" /> Karaikudi, Tamil Nadu
            </span>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <a
              href="tel:6381109883"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <Phone className="w-3 h-3 text-emerald-400" /> Call: 6381109883
            </a>
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="bg-emerald-700 hover:bg-emerald-600 text-white px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
              >
                <ShieldCheck className="w-3 h-3" /> Admin Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 font-sans">
        <div className="flex items-center justify-between gap-4">

          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="Natural Blend Logo"
              className="w-11 h-11 object-contain rounded-full border border-emerald-100 shadow-xs group-hover:scale-105 transition-transform shrink-0"
            />
            <div>
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 block leading-tight">
                Natural <span className="text-emerald-700">Blend</span>
              </span>
              <span className="text-[11px] text-slate-500 font-medium block">
                Herbal & Wellness Store
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search herbal products, toothpaste, hair oil..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors"
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-700">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-colors py-1 ${isActive(link.path)
                  ? 'text-emerald-700 border-b-2 border-emerald-600 font-bold'
                  : 'hover:text-emerald-600'
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Customer Account Indicator, Cart Icon & Mobile Menu Trigger */}
          <div className="flex items-center gap-3">

            {/* Account / User Indicator */}
            {isCustomerLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border border-emerald-200"
                >
                  {photoURL ? (
                    <img src={photoURL} alt="Avatar" className="w-6 h-6 rounded-full object-cover shrink-0" />
                  ) : (
                    <UserCheck className="w-4 h-4 text-emerald-700" />
                  )}
                  <span className="hidden sm:inline max-w-[120px] truncate">Hi, {customerName} 👋</span>
                </button>

                {/* Account Dropdown */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-slate-100 shadow-xl py-2 z-50 animate-fade-in text-xs">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-extrabold text-slate-900 truncate">{customerName}</p>
                      <p className="text-[10px] text-slate-500 truncate">{customerUser?.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 font-bold text-slate-700"
                    >
                      <User className="w-3.5 h-3.5 text-emerald-600" /> My Profile
                    </Link>

                    <Link
                      to="/my-orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 font-bold text-slate-700"
                    >
                      <Package className="w-3.5 h-3.5 text-emerald-600" /> My Orders
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-rose-50 font-bold text-rose-700 border-t border-slate-100"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                Login
              </Link>
            )}

            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl transition-all flex items-center gap-2 group"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-emerald-700 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline font-bold text-xs">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-bounce">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-3 md:hidden">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-600 p-1"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2 animate-fade-in text-xs">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg font-bold transition-colors ${isActive(link.path)
                ? 'bg-emerald-50 text-emerald-800'
                : 'text-slate-700 hover:bg-slate-50'
                }`}
            >
              {link.name}
            </Link>
          ))}
          {isCustomerLoggedIn && (
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg font-bold text-slate-700 hover:bg-slate-50"
            >
              My Profile
            </Link>
          )}
          {isCustomerLoggedIn && (
            <button
              onClick={handleLogout}
              className="w-full text-left block px-3 py-2 rounded-lg font-bold text-rose-700 hover:bg-rose-50"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </header>
  );
}
