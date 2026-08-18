import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import Header from './components/common/Header';
import Footer from './components/common/Footer';
import FloatingWhatsApp from './components/common/FloatingWhatsApp';
import MobileBottomNav from './components/common/MobileBottomNav';
import WelcomePopup from './components/common/WelcomePopup';

import HomePage from './pages/customer/HomePage';
import CategoriesPage from './pages/customer/CategoriesPage';
import ProductsPage from './pages/customer/ProductsPage';
import ProductDetailsPage from './pages/customer/ProductDetailsPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import MyOrdersPage from './pages/customer/MyOrdersPage';
import CustomerProfilePage from './pages/customer/CustomerProfilePage';
import ContactPage from './pages/customer/ContactPage';
import CustomerLoginPage from './pages/customer/CustomerLoginPage';

import AdminLayout from './components/admin/AdminLayout';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminMessagesPage from './pages/admin/AdminMessagesPage';

/**
 * ScrollToTop Component
 * Automatically resets scroll position to top (0, 0) on every page route change.
 */
function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname, search, hash]);

  return null;
}

/**
 * Protected Customer Route Wrapper for Customers.
 * If customer is not authenticated, redirects to /login.
 */
function ProtectedCustomerRoute({ children }) {
  const { isCustomerLoggedIn, customerLoading } = useAuth();
  const location = useLocation();

  if (customerLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#176B4D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isCustomerLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}

function AppLayout({ children }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isLoginRoute = location.pathname === '/login';

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-[#176B4D] selection:text-white bg-[#F8FAF6]">
      {!isAdminRoute && !isLoginRoute && <Header />}

      <main className={!isAdminRoute && !isLoginRoute ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-5 pb-24 md:pb-8 flex-1 w-full" : "flex-1 w-full"}>
        {children}
      </main>

      {!isAdminRoute && !isLoginRoute && <WelcomePopup />}
      {!isAdminRoute && !isLoginRoute && <Footer />}
      {!isAdminRoute && !isLoginRoute && <FloatingWhatsApp />}
      {!isAdminRoute && !isLoginRoute && <MobileBottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AppLayout>
            <Routes>
              {/* Public Customer Login */}
              <Route path="/login" element={<CustomerLoginPage />} />

              {/* Protected Customer Routes */}
              <Route path="/" element={<ProtectedCustomerRoute><HomePage /></ProtectedCustomerRoute>} />
              <Route path="/categories" element={<ProtectedCustomerRoute><CategoriesPage /></ProtectedCustomerRoute>} />
              <Route path="/products" element={<ProtectedCustomerRoute><ProductsPage /></ProtectedCustomerRoute>} />
              <Route path="/product/:id" element={<ProtectedCustomerRoute><ProductDetailsPage /></ProtectedCustomerRoute>} />
              <Route path="/cart" element={<ProtectedCustomerRoute><CartPage /></ProtectedCustomerRoute>} />
              <Route path="/checkout" element={<ProtectedCustomerRoute><CheckoutPage /></ProtectedCustomerRoute>} />
              <Route path="/my-orders" element={<ProtectedCustomerRoute><MyOrdersPage /></ProtectedCustomerRoute>} />
              <Route path="/profile" element={<ProtectedCustomerRoute><CustomerProfilePage /></ProtectedCustomerRoute>} />
              <Route path="/contact" element={<ProtectedCustomerRoute><ContactPage /></ProtectedCustomerRoute>} />

              {/* Standalone Admin Login */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Protected Admin Dashboard Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="messages" element={<AdminMessagesPage />} />
              </Route>

              {/* Fallback Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
