import React from 'react';
import { CheckCircle2, Circle, AlertCircle, Clock } from 'lucide-react';

const STEPS = [
  { key: 'POSTED', label: 'Surplus Posted' },
  { key: 'MATCHED', label: 'Shelter Matched' },
  { key: 'DRIVER_ASSIGNED', label: 'Driver Assigned' },
  { key: 'PICKUP_STARTED', label: 'Pickup Started' },
  { key: 'PICKED_UP', label: 'Food Picked Up' },
  { key: 'IN_TRANSIT', label: 'In Transit' },
  { key: 'DELIVERED', label: 'Delivered' }
];

export default function StatusTimeline({ currentStatus, statusHistory = [] }) {
  const currentIndex = STEPS.findIndex(s => s.key === currentStatus);
  const isTerminalNegative = ['REJECTED', 'CANCELLED', 'EXPIRED'].includes(currentStatus);

  return (
    <div className="w-full py-4">
      {isTerminalNegative ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3 text-red-800">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-sm">Status Terminated: {currentStatus}</h4>
            <p className="text-xs text-red-600 mt-0.5">
              This donation flow concluded prematurely or required re-routing.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto pb-2">
          <div className="flex items-center justify-between min-w-[650px] relative">
            {/* Progress line */}
            <div className="absolute top-4 left-6 right-6 h-1 bg-slate-200 -z-0" />
            <div
              className="absolute top-4 left-6 h-1 bg-emerald-500 transition-all duration-500 -z-0"
              style={{
                width: `${currentIndex >= 0 ? (currentIndex / (STEPS.length - 1)) * 95 : 0}%`
              }}
            />

            {STEPS.map((step, idx) => {
              const isCompleted = currentIndex > idx;
              const isCurrent = currentIndex === idx;

              return (
                <div key={step.key} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isCompleted
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                        : isCurrent
                        ? 'bg-emerald-500 text-white ring-4 ring-emerald-100 shadow-lg'
                        : 'bg-white border-2 border-slate-300 text-slate-400'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isCurrent ? (
                      <span className="animate-pulse">●</span>
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span
                    className={`text-xs mt-2 text-center font-medium max-w-[80px] ${
                      isCurrent
                        ? 'text-emerald-700 font-bold'
                        : isCompleted
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
