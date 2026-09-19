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
    { key: 'Pending', label: 'Placed', fullLabel: 'Order Placed', icon: Clock },
    { key: 'Confirmed', label: 'Confirmed', fullLabel: 'Confirmed', icon: CheckCircle2 },
    { key: 'Packed', label: 'Packed', fullLabel: 'Packed', icon: PackageCheck },
    { key: 'Out for Delivery', label: 'Dispatched', fullLabel: 'Out for Delivery', icon: Truck },
    { key: 'Delivered', label: 'Delivered', fullLabel: 'Delivered', icon: CheckCircle2 }
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
    <div className="space-y-4 font-sans">
      {/* Progress Bar Steps */}
      <div className="relative flex items-start justify-between pt-1">
        {/* Background track line - anchored exactly to circle icon center */}
        <div className="absolute left-[10%] right-[10%] top-[14px] sm:top-[18px] h-1 bg-slate-200 z-0" />

        {/* Active progress line */}
        <div
          className="absolute left-[10%] top-[14px] sm:top-[18px] h-1 bg-emerald-600 transition-all duration-500 z-0"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 80}%` }}
        />

        {steps.map((step, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const StepIcon = step.icon;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center group flex-1 min-w-0">
              <div
                className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-300 ${isDone
                    ? 'bg-emerald-600 text-white ring-2 sm:ring-4 ring-emerald-100 shadow-xs'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5 sm:w-5 sm:h-5" /> : <StepIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </div>
              <span className={`text-[9px] sm:text-[11px] font-bold mt-1.5 text-center leading-tight px-0.5 ${isCurrent ? 'text-emerald-800 font-extrabold' : isDone ? 'text-slate-700' : 'text-slate-400'
                }`}>
                <span className="sm:hidden block truncate">{step.label}</span>
                <span className="hidden sm:inline">{step.fullLabel}</span>
              </span>
            </div>
          );
        })}
      </div>

      {/* Completion Banner */}
      {isDelivered && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center animate-fade-in">
          <p className="text-xs sm:text-sm font-extrabold text-emerald-900">
            Your order has been delivered ✅
          </p>
          {updatedAt && (
            <p className="text-[10px] sm:text-xs text-emerald-700 mt-0.5">
              Delivered on: {new Date(updatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
