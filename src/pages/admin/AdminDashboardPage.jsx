import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  Clock,
  CheckCircle2,
  MessageSquare,
  ArrowRight,
  Bell,
  Eye,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { getAllProducts } from '../../services/productService';
import { subscribeToOrders } from '../../services/orderService';
import { subscribeToMessages } from '../../services/messageService';

export default function AdminDashboardPage() {
  const [productsCount, setProductsCount] = useState(0);
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const prodList = await getAllProducts();
        setProductsCount(prodList.length);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();

    const unsubOrders = subscribeToOrders((orderList) => {
      setOrders(orderList);
    });

    const unsubMessages = subscribeToMessages((msgList) => {
      setMessages(msgList);
    });

    return () => {
      if (unsubOrders) unsubOrders();
      if (unsubMessages) unsubMessages();
    };
  }, []);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
  const newMessages = messages.filter(m => m.status === 'New').length;
  const newOrdersUnseen = orders.filter(o => o.seenByAdmin === false);

  return (
    <div className="space-y-8">
      {/* Top Banner / Notification */}
      {newOrdersUnseen.length > 0 && (
        <div className="bg-amber-500 text-slate-950 p-4 rounded-3xl shadow-md flex items-center justify-between gap-4 animate-bounce">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-950 text-amber-400 rounded-2xl flex items-center justify-center font-bold">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm">🔴 {newOrdersUnseen.length} NEW ORDER RECEIVED</h3>
              <p className="text-xs font-semibold text-slate-900">
                Latest order #{newOrdersUnseen[0]?.orderId} by {newOrdersUnseen[0]?.customerName} (₹{newOrdersUnseen[0]?.grandTotal})
              </p>
            </div>
          </div>
          <Link
            to="/admin/orders"
            className="bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shrink-0 transition-colors"
          >
            View Orders
          </Link>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Store overview metrics, recent customer orders, and messages.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Products */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900">{productsCount}</span>
            <span className="text-xs font-bold text-slate-500 block">Total Products</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900">{totalOrders}</span>
            <span className="text-xs font-bold text-slate-500 block">Total Orders</span>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-amber-600">{pendingOrders}</span>
            <span className="text-xs font-bold text-slate-500 block">Pending Orders</span>
          </div>
        </div>

        {/* Delivered Orders */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-teal-600">{deliveredOrders}</span>
            <span className="text-xs font-bold text-slate-500 block">Delivered Orders</span>
          </div>
        </div>

        {/* New Messages */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2 col-span-2 lg:col-span-1">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-purple-600">{newMessages}</span>
            <span className="text-xs font-bold text-slate-500 block">New Messages</span>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Recent Customer Orders</h2>
            <p className="text-xs text-slate-500">Manage order status and customer details</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            View All Orders ({orders.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No customer orders placed yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-2">Order ID</th>
                  <th className="py-3 px-2">Customer</th>
                  <th className="py-3 px-2">Phone</th>
                  <th className="py-3 px-2">Grand Total</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id || order.orderId} className="hover:bg-slate-50">
                    <td className="py-3 px-2 font-black text-slate-900">#{order.orderId}</td>
                    <td className="py-3 px-2 text-slate-800">{order.customerName}</td>
                    <td className="py-3 px-2 text-slate-600">{order.phone}</td>
                    <td className="py-3 px-2 font-black text-emerald-950">₹{order.grandTotal}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${order.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                          order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                            order.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' :
                              'bg-blue-100 text-blue-800'
                        }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <Link
                        to="/admin/orders"
                        className="bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
