import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  MessageSquare,
  LogOut,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { subscribeToOrders } from '../../services/orderService';
import { subscribeToMessages } from '../../services/messageService';

export default function AdminLayout() {
  const { isAdmin, logoutAdmin, adminLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [unseenOrdersCount, setUnseenOrdersCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  // Protect admin routes
  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/admin/login', { replace: true });
    }
  }, [isAdmin, adminLoading, navigate]);

  // Realtime order and message notifications
  useEffect(() => {
    if (!isAdmin) return;

    const unsubOrders = subscribeToOrders((orders) => {
      const unseen = orders.filter(o => o.seenByAdmin === false || o.status === 'Pending').length;
      setUnseenOrdersCount(unseen);
    });

    const unsubMessages = subscribeToMessages((messages) => {
      const unread = messages.filter(m => m.status === 'New').length;
      setUnreadMessagesCount(unread);
    });

    return () => {
      if (unsubOrders) unsubOrders();
      if (unsubMessages) unsubMessages();
    };
  }, [isAdmin]);

  const handleLogout = async () => {
    await logoutAdmin();
    navigate('/admin/login');
  };

  if (adminLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: Layers },
    {
      name: 'Orders',
      path: '/admin/orders',
      icon: ShoppingBag,
      badge: unseenOrdersCount > 0 ? unseenOrdersCount : null
    },
    {
      name: 'Messages',
      path: '/admin/messages',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : null
    }
  ];

  return (
    <div className="min-h-screen bg-slate-100/60 pb-12">
      {/* Admin Top Header Bar */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Natural Blend Logo"
              className="w-9 h-9 object-contain rounded-full bg-white p-0.5 border border-emerald-400 shrink-0"
            />
            <div>
              <span className="font-extrabold text-sm tracking-tight block leading-tight">
                Natural Blend Admin
              </span>
              <span className="text-[10px] text-emerald-400 block font-medium">
                Store Manager • M. Kavitha M.Sc
              </span>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-3">
            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="bg-rose-900/80 hover:bg-rose-800 text-rose-200 text-xs font-bold px-3.5 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto pt-1 pb-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
                {item.badge && (
                  <span className="bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full animate-pulse">
                    🔔 {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <Outlet />
      </main>
    </div>
  );
}
