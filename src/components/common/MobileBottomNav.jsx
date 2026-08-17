import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, User, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function MobileBottomNav() {
  const location = useLocation();
  const { cartCount } = useCart();
  const { isCustomerLoggedIn } = useAuth();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    {
      label: 'Home',
      path: '/',
      icon: Home
    },
    {
      label: 'Products',
      path: '/products',
      icon: Grid
    },
    {
      label: 'Account',
      path: isCustomerLoggedIn ? '/profile' : '/login',
      icon: User
    },
    {
      label: 'Cart',
      path: '/cart',
      icon: ShoppingCart,
      badge: cartCount
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-2xl border-t border-[#173D2B]/12 shadow-[0_-8px_25px_rgba(0,0,0,0.08)] px-2 pt-2.5 pb-4 font-sans">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${active
                  ? 'text-[#246B45]'
                  : 'text-[#65736A] hover:text-[#173D2B]'
                }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={`w-5 h-5 transition-transform ${active ? 'stroke-[2.5] scale-110' : 'stroke-2'}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-3 bg-[#246B45] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs border border-white">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className={`text-[11px] mt-1 tracking-tight leading-normal block text-center ${active ? 'font-black text-[#246B45]' : 'font-extrabold text-[#65736A]'
                }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
