import React from 'react';
import { CheckCircle2, Clock, PackageCheck, Truck, Check, XCircle } from 'lucide-react';

export default function OrderStatusTracker({ status, updatedAt }) {
  if (status === 'Cancelled') {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center">
        <div className="flex justify-center mb-2">
          <XCircle className="w-8 h-8 text-rose-600" />
        </div>
        <h4 className="text-sm font-bold text-rose-800">Order Cancelled</h4>
        <p className="text-xs text-rose-600 mt-1">This order has been cancelled by Natural Blend store admin.</p>
      </div>
    );
  }

  const steps = [
    { key: 'Pending', label: 'Order Placed', icon: Clock },
    { key: 'Confirmed', label: 'Confirmed', icon: CheckCircle2 },
    { key: 'Packed', label: 'Packed', icon: PackageCheck },
    { key: 'Out for Delivery', label: 'Out for Delivery', icon: Truck },
    { key: 'Delivered', label: 'Delivered', icon: CheckCircle2 }
  ];

  const getStepIndex = (st) => {
    switch (st) {
      case 'Pending': return 0;
      case 'Confirmed': return 1;
      case 'Packed': return 2;
      case 'Out for Delivery': return 3;
      case 'Delivered': return 4;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(status);
  const isDelivered = status === 'Delivered';

  return (
    <div className="space-y-4">
      {/* Progress Bar Steps */}
      <div className="relative flex items-center justify-between">
        {/* Background track line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 z-0" />

        {/* Active progress line */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-600 transition-all duration-500 z-0"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const StepIcon = step.icon;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${isDone
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-xs'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}
              >
                {isDone ? <Check className="w-5 h-5" /> : <StepIcon className="w-4 h-4" />}
              </div>
              <span className={`text-[11px] font-bold mt-2 text-center max-w-[70px] ${isCurrent ? 'text-emerald-800 font-extrabold' : isDone ? 'text-slate-700' : 'text-slate-400'
                }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Completion Banner */}
      {isDelivered && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center animate-fade-in">
          <p className="text-sm font-extrabold text-emerald-900">
            Your order has been delivered ✅
          </p>
          {updatedAt && (
            <p className="text-xs text-emerald-700 mt-0.5">
              Delivered on: {new Date(updatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
