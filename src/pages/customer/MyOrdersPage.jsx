import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Calendar,
  ShoppingBag,
  ArrowRight,
  Loader2,
  Lock,
  AlertCircle,
  Trash2,
  RotateCcw
} from 'lucide-react';
import OrderStatusTracker from '../../components/customer/OrderStatusTracker';
import { getCustomerOrders, subscribeToCustomerOrders, deleteOrder, restoreOrder } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';

export default function MyOrdersPage() {
  const { isCustomerLoggedIn, customerUser } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Undo State
  const [undoState, setUndoState] = useState(null);
  const countdownIntervalRef = useRef(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!isCustomerLoggedIn) {
      navigate('/login', { state: { from: '/my-orders' }, replace: true });
    }
  }, [isCustomerLoggedIn, navigate]);

  // Realtime subscription to customer orders
  useEffect(() => {
    if (!customerUser || !customerUser.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToCustomerOrders(customerUser.uid, (list) => {
      setOrders(list);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [customerUser]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  const handleDeleteClick = async (orderToDelete, index) => {
    if (undoState) {
      setUndoState(null);
    }

    const targetId = orderToDelete.id || orderToDelete.orderId;

    // 1. Hide order locally in UI
    setOrders(prev => prev.filter(o => (o.id || o.orderId) !== targetId));

    // 2. Immediately delete from Firestore & LocalStorage so page refresh never resurrects it!
    try {
      await deleteOrder(targetId);
    } catch (err) {
      console.error('Error deleting order:', err);
    }

    // 3. Setup 10-second countdown for UNDO
    let secondsLeft = 10;
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    const intervalId = setInterval(() => {
      secondsLeft -= 1;
      if (secondsLeft <= 0) {
        clearInterval(intervalId);
        setUndoState(null);
      } else {
        setUndoState(prev => prev ? { ...prev, countdown: secondsLeft } : null);
      }
    }, 1000);

    countdownIntervalRef.current = intervalId;

    setUndoState({
      order: orderToDelete,
      index: index,
      countdown: 10
    });
  };

  const handleUndo = async () => {
    if (!undoState) return;

    const orderToRestore = undoState.order;

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    // Restore order to list
    setOrders(prev => {
      const restored = [...prev];
      restored.splice(undoState.index, 0, orderToRestore);
      return restored;
    });

    setUndoState(null);

    // Re-create order in Firestore & LocalStorage
    try {
      await restoreOrder(orderToRestore);
    } catch (err) {
      console.error('Error restoring order via UNDO:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 relative font-sans text-[#17251F]">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DCE6E0] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#DDEFE6] text-[#176B4D] rounded-2xl flex items-center justify-center shrink-0 border border-[#DCE6E0]">
            <Package className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D4A35] tracking-tight">
              My Orders & Tracking
            </h1>
            <p className="text-xs text-[#64756D] mt-0.5">
              Order history for authenticated account ({customerUser?.email})
            </p>
          </div>
        </div>

        <span className="bg-[#DDEFE6] text-[#0D4A35] text-xs font-bold px-3 py-1.5 rounded-full border border-[#DCE6E0] flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-[#176B4D]" /> Private Account Access
        </span>
      </div>

      {/* Undo Floating Notification Banner (10s countdown) */}
      {undoState && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0D4A35] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 text-xs border border-[#176B4D] animate-bounce">
          <span>Order <strong>#{undoState.order.orderId}</strong> deleted.</span>
          <button
            onClick={handleUndo}
            className="bg-[#176B4D] hover:bg-emerald-700 text-white font-black px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-md"
          >
            <RotateCcw className="w-4 h-4 text-[#C89B3C]" /> UNDO ({undoState.countdown}s)
          </button>
        </div>
      )}

      {/* Orders List / Empty State */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-48 bg-[#F8FAF6] rounded-3xl border border-[#DCE6E0]" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#DCE6E0] shadow-xs max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 bg-[#F8FAF6] text-[#64756D] rounded-full flex items-center justify-center mx-auto border border-[#DCE6E0]">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#0D4A35]">
              You haven't placed any orders yet
            </h3>
            <p className="text-xs text-[#64756D] mt-1">
              Start shopping our natural care catalog today!
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-[#176B4D] hover:bg-[#0D4A35] text-white text-xs font-bold px-6 py-3 rounded-2xl transition-colors"
          >
            Start Shopping <ArrowRight className="w-4 h-4 text-[#C89B3C]" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order, idx) => (
            <div
              key={order.id || order.orderId}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DCE6E0] shadow-xs space-y-6"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#DCE6E0] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-[#0D4A35]">Order #{order.orderId}</span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${order.status === 'Pending' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                      order.status === 'Delivered' ? 'bg-[#DDEFE6] text-[#0D4A35] border-[#DCE6E0]' :
                        order.status === 'Cancelled' ? 'bg-rose-50 text-[#C94A4A] border-rose-200' :
                          'bg-blue-50 text-blue-800 border-blue-200'
                      }`}>
                      {order.status === 'Cancelled' ? 'Cancelled 🔒' : order.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#64756D] flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" /> Placed on: {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-[#64756D] block">Grand Total</span>
                    <span className="text-xl font-black text-[#176B4D]">₹{order.grandTotal}</span>
                  </div>

                  {/* Customer Delete Button with 10s Undo */}
                  <button
                    onClick={() => handleDeleteClick(order, idx)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Delete this order (10s Undo)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status Tracker */}
              <OrderStatusTracker status={order.status} updatedAt={order.updatedAt} />

              {/* Items Summary Table */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3 text-xs">
                <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2">Order Items:</h4>
                <div className="space-y-2">
                  {order.items && order.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="flex justify-between items-center text-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-[11px] text-emerald-800 shrink-0">
                          {item.quantity}
                        </span>
                        <span className="font-semibold line-clamp-1">{item.productName}</span>
                      </div>
                      <span className="font-bold text-slate-900 shrink-0">₹{item.priceAtPurchase * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Financial Summary */}
                <div className="pt-3 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Product Total</span>
                    <strong className="text-slate-800">₹{order.productTotal}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Delivery Charge</span>
                    <strong className="text-emerald-800">₹{order.deliveryCharge}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Total Weight</span>
                    <strong className="text-slate-800">
                      {order.totalWeight >= 1000 ? `${(order.totalWeight / 1000).toFixed(2)} kg` : `${order.totalWeight} g`}
                    </strong>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
