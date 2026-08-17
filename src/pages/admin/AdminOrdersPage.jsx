import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Filter,
  Eye,
  X,
  Check,
  Clock,
  Truck,
  Package,
  XCircle,
  Phone,
  MapPin,
  User,
  Calendar,
  Loader2,
  Trash2,
  RotateCcw
} from 'lucide-react';
import {
  subscribeToOrders,
  updateOrderStatus,
  markOrderSeen,
  deleteOrder,
  restoreOrder,
  updateOrderDetails
} from '../../services/orderService';
import { db, doc, updateDoc } from '../../firebase/config';
import { calculateDeliveryCharge } from '../../utils/delivery';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Undo State Management
  const [undoAction, setUndoAction] = useState(null);
  const countdownTimerRef = useRef(null);

  useEffect(() => {
    const unsubscribe = subscribeToOrders((list) => {
      setOrders(list);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  const handleViewOrder = async (order) => {
    setSelectedOrder(order);
    if (order.seenByAdmin === false) {
      await markOrderSeen(order.id || order.orderId);
    }
  };

  const handleStatusChange = async (orderIdOrDocId, newStatus) => {
    const targetOrder = orders.find(o => (o.id === orderIdOrDocId || o.orderId === orderIdOrDocId));
    if (targetOrder && targetOrder.status === 'Cancelled') {
      alert('This order has been cancelled and cannot be changed.');
      return;
    }

    setUpdating(true);
    try {
      await updateOrderStatus(orderIdOrDocId, newStatus);
      if (selectedOrder && (selectedOrder.id === orderIdOrDocId || selectedOrder.orderId === orderIdOrDocId)) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      alert(err.message || 'Failed to update order status.');
    } finally {
      setUpdating(false);
    }
  };

  // --- DELETE ORDER WITH 10s UNDO ---
  const handleDeleteOrderClick = async (orderToDelete) => {
    if (undoAction) {
      setUndoAction(null);
    }

    const targetId = orderToDelete.id || orderToDelete.orderId;

    // 1. Hide order locally in UI
    setOrders(prev => prev.filter(o => (o.id || o.orderId) !== targetId));
    if (selectedOrder && (selectedOrder.id === targetId || selectedOrder.orderId === targetId)) {
      setSelectedOrder(null);
    }

    // 2. Immediately delete from Firestore & LocalStorage so page refresh never resurrects it!
    try {
      await deleteOrder(targetId);
    } catch (err) {
      console.error('Error deleting order:', err);
    }

    // 3. Setup 10-second countdown for UNDO
    let seconds = 10;
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    const timer = setInterval(() => {
      seconds -= 1;
      if (seconds <= 0) {
        clearInterval(timer);
        setUndoAction(null);
      } else {
        setUndoAction(prev => prev ? { ...prev, countdown: seconds } : null);
      }
    }, 1000);

    countdownTimerRef.current = timer;
    setUndoAction({
      type: 'DELETE_ORDER',
      order: orderToDelete,
      countdown: 10
    });
  };

  // --- DELETE INDIVIDUAL ITEM WITH 10s UNDO ---
  const handleDeleteItemClick = async (itemIndexToDelete) => {
    if (!selectedOrder) return;

    if (undoAction) {
      setUndoAction(null);
    }

    const originalOrder = { ...selectedOrder };
    const updatedItems = selectedOrder.items.filter((_, idx) => idx !== itemIndexToDelete);

    // Recalculate Totals
    const newProdTotal = updatedItems.reduce((sum, i) => sum + (i.priceAtPurchase * i.quantity), 0);
    const newWeight = updatedItems.reduce((sum, i) => sum + (i.shippingWeightGrams ? i.shippingWeightGrams * i.quantity : 0), 0);
    const newDelivery = calculateDeliveryCharge(newWeight);
    const newGrandTotal = newProdTotal + newDelivery;

    const newOrderState = {
      ...selectedOrder,
      items: updatedItems,
      productTotal: newProdTotal,
      totalWeight: newWeight,
      deliveryCharge: newDelivery,
      grandTotal: newGrandTotal
    };

    // 1. Update local UI state
    setSelectedOrder(newOrderState);
    setOrders(prev => prev.map(o => (o.id === selectedOrder.id || o.orderId === selectedOrder.orderId) ? newOrderState : o));

    // 2. Immediately update Firestore & LocalStorage
    try {
      await updateOrderDetails(selectedOrder.id || selectedOrder.orderId, {
        items: updatedItems,
        productTotal: newProdTotal,
        totalWeight: newWeight,
        deliveryCharge: newDelivery,
        grandTotal: newGrandTotal
      });
    } catch (e) {
      console.error('Error updating order items in database:', e);
    }

    // 3. Setup 10-second countdown for UNDO
    let seconds = 10;
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    const timer = setInterval(() => {
      seconds -= 1;
      if (seconds <= 0) {
        clearInterval(timer);
        setUndoAction(null);
      } else {
        setUndoAction(prev => prev ? { ...prev, countdown: seconds } : null);
      }
    }, 1000);

    countdownTimerRef.current = timer;

    setUndoAction({
      type: 'DELETE_ITEM',
      originalOrder: originalOrder,
      newOrder: newOrderState,
      itemLabel: selectedOrder.items[itemIndexToDelete]?.productName || 'Item',
      countdown: 10
    });
  };

  // --- UNDO ACTION ---
  const handleUndo = async () => {
    if (!undoAction) return;

    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }

    if (undoAction.type === 'DELETE_ORDER') {
      const restoredOrder = undoAction.order;
      setOrders(prev => [restoredOrder, ...prev].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setUndoAction(null);

      try {
        await restoreOrder(restoredOrder);
      } catch (e) {
        console.error('Error restoring deleted order:', e);
      }
    } else if (undoAction.type === 'DELETE_ITEM') {
      const origOrder = undoAction.originalOrder;
      setSelectedOrder(origOrder);
      setOrders(prev => prev.map(o =>
        (o.id === origOrder.id || o.orderId === origOrder.orderId) ? origOrder : o
      ));
      setUndoAction(null);

      try {
        await updateOrderDetails(origOrder.id || origOrder.orderId, {
          items: origOrder.items,
          productTotal: origOrder.productTotal,
          totalWeight: origOrder.totalWeight,
          deliveryCharge: origOrder.deliveryCharge,
          grandTotal: origOrder.grandTotal
        });
      } catch (e) {
        console.error('Error restoring order items:', e);
      }
    }
  };

  const statusOptions = ['Pending', 'Confirmed', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'];

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || (
      (order.orderId && order.orderId.toLowerCase().includes(term)) ||
      (order.customerName && order.customerName.toLowerCase().includes(term)) ||
      (order.phone && order.phone.toLowerCase().includes(term))
    );
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-16 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Manage Orders</h1>
          <p className="text-xs text-slate-500 mt-0.5">Filter, view customer details, update status, or delete orders/items with 10s Undo.</p>
        </div>

        {/* Search */}
        <div className="w-full md:w-72 relative">
          <input
            type="text"
            placeholder="Search Order ID, name, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-2 pl-3.5 pr-9 text-xs focus:outline-none focus:border-emerald-500"
          />
          {searchTerm ? (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          )}
        </div>
      </div>

      {/* Floating 10s Undo Notification Toast */}
      {undoAction && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 text-xs border border-slate-700 animate-bounce">
          <span>
            {undoAction.type === 'DELETE_ORDER' ? (
              <>Order <strong>#{undoAction.order.orderId}</strong> deleted.</>
            ) : (
              <>Item <strong>"{undoAction.itemLabel}"</strong> removed.</>
            )}
          </span>
          <button
            onClick={handleUndo}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-md"
          >
            <RotateCcw className="w-4 h-4" /> UNDO ({undoAction.countdown}s)
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setStatusFilter('All')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${statusFilter === 'All'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
        >
          All Orders ({orders.length})
        </button>

        {statusOptions.map(st => {
          const count = orders.filter(o => o.status === st).length;
          return (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${statusFilter === st
                  ? 'bg-emerald-700 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
            >
              {st} ({count})
            </button>
          );
        })}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No orders found matching filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Items Total</th>
                  <th className="py-3 px-4">Delivery</th>
                  <th className="py-3 px-4">Grand Total</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredOrders.map(order => (
                  <tr key={order.id || order.orderId} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      #{order.orderId}
                      {order.seenByAdmin === false && (
                        <span className="ml-1.5 bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full animate-pulse">
                          NEW
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 font-bold">{order.customerName}</td>
                    <td className="py-3.5 px-4 text-slate-600">{order.phone}</td>
                    <td className="py-3.5 px-4 text-slate-800">₹{order.productTotal}</td>
                    <td className="py-3.5 px-4 text-emerald-700 font-bold">₹{order.deliveryCharge}</td>
                    <td className="py-3.5 px-4 font-black text-emerald-950">₹{order.grandTotal}</td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      {order.status === 'Cancelled' ? (
                        <div className="inline-flex items-center gap-1.5 bg-rose-50 text-[#C94A4A] border border-rose-200 px-2.5 py-1 rounded-lg text-[11px] font-extrabold cursor-not-allowed shadow-2xs" title="This order has been cancelled and cannot be changed.">
                          <XCircle className="w-3.5 h-3.5 text-[#C94A4A]" />
                          <span>Cancelled 🔒</span>
                        </div>
                      ) : (
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id || order.orderId, e.target.value)}
                          disabled={updating}
                          className={`text-[11px] font-bold rounded-lg border px-2 py-1 focus:outline-none transition-all ${
                            order.status === 'Pending' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                              order.status === 'Delivered' ? 'bg-[#DDEFE6] text-[#0D4A35] border-[#DCE6E0]' :
                                'bg-blue-50 text-blue-800 border-blue-200'
                            }`}
                        >
                          {statusOptions.map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1 shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>

                      <button
                        onClick={() => handleDeleteOrderClick(order)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1 shadow-xs"
                        title="Delete Order with 10s Undo option"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl animate-fade-in">

            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Order #{selectedOrder.orderId}</h3>
                <p className="text-xs text-slate-500">
                  Placed on: {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cancelled Locked Notice Banner */}
            {selectedOrder.status === 'Cancelled' && (
              <div className="bg-rose-50 border border-rose-200 text-[#C94A4A] text-xs p-3.5 rounded-2xl flex items-center justify-between font-bold animate-fade-in">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-[#C94A4A] shrink-0" />
                  <span>This order has been cancelled and cannot be changed.</span>
                </div>
                <span className="bg-rose-100 text-[#C94A4A] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-rose-200">
                  Locked 🔒
                </span>
              </div>
            )}

            {/* Customer Details */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-600" /> Customer Information
              </h4>
              <p><strong>Name:</strong> {selectedOrder.customerName}</p>
              <p><strong>Phone:</strong> {selectedOrder.phone}</p>
              <p><strong>Address:</strong> {selectedOrder.address}, {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}</p>
            </div>

            {/* Product Items Snapshot with Item Delete Options */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-900">Purchased Products ({selectedOrder.items?.length || 0}):</h4>
                <span className="text-[11px] text-slate-400">Click 🗑️ to delete an item (10s Undo available)</span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100 group">
                    <div className="flex items-center gap-3">
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt={item.productName} className="w-10 h-10 object-contain rounded bg-white p-1" />
                      )}
                      <div>
                        <strong className="text-slate-900 block">{item.productName}</strong>
                        <span className="text-slate-500">
                          Price at purchase: ₹{item.priceAtPurchase} x {item.quantity}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <strong className="text-slate-900">₹{item.priceAtPurchase * item.quantity}</strong>
                      <button
                        onClick={() => handleDeleteItemClick(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete item from this order with 10s Undo option"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary Snapshot */}
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Product Total:</span>
                <strong>₹{selectedOrder.productTotal}</strong>
              </div>
              <div className="flex justify-between">
                <span>Total Shipping Weight:</span>
                <strong>
                  {selectedOrder.totalWeight >= 1000 ? `${(selectedOrder.totalWeight / 1000).toFixed(2)} kg` : `${selectedOrder.totalWeight} g`}
                </strong>
              </div>
              <div className="flex justify-between text-emerald-800 font-bold">
                <span>Delivery Charge:</span>
                <span>₹{selectedOrder.deliveryCharge}</span>
              </div>
              <div className="pt-2 border-t border-emerald-200 flex justify-between items-center text-sm font-extrabold text-emerald-950">
                <span>Grand Total:</span>
                <span>₹{selectedOrder.grandTotal}</span>
              </div>
            </div>

            {/* Status & Delete Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Status:</label>
                {selectedOrder.status === 'Cancelled' ? (
                  <div className="bg-rose-50 text-[#C94A4A] border border-rose-200 rounded-xl px-3 py-2 text-xs font-extrabold flex items-center gap-1.5 cursor-not-allowed">
                    <XCircle className="w-4 h-4 text-[#C94A4A]" />
                    <span>Cancelled (Permanently Locked 🔒)</span>
                  </div>
                ) : (
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id || selectedOrder.orderId, e.target.value)}
                    disabled={updating}
                    className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 w-full sm:w-auto"
                  >
                    {statusOptions.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                )}
              </div>

              <button
                onClick={() => handleDeleteOrderClick(selectedOrder)}
                className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Trash2 className="w-4 h-4" /> Delete Entire Order
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
